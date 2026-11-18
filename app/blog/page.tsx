import BlogListClient from '@/components/blog/BlogListClient';
import { getPublishedBlogPosts } from '@/lib/db/queries';

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();
  return <BlogListClient posts={posts} />;
}
