import { createAnonClient } from '@/lib/supabase/server';
import {
  mapBlogPostRow,
  mapProductRow,
  mapPublicSiteSettingsRow,
  mapReviewRow,
  mapServiceRow,
  mapSiteBannerRow,
  type BlogPostRow,
  type FlashSaleRow,
  type ProductRow,
  type PublicSiteSettingsRow,
  type ReviewRow,
  type ServiceRow,
  type SiteBannerRow,
} from '@/lib/db/mappers';
import type {
  BlogPost,
  Product,
  PublicSiteSettings,
  Review,
  Service,
  SiteBanner,
} from '@/types';

const DEFAULT_PUBLIC_SETTINGS: PublicSiteSettings = {
  id: true,
  site_name: 'Alick System Services',
  tagline: 'Smart Tech. Sharp Deals.',
  phone: '+234 803 084 1357',
  email: 'alickmgt@gmail.com',
  address: '5 Obafemi Awolowo Way, Ikeja, Lagos, 101233, Nigeria',
  whatsapp_number: '+2348030841357',
  social_links: { whatsapp: 'https://wa.me/2348030841357' },
  shipping_rates: {
    ikeja_pickup: 0,
    lagos_delivery: 500000,
    interstate_delivery: 1500000,
  },
  updated_at: '2026-01-01T00:00:00.000Z',
};

const PUBLIC_SITE_SETTINGS_COLUMNS =
  'id, site_name, tagline, phone, email, address, whatsapp_number, social_links, shipping_rates, updated_at';

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select(PUBLIC_SITE_SETTINGS_COLUMNS)
      .eq('id', true)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_PUBLIC_SETTINGS;
    }

    return mapPublicSiteSettingsRow(data as PublicSiteSettingsRow);
  } catch {
    return DEFAULT_PUBLIC_SETTINGS;
  }
}

export async function getActiveFlashSalesMap(): Promise<Map<string, FlashSaleRow>> {
  const map = new Map<string, FlashSaleRow>();
  try {
    const supabase = createAnonClient();
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('flash_sales')
      .select('id, title, product_id, sale_price, starts_at, ends_at, is_active, created_at')
      .eq('is_active', true)
      .lte('starts_at', nowIso)
      .gt('ends_at', nowIso)
      .order('sale_price', { ascending: true });

    if (error || !data) return map;

    for (const row of data as FlashSaleRow[]) {
      if (!map.has(row.product_id)) {
        map.set(row.product_id, row);
      }
    }
    return map;
  } catch {
    return map;
  }
}

export async function getHomeHeroBanner(): Promise<SiteBanner | null> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('site_banners')
      .select('id, slot, headline, subheadline, cta_text, cta_link, media_urls, metadata, is_active, updated_at')
      .eq('slot', 'home_hero')
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) return null;
    return mapSiteBannerRow(data as SiteBannerRow);
  } catch {
    return null;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = createAnonClient();
    const [{ data, error }, salesMap] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false }),
      getActiveFlashSalesMap(),
    ]);

    if (error || !data) return [];
    return (data as ProductRow[]).map((row) =>
      mapProductRow(row, salesMap.get(row.id) ?? null)
    );
  } catch {
    return [];
  }
}

export async function getFlashSaleProducts(): Promise<{
  products: Product[];
  earliestEnd: string | null;
}> {
  try {
    const supabase = createAnonClient();
    const salesMap = await getActiveFlashSalesMap();
    const productIds = Array.from(salesMap.keys());
    if (productIds.length === 0) {
      return { products: [], earliestEnd: null };
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .in('id', productIds);

    if (error || !data) return { products: [], earliestEnd: null };

    const mapped = (data as ProductRow[]).map((row) =>
      mapProductRow(row, salesMap.get(row.id) ?? null)
    );
    const ends = Array.from(salesMap.values())
      .map((s) => s.ends_at)
      .sort();

    return { products: mapped, earliestEnd: ends[0] ?? null };
  } catch {
    return { products: [], earliestEnd: null };
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const supabase = createAnonClient();
    const [{ data, error }, salesMap] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category', category)
        .order('created_at', { ascending: false }),
      getActiveFlashSalesMap(),
    ]);

    if (error || !data) return [];
    return (data as ProductRow[]).map((row) =>
      mapProductRow(row, salesMap.get(row.id) ?? null)
    );
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) return null;

    const salesMap = await getActiveFlashSalesMap();
    const row = data as ProductRow;
    return mapProductRow(row, salesMap.get(row.id) ?? null);
  } catch {
    return null;
  }
}

export async function getActiveServices(): Promise<Service[]> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data) return [];
    return (data as ServiceRow[]).map(mapServiceRow);
  } catch {
    return [];
  }
}

export async function getPublishedBlogPosts(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<BlogPost[]> {
  try {
    const supabase = createAnonClient();
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (options?.featuredOnly) {
      query = query.eq('is_featured', true);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return (data as BlogPostRow[]).map(mapBlogPostRow);
  } catch {
    return [];
  }
}

export async function getPublishedBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();

    if (error || !data) return null;
    return mapBlogPostRow(data as BlogPostRow);
  } catch {
    return null;
  }
}

export async function getApprovedReviews(productId?: string): Promise<Review[]> {
  try {
    const supabase = createAnonClient();
    let query = supabase
      .from('reviews')
      .select('id, product_id, author_name, rating, comment, image_url, is_approved, created_at')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return (data as ReviewRow[]).map(mapReviewRow);
  } catch {
    return [];
  }
}
