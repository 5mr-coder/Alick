import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isUuid } from '@/lib/utils';

const HIGH_SEVERITY_STATUSES = new Set([
  'duplicate_payment',
  'duplicate_reference',
  'reference_mismatch',
  'amount_mismatch',
]);

export async function POST(req: NextRequest) {
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
    console.error('[webhook] Refusing sk_test_ key in production');
    return NextResponse.json(
      { error: 'Payment gateway misconfigured.' },
      { status: 500 }
    );
  }

  const rawBody = await req.text();
  const signature = (req.headers.get('x-paystack-signature') ?? '')
    .trim()
    .toLowerCase();

  const expectedHex = crypto
    .createHmac('sha512', paystackSecret)
    .update(rawBody)
    .digest('hex')
    .toLowerCase();

  const sigBuf = Buffer.from(signature, 'utf8');
  const expectedBuf = Buffer.from(expectedHex, 'utf8');

  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let payload: {
    event?: string;
    data?: {
      domain?: string;
      reference?: string;
      amount?: number;
      currency?: string;
      metadata?: {
        order_id?: string;
      };
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  if (
    process.env.NODE_ENV === 'production' &&
    payload.data?.domain !== 'live'
  ) {
    console.error('[SECURITY ALERT] Rejected non-live Paystack webhook in prod:', {
      domain: payload.data?.domain,
      event: payload.event,
    });
    return NextResponse.json(
      { error: 'Non-live domain rejected in production.' },
      { status: 400 }
    );
  }

  if (payload.event !== 'charge.success') {
    return NextResponse.json({ received: true, ignored: true });
  }

  const reference = String(payload.data?.reference ?? '').trim();
  const paidAmount = Number(payload.data?.amount ?? 0);
  const currency = String(payload.data?.currency ?? 'NGN').trim();

  if (!reference) {
    return NextResponse.json({ status: 'missing_reference' }, { status: 200 });
  }

  const admin = createAdminClient();

  let orderId = isUuid(payload.data?.metadata?.order_id)
    ? payload.data!.metadata!.order_id
    : null;

  if (!orderId) {
    const { data: orderByRef } = await admin
      .from('orders')
      .select('id')
      .eq('payment_reference', reference)
      .maybeSingle();
    orderId = orderByRef?.id ?? null;
  }

  if (!orderId) {
    console.warn('[webhook] charge.success for unknown order:', { reference });
    return NextResponse.json({ status: 'not_found' }, { status: 200 });
  }

  const { data: fulfillResult, error: fulfillError } = await admin.rpc(
    'fulfill_paid_order',
    {
      p_order_id: orderId,
      p_payment_reference: reference,
      p_paid_amount: paidAmount,
      p_currency: currency,
    }
  );

  if (fulfillError) {
    console.error('[webhook] fulfill_paid_order failed:', fulfillError.message);
    return NextResponse.json(
      { error: 'Fulfillment RPC failed.' },
      { status: 500 }
    );
  }

  const outcome = String(fulfillResult);

  if (HIGH_SEVERITY_STATUSES.has(outcome)) {
    console.error('[SECURITY ALERT] Paystack webhook fulfillment anomaly:', {
      outcome,
      orderId,
      reference,
      paidAmount,
      currency,
    });
  }

  return NextResponse.json({ status: outcome }, { status: 200 });
}
