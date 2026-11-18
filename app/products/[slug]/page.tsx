import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import {
  getApprovedReviews,
  getProductBySlug,
  getPublicSiteSettings,
} from '@/lib/db/queries';

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [reviews, settings] = await Promise.all([
    getApprovedReviews(product.id),
    getPublicSiteSettings(),
  ]);

  return (
    <ProductDetailClient
      product={product}
      reviews={reviews}
      whatsappNumber={settings.whatsapp_number}
    />
  );
}
