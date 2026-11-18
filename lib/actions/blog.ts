'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-admin';
import { slugify } from '@/lib/utils';

export type ActionResult = {
  ok: boolean;
  error?: string;
};

const blogPostSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(160),
  title: z.string().trim().min(2).max(200),
  excerpt: z.string().trim().max(500).nullable().optional(),
  content: z.string().trim().min(5, 'Post content is required').max(50000),
  coverImage: z.string().trim().max(500).nullable().optional(),
  author: z.string().trim().min(2).max(120).default('Alick System Services'),
  category: z.string().trim().max(80).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  isFeatured: z.boolean().default(false),
  published: z.boolean().default(false),
  publishedAt: z.string().nullable().optional(),
});

export async function saveBlogPostAction(
  input: z.input<typeof blogPostSchema>
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const parsed = blogPostSchema.safeParse({
    ...input,
    slug: slugify(input.slug || input.title),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || 'Invalid blog post data.',
    };
  }

  const d = parsed.data;
  const publishedAtIso = d.publishedAt
    ? new Date(d.publishedAt).toISOString()
    : d.published
      ? new Date().toISOString()
      : null;

  const payload = {
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt || null,
    content: d.content,
    cover_image: d.coverImage || null,
    author: d.author,
    category: d.category || null,
    tags: d.tags,
    is_featured: d.isFeatured,
    published: d.published,
    published_at: publishedAtIso,
  };

  if (d.id) {
    const { error } = await supabase
      .from('blog_posts')
      .update(payload)
      .eq('id', d.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from('blog_posts').insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath(`/blog/${d.slug}`);
  revalidatePath('/admin/blog');
  return { ok: true };
}

export async function deleteBlogPostAction(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return { ok: false, error: 'Invalid post ID.' };

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', parsed.data);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  return { ok: true };
}
