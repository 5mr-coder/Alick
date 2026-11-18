import FlashSalesManager from '@/components/admin/FlashSalesManager';
import { requireAdminPage } from '@/lib/auth/require-admin';
import type {
  FlashSaleRow,
  ProductRow,
  SiteBannerRow,
} from '@/lib/db/mappers';

export const dynamic = 'force-dynamic';

export default async function AdminFlashSalesPage() {
  const { supabase } = await requireAdminPage('/admin/flash-sales');

  const [salesRes, productsRes, bannerRes] = await Promise.all([
    supabase
      .from('flash_sales')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase.from('products').select('*').order('name', { ascending: true }),
    supabase
      .from('site_banners')
      .select('*')
      .eq('slot', 'home_hero')
      .maybeSingle(),
  ]);

  return (
    <FlashSalesManager
      initialSales={(salesRes.data ?? []) as FlashSaleRow[]}
      products={(productsRes.data ?? []) as ProductRow[]}
      initialBanner={(bannerRes.data as SiteBannerRow) ?? null}
    />
  );
}
