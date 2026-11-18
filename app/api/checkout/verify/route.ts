import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';

const REF_REGEX = /^[A-Za-z0-9._=-]{1,100}$/;

const ALERT_STATUSES = new Set([
  'duplicate_payment',
  'duplicate_reference',
  'reference_mismatch',
  'amount_mismatch',
]);

export async function GET(req: NextRequest) {
  const ip = await getClientIp();
  const allowed = await enforceRateLimit(`verify:ip:${ip}`, 20, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many verification requests. Please wait a moment.' },
      { status: 429 }
    );
  }

  const reference = req.nextUrl.searchParams.get('reference')?.trim() ?? '';
  if (!REF_REGEX.test(reference)) {
    return NextResponse.json(
      { error: 'Invalid payment reference.' },
      { status: 400 }
    );
  }

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY?.trim() ?? '';
  if (!paystackSecret) {
    return NextResponse.json(
      { error: 'Paystack is not configured.' },
      { status: 503 }
    );
  }

  if (
    process.env.NODE_ENV === 'production' &&
    paystackSecret.startsWith('sk_test_')
  ) {
    console.error('[checkout/verify] Refusing sk_test_ key in production');
    return NextResponse.json(
      { error: 'Payment gateway misconfigured.' },
      { status: 500 }
    );
  }

  const admin = createAdminClient();
  const { data: order, error: orderError } = await admin
    .from('orders')
    .select(
      'id, order_number, payment_status, fulfillment_status, total_amount, currency, payment_reference, created_at'
    )
    .eq('payment_reference', reference)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  let paystackJson: {
    status?: boolean;
    message?: string;
    data?: {
      status?: string;
      reference?: string;
      amount?: number;
      currency?: string;
      domain?: string;
    };
  };

  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
        },
        cache: 'no-store',
      }
    );
    paystackJson = await paystackRes.json();
  } catch (err) {
    console.error('[checkout/verify] Paystack verify network error:', err);
    return NextResponse.json(
      { error: 'Unable to reach Paystack for verification.' },
      { status: 502 }
    );
  }

  if (!paystackJson.status || !paystackJson.data) {
    return NextResponse.json(
      {
        status: order.payment_status,
        order: {
          order_number: order.order_number,
          payment_status: order.payment_status,
          fulfillment_status: order.fulfillment_status,
          total_amount: Number(order.total_amount),
          currency: order.currency,
        },
      },
      { status: 200 }
    );
  }

  const tx = paystackJson.data;

  if (process.env.NODE_ENV === 'production' && tx.domain !== 'live') {
    console.error('[SECURITY ALERT] Non-live Paystack transaction verify in prod:', {
      domain: tx.domain,
      reference,
      orderId: order.id,
    });
    return NextResponse.json(
      { error: 'Test transactions are not accepted in production.' },
      { status: 400 }
    );
  }

  if (tx.reference !== order.payment_reference) {
    console.error('[SECURITY ALERT] Paystack reference mismatch:', {
      expected: order.payment_reference,
      received: tx.reference,
      orderId: order.id,
    });
    return NextResponse.json(
      { error: 'Payment reference mismatch.' },
      { status: 400 }
    );
  }

  let fulfillStatus = order.payment_status as string;

  if (tx.status === 'success') {
    const { data: rpcResult, error: fulfillError } = await admin.rpc(
      'fulfill_paid_order',
      {
        p_order_id: order.id,
        p_payment_reference: tx.reference,
        p_paid_amount: Number(tx.amount),
        p_currency: String(tx.currency || 'NGN'),
      }
    );

    if (fulfillError) {
      console.error('[checkout/verify] fulfill_paid_order error:', fulfillError.message);
      return NextResponse.json(
        { error: 'Order fulfillment failed.' },
        { status: 500 }
      );
    }

    fulfillStatus = String(rpcResult);

    if (ALERT_STATUSES.has(fulfillStatus)) {
      console.error('[SECURITY ALERT] Paystack verify fulfillment anomaly:', {
        fulfillStatus,
        orderId: order.id,
        orderNumber: order.order_number,
        reference: tx.reference,
        amount: tx.amount,
        currency: tx.currency,
      });
    }
  } else {
    fulfillStatus = tx.status || order.payment_status;
  }

  const { data: refreshedOrder } = await admin
    .from('orders')
    .select(
      'order_number, payment_status, fulfillment_status, total_amount, currency'
    )
    .eq('id', order.id)
    .single();

  const publicOrder = refreshedOrder ?? {
    order_number: order.order_number,
    payment_status: order.payment_status,
    fulfillment_status: order.fulfillment_status,
    total_amount: Number(order.total_amount),
    currency: order.currency,
  };

  return NextResponse.json({
    status: fulfillStatus,
    order: {
      ...publicOrder,
      total_amount: Number(publicOrder.total_amount),
    },
  });
}
