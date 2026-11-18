import CheckoutClient from '@/components/checkout/CheckoutClient';
import { getPublicSiteSettings } from '@/lib/db/queries';

export const revalidate = 60;

export default async function CheckoutPage() {
  const settings = await getPublicSiteSettings();
  return <CheckoutClient settings={settings} />;
}
