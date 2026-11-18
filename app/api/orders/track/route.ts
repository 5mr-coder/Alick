import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';

const trackSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .min(4, 'Order number is required')
    .max(40, 'Order number is too long'),
  email: z.string().trim().email('Valid email address is required').max(150),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid input.' },
      { status: 400 }
    );
  }

  const orderNumber = parsed.data.orderNumber.toUpperCase();
  const email = parsed.data.email.toLowerCase();
  const ip = await getClientIp();

  const [ipAllowed, orderAllowed] = await Promise.all([
    enforceRateLimit(`track:ip:${ip}`, 15, 60),
    enforceRateLimit(`track:order:${orderNumber}`, 10, 300),
  ]);

  if (!ipAllowed || !orderAllowed) {
    return NextResponse.json(
      { error: 'Too many order lookup attempts. Please try again later.' },
      { status: 429 }
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_guest_order', {
    p_order_number: orderNumber,
    p_email: email,
  });

  if (error) {
    console.error('[orders/track] get_guest_order error:', error.message);
    return NextResponse.json(
      { error: 'Unable to look up order right now.' },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: 'No matching order found for that order number and email.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ order: data });
}
