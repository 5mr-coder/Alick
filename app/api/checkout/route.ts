import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.number().int().min(1).max(100),
      })
    )
    .min(1, 'Cart is empty')
    .max(100, 'Too many cart lines'),
  salesMode: z.enum(['consumer', 'retail']),
  shippingZone: z.string().trim().min(1, 'Please select a delivery zone').max(60),
  customer: z.object({
    name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(120),
    email: z.string().trim().email('Please enter a valid email address').max(150),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+() -]{7,30}$/, 'Please enter a valid phone number'),
  }),
  address: z.object({
    street: z.string().trim().min(3, 'Delivery address is required').max(250),
    city: z.string().trim().max(100).optional().default(''),
    state: z.string().trim().max(100).optional().default(''),
    landmark: z.string().trim().max(150).optional().default(''),
  }),
  notes: z.string().trim().max(500).optional().default(''),
});

export async function POST(req: NextRequest) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY?.trim() ?? '';

  if (!paystackSecret) {
    return NextResponse.json({ mode: 'whatsapp_only' });
  }

  if (
    process.env.NODE_ENV === 'production' &&
    paystackSecret.startsWith('sk_test_')
  ) {
    console.error('[checkout] Refusing to use sk_test_ Paystack key in production');
    return NextResponse.json(
      { error: 'Payment gateway is misconfigured.' },
      { status: 500 }
    );
  }

  const ip = await getClientIp();
  const allowed = await enforceRateLimit(`checkout:ip:${ip}`, 10, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many checkout attempts. Please wait a minute and try again.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid checkout details.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { items, salesMode, shippingZone, customer, address, notes } = parsed.data;

  // Deduplicate by productId and enforce consumer (1-9) / retail (10-100) bounds
  const qtyByProduct = new Map<string, number>();
  for (const item of items) {
    qtyByProduct.set(
      item.productId,
      (qtyByProduct.get(item.productId) ?? 0) + item.quantity
    );
  }

  if (qtyByProduct.size < 1 || qtyByProduct.size > 25) {
    return NextResponse.json(
      { error: 'An order must contain between 1 and 25 distinct products.' },
      { status: 400 }
    );
  }

  const minQty = salesMode === 'consumer' ? 1 : 10;
  const maxQty = salesMode === 'consumer' ? 9 : 100;

  for (const [, qty] of qtyByProduct) {
    if (qty < minQty || qty > maxQty) {
      return NextResponse.json(
        {
          error: `Each product quantity must be between ${minQty} and ${maxQty} for ${salesMode} orders.`,
        },
        { status: 400 }
      );
    }
  }

  const rpcItems = Array.from(qtyByProduct.entries()).map(
    ([product_id, quantity]) => ({ product_id, quantity })
  );

  const admin = createAdminClient();

  const { data: orderRows, error: rpcError } = await admin.rpc(
    'create_checkout_order',
    {
      p_items: rpcItems,
      p_sales_mode: salesMode,
      p_shipping_zone: shippingZone,
      p_customer_name: customer.name,
      p_customer_email: customer.email,
      p_customer_phone: customer.phone,
      p_shipping_address: address,
      p_notes: notes || null,
    }
  );

  if (rpcError || !Array.isArray(orderRows) || orderRows.length === 0) {
    console.error('[checkout] create_checkout_order failed:', rpcError?.message);
    return NextResponse.json(
      { error: rpcError?.message || 'Unable to create order.' },
      { status: 400 }
    );
  }

  const createdOrder = orderRows[0] as {
    order_id: string;
    order_number: string;
    total_amount: number;
    currency: string;
  };

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || req.nextUrl.origin
  ).replace(/\/+$/, '');
  const callbackUrl = `${siteUrl}/checkout/success`;

  try {
    const paystackRes = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customer.email.toLowerCase(),
          amount: Number(createdOrder.total_amount),
          currency: 'NGN',
          callback_url: callbackUrl,
          metadata: {
            order_id: createdOrder.order_id,
            order_number: createdOrder.order_number,
          },
        }),
      }
    );

    const paystackJson = (await paystackRes.json()) as {
      status?: boolean;
      message?: string;
      data?: {
        authorization_url?: string;
        access_code?: string;
        reference?: string;
      };
    };

    if (
      !paystackRes.ok ||
      !paystackJson.status ||
      !paystackJson.data?.authorization_url ||
      !paystackJson.data?.reference
    ) {
      console.error('[checkout] Paystack initialize failed:', paystackJson.message);
      await admin
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', createdOrder.order_id);

      return NextResponse.json(
        { error: 'Could not initialize payment with Paystack. Please try again.' },
        { status: 502 }
      );
    }

    const { error: bindError } = await admin
      .from('orders')
      .update({ payment_reference: paystackJson.data.reference })
      .eq('id', createdOrder.order_id);

    if (bindError) {
      console.error('[checkout] Failed to bind payment_reference:', bindError.message);
      await admin
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', createdOrder.order_id);
      return NextResponse.json(
        { error: 'Failed to prepare payment session. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      mode: 'paystack',
      authorization_url: paystackJson.data.authorization_url,
      order_number: createdOrder.order_number,
      reference: paystackJson.data.reference,
    });
  } catch (err) {
    console.error('[checkout] Paystack request error:', err);
    await admin
      .from('orders')
      .update({ payment_status: 'failed' })
      .eq('id', createdOrder.order_id);
    return NextResponse.json(
      { error: 'Payment gateway is unreachable. Please try again.' },
      { status: 502 }
    );
  }
}
