'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-admin';

export type ActionResult = {
  ok: boolean;
  error?: string;
};

const flashSaleSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(160),
  productId: z.string().uuid('Select a valid product'),
  salePriceKobo: z.number().int().positive('Sale price must be greater than 0'),
  startsAt: z.string().min(1, 'Start date is required'),
  endsAt: z.string().min(1, 'End date is required'),
  isActive: z.boolean().default(true),
});

export async function saveFlashSaleAction(
  input: z.input<typeof flashSaleSchema>
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const parsed = flashSaleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || 'Invalid flash sale details.',
    };
  }

  const d = parsed.data;
  const startDate = new Date(d.startsAt);
  const endDate = new Date(d.endsAt);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { ok: false, error: 'Invalid start or end timestamp.' };
  }

  if (endDate <= startDate) {
    return { ok: false, error: 'End time must be after start time.' };
  }

  const payload = {
    title: d.title,
    product_id: d.productId,
    sale_price: d.salePriceKobo,
    starts_at: startDate.toISOString(),
    ends_at: endDate.toISOString(),
    is_active: d.isActive,
  };

  if (d.id) {
    const { error } = await supabase
      .from('flash_sales')
      .update(payload)
      .eq('id', d.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from('flash_sales').insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/desktops');
  revalidatePath('/smart-gadgets');
  revalidatePath('/admin');
  revalidatePath('/admin/flash-sales');
  return { ok: true };
}

export async function deleteFlashSaleAction(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return { ok: false, error: 'Invalid flash sale ID.' };

  const { error } = await supabase
    .from('flash_sales')
    .delete()
    .eq('id', parsed.data);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin/flash-sales');
  return { ok: true };
}

const bannerSchema = z.object({
  slot: z.string().trim().min(1).max(60).default('home_hero'),
  headline: z.string().trim().min(2).max(200),
  subheadline: z.string().trim().max(600).nullable().optional(),
  ctaText: z.string().trim().max(80).nullable().optional(),
  ctaLink: z.string().trim().max(200).nullable().optional(),
  mediaUrls: z.array(z.string().trim().min(1).max(500)).max(12).default([]),
  label: z.string().trim().max(80).optional().default('Smart Tech. Sharp Deals.'),
  secondaryCtaText: z.string().trim().max(80).optional().default('Our Services'),
  secondaryCtaLink: z.string().trim().max(200).optional().default('/services'),
  stats: z
    .array(
      z.object({
        value: z.string().trim().min(1).max(30),
        label: z.string().trim().min(1).max(60),
      })
    )
    .max(6)
    .default([]),
  isActive: z.boolean().default(true),
});

export async function saveHomeBannerAction(
  input: z.input<typeof bannerSchema>
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || 'Invalid hero banner data.',
    };
  }

  const d = parsed.data;
  const payload = {
    slot: d.slot,
    headline: d.headline,
    subheadline: d.subheadline || null,
    cta_text: d.ctaText || null,
    cta_link: d.ctaLink || null,
    media_urls: d.mediaUrls,
    metadata: {
      label: d.label,
      stats: d.stats,
      secondary_cta: {
        text: d.secondaryCtaText,
        link: d.secondaryCtaLink,
      },
    },
    is_active: d.isActive,
  };

  const { error } = await supabase
    .from('site_banners')
    .upsert(payload, { onConflict: 'slot' });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/');
  revalidatePath('/admin/flash-sales');
  return { ok: true };
}
