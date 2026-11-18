import SmartGadgetsClient from '@/components/products/SmartGadgetsClient';
import { getProductsByCategory } from '@/lib/db/queries';

export const revalidate = 60;

export default async function SmartGadgetsPage() {
  const gadgets = await getProductsByCategory('smart-gadgets');
  return <SmartGadgetsClient gadgets={gadgets} />;
}
