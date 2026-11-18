import ReviewsClient from '@/components/reviews/ReviewsClient';
import { getApprovedReviews } from '@/lib/db/queries';

export const revalidate = 60;

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();
  return <ReviewsClient reviews={reviews} />;
}
