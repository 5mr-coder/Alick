'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-admin';
import { slugify } from '@/lib/utils';

export type ActionResult = {
  ok: boolean;
  error?: string;
};

const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().min(5).max(2000),
  startingPriceKobo: z.number().int().min(0).max(10_000_000_000_000).nullable().optional(),
  turnaround: z.string().trim().max(120).nullable().optional(),
  features: z.array(z.string().trim().min(1).max(160)).max(20).default([]),
  icon: z.string().trim().max(40).default('wrench'),
  imageUrl: z.string().trim().max(500).nullable().optional(),
  sortOrder: z.number().int().min(0).max(10000).default(0),
  isActive: z.boolean().default(true),
});

export async function saveServiceAction(
  input: z.input<typeof serviceSchema>
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const parsed = serviceSchema.safeParse({
    ...input,
    slug: slugify(input.slug || input.title),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || 'Invalid service details.',
    };
  }

  const d = parsed.data;
  const payload = {
    slug: d.slug,
    title: d.title,
    description: d.description,
    starting_price: d.startingPriceKobo ?? null,
    turnaround: d.turnaround || null,
    features: d.features,
    icon: d.icon || 'wrench',
    image_url: d.imageUrl || null,
    sort_order: d.sortOrder,
    is_active: d.isActive,
  };

  if (d.id) {
    const { error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', d.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from('services').insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/services');
  revalidatePath('/admin/services');
  return { ok: true };
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return { ok: false, error: 'Invalid service ID.' };

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', parsed.data);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/');
  revalidatePath('/services');
  revalidatePath('/admin/services');
  return { ok: true };
}
