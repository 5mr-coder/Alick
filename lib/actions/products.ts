'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-admin';
import { slugify } from '@/lib/utils';

export type ActionResult<T = undefined> = {
  ok: boolean;
  error?: string;
  data?: T;
};

const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(120),
  name: z.string().trim().min(2).max(160),
  brand: z.string().trim().max(80).nullable().optional(),
  model: z.string().trim().max(120).nullable().optional(),
  description: z.string().trim().max(4000).nullable().optional(),
  category: z.string().trim().min(2).max(60),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  priceKobo: z.number().int().min(0).max(10_000_000_000_000),
  retailPriceKobo: z.number().int().positive().max(10_000_000_000_000).nullable().optional(),
  compareAtPriceKobo: z.number().int().min(0).max(10_000_000_000_000).nullable().optional(),
  stockQuantity: z.number().int().min(0).max(1_000_000),
  specs: z.record(z.string(), z.string()).default({}),
  images: z.array(z.string().trim().min(1).max(500)).max(12).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

function revalidateStorefrontProducts(slug?: string) {
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/desktops');
  revalidatePath('/smart-gadgets');
  revalidatePath('/admin');
  revalidatePath('/admin/products');
  revalidatePath('/admin/flash-sales');
  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
}

export async function saveProductAction(
  input: z.input<typeof productSchema>
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const normalizedSlug = slugify(input.slug || input.name);
  const parsed = productSchema.safeParse({
    ...input,
    slug: normalizedSlug,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || 'Invalid product data.',
    };
  }

  const d = parsed.data;
  if (d.retailPriceKobo !== null && d.retailPriceKobo !== undefined && d.retailPriceKobo > d.priceKobo) {
    return {
      ok: false,
      error: 'Retail price must be less than or equal to the regular price.',
    };
  }

  const compareAt =
    d.compareAtPriceKobo && d.compareAtPriceKobo > d.priceKobo
      ? d.compareAtPriceKobo
      : null;

  const payload = {
    slug: d.slug,
    name: d.name,
    brand: d.brand || null,
    model: d.model || null,
    description: d.description || null,
    category: d.category,
    tags: d.tags,
    price: d.priceKobo,
    retail_price: d.retailPriceKobo ?? null,
    compare_at_price: compareAt,
    stock_quantity: d.stockQuantity,
    specs: d.specs,
    images: d.images,
    is_featured: d.isFeatured,
    is_active: d.isActive,
  };

  if (d.id) {
    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', d.id);

    if (error) {
      return { ok: false, error: error.message };
    }
  } else {
    const { error } = await supabase.from('products').insert(payload);
    if (error) {
      return { ok: false, error: error.message };
    }
  }

  revalidateStorefrontProducts(d.slug);
  return { ok: true };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: 'Invalid product ID.' };
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', parsedId.data);

  if (error) {
    return {
      ok: false,
      error: error.message.includes('foreign key')
        ? 'This product is referenced by existing orders. Set it to inactive instead.'
        : error.message,
    };
  }

  revalidateStorefrontProducts();
  return { ok: true };
}
