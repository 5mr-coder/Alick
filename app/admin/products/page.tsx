import ProductsManager from '@/components/admin/ProductsManager';
import { requireAdminPage } from '@/lib/auth/require-admin';
import type { ProductRow } from '@/lib/db/mappers';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const { supabase } = await requireAdminPage('/admin/products');

  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return <ProductsManager initialProducts={(data ?? []) as ProductRow[]} />;
}
