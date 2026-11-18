'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-admin';

export type ActionResult = {
  ok: boolean;
  error?: string;
};

const settingsSchema = z.object({
  siteName: z.string().trim().min(2).max(120),
  tagline: z.string().trim().max(200).nullable().optional(),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().max(150),
  address: z.string().trim().min(5).max(300),
  whatsappNumber: z.string().trim().min(5).max(30),
  socialLinks: z.record(z.string(), z.string()).default({}),
  shippingRatesKobo: z.object({
    ikeja_pickup: z.number().int().min(0).max(100_000_000),
    lagos_delivery: z.number().int().min(0).max(100_000_000),
    interstate_delivery: z.number().int().min(0).max(100_000_000),
  }),
  highValueThresholdKobo: z.number().int().min(0).max(10_000_000_000_000),
});

export async function saveSettingsAction(
  input: z.input<typeof settingsSchema>
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || 'Invalid settings data.',
    };
  }

  const d = parsed.data;
  const { error } = await supabase
    .from('site_settings')
    .update({
      site_name: d.siteName,
      tagline: d.tagline || null,
      phone: d.phone,
      email: d.email,
      address: d.address,
      whatsapp_number: d.whatsappNumber,
      social_links: d.socialLinks,
      shipping_rates: d.shippingRatesKobo,
      high_value_threshold: d.highValueThresholdKobo,
    })
    .eq('id', true);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/', 'layout');
  revalidatePath('/contact');
  revalidatePath('/checkout');
  revalidatePath('/admin/settings');
  return { ok: true };
}
