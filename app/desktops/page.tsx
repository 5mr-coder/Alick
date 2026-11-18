import ProductCatalogClient from '@/components/products/ProductCatalogClient';
import { getProductsByCategory } from '@/lib/db/queries';

export const revalidate = 60;

export default async function DesktopsPage() {
  const desktops = await getProductsByCategory('desktops');

  return (
    <ProductCatalogClient
      products={desktops}
      title="Desktops"
      label="Performance & Power"
      subtitle={`${desktops.length} desktop PCs available for home, office, and gaming`}
      radioName="brand-desktop"
    />
  );
}
