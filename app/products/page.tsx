import ProductCatalogClient from '@/components/products/ProductCatalogClient';
import { getProductsByCategory } from '@/lib/db/queries';

export const revalidate = 60;

export default async function LaptopsPage() {
  const laptops = await getProductsByCategory('laptops');

  return (
    <ProductCatalogClient
      products={laptops}
      title="Laptops"
      label="Our Inventory"
      subtitle={`${laptops.length} laptops available — new arrivals weekly`}
      radioName="brand-laptop"
    />
  );
}
