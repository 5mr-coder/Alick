'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-admin';

export type ActionResult = {
  ok: boolean;
  error?: string;
};

const updateOrderSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  paymentStatus: z
    .enum(['pending', 'paid', 'paid_needs_review', 'failed', 'refunded'])
    .optional(),
  fulfillmentStatus: z
    .enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .optional(),
  trackingCode: z.string().trim().max(120).nullable().optional(),
  requiresReview: z.boolean().optional(),
});

export async function updateOrderAction(
  input: z.input<typeof updateOrderSchema>
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const parsed = updateOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || 'Invalid order update.',
    };
  }

  const d = parsed.data;
  const patch: Record<string, unknown> = {};

  if (d.paymentStatus !== undefined) patch.payment_status = d.paymentStatus;
  if (d.fulfillmentStatus !== undefined)
    patch.fulfillment_status = d.fulfillmentStatus;
  if (d.trackingCode !== undefined)
    patch.tracking_code = d.trackingCode ? d.trackingCode : null;
  if (d.requiresReview !== undefined) patch.requires_review = d.requiresReview;

  if (Object.keys(patch).length === 0) {
    return { ok: true };
  }

  const { error } = await supabase
    .from('orders')
    .update(patch)
    .eq('id', d.orderId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  return { ok: true };
}
