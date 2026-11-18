import BlogManager from '@/components/admin/BlogManager';
import { requireAdminPage } from '@/lib/auth/require-admin';
import type { BlogPostRow } from '@/lib/db/mappers';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const { supabase } = await requireAdminPage('/admin/blog');

  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  return <BlogManager initialPosts={(data ?? []) as BlogPostRow[]} />;
}
