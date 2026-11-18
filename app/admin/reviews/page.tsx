import ReviewsMessagesManager from '@/components/admin/ReviewsMessagesManager';
import { requireAdminPage } from '@/lib/auth/require-admin';
import type { ContactMessageRow, ReviewRow } from '@/lib/db/mappers';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const { supabase } = await requireAdminPage('/admin/reviews');

  const [reviewsRes, messagesRes] = await Promise.all([
    supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false }),
  ]);

  return (
    <ReviewsMessagesManager
      reviews={(reviewsRes.data ?? []) as ReviewRow[]}
      messages={(messagesRes.data ?? []) as ContactMessageRow[]}
    />
  );
}
