'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-admin';

export type ActionResult = {
  ok: boolean;
  error?: string;
};

export async function setReviewApprovalAction(
  id: string,
  isApproved: boolean
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const parsed = z
    .object({ id: z.string().uuid(), isApproved: z.boolean() })
    .safeParse({ id, isApproved });

  if (!parsed.success) return { ok: false, error: 'Invalid review ID.' };

  const { error } = await supabase
    .from('reviews')
    .update({ is_approved: parsed.data.isApproved })
    .eq('id', parsed.data.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/reviews');
  revalidatePath('/products');
  revalidatePath('/admin');
  revalidatePath('/admin/reviews');
  return { ok: true };
}

export async function deleteReviewAction(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return { ok: false, error: 'Invalid review ID.' };

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', parsed.data);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/reviews');
  revalidatePath('/admin');
  revalidatePath('/admin/reviews');
  return { ok: true };
}

export async function setContactResolvedAction(
  id: string,
  isResolved: boolean
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const parsed = z
    .object({ id: z.string().uuid(), isResolved: z.boolean() })
    .safeParse({ id, isResolved });

  if (!parsed.success) return { ok: false, error: 'Invalid message ID.' };

  const { error } = await supabase
    .from('contact_messages')
    .update({ is_resolved: parsed.data.isResolved })
    .eq('id', parsed.data.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin');
  revalidatePath('/admin/reviews');
  return { ok: true };
}

export async function deleteContactMessageAction(
  id: string
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return { ok: false, error: 'Invalid message ID.' };

  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', parsed.data);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin');
  revalidatePath('/admin/reviews');
  return { ok: true };
}
