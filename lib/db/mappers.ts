import type {
  AdminSiteSettings,
  BlogPost,
  ContactMessage,
  FlashSale,
  Order,
  OrderItem,
  Product,
  PublicSiteSettings,
  Review,
  Service,
  ShippingRates,
  SiteBanner,
  SiteBannerMetadata,
} from '@/types';

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  model: string | null;
  description: string | null;
  category: string;
  tags: string[] | null;
  price: number;
  retail_price: number | null;
  compare_at_price: number | null;
  stock_quantity: number;
  specs: Record<string, unknown> | null;
  images: string[] | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FlashSaleRow {
  id: string;
  title: string;
  product_id: string;
  sale_price: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
}

export interface ServiceRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  starting_price: number | null;
  turnaround: string | null;
  features: string[] | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author: string;
  category: string | null;
  tags: string[] | null;
  is_featured: boolean;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewRow {
  id: string;
  product_id: string | null;
  author_name: string;
  rating: number;
  comment: string;
  image_url: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  service_slug: string | null;
  is_resolved: boolean;
  created_at: string;
}

export interface SiteBannerRow {
  id: string;
  slot: string;
  headline: string;
  subheadline: string | null;
  cta_text: string | null;
  cta_link: string | null;
  media_urls: string[] | null;
  metadata: Record<string, unknown> | null;
  is_active: boolean;
  updated_at: string;
}

export interface PublicSiteSettingsRow {
  id: boolean;
  site_name: string;
  tagline: string | null;
  phone: string;
  email: string;
  address: string;
  whatsapp_number: string;
  social_links: Record<string, unknown> | null;
  shipping_rates: Record<string, unknown> | null;
  updated_at: string;
}

export interface AdminSiteSettingsRow extends PublicSiteSettingsRow {
  high_value_threshold: number;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  sales_mode: 'consumer' | 'retail';
  unit_price: number;
  quantity: number;
}

export interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_zone: string;
  shipping_address: Record<string, unknown> | null;
  sales_mode: 'consumer' | 'retail';
  notes: string | null;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  currency: string;
  payment_reference: string | null;
  payment_status: Order['payment_status'];
  fulfillment_status: Order['fulfillment_status'];
  requires_review: boolean;
  tracking_code: string | null;
  expires_at: string;
  created_at: string;
  order_items?: OrderItemRow[];
}

const CATEGORY_LABELS: Record<string, string> = {
  laptops: 'Laptops',
  desktops: 'Desktops',
  'smart-gadgets': 'Smart Gadgets',
};

export function formatCategoryName(slug: string): string {
  return (
    CATEGORY_LABELS[slug] ??
    slug
      .split('-')
      .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
      .join(' ')
  );
}

function normalizeSpecValue(key: string, rawVal: unknown): string {
  let val = String(rawVal).trim();
  // Remove stray unmatched closing parenthesis at end of strings like "AMD Ryzen )"
  if (!val.includes('(') && val.endsWith(')')) {
    val = val.slice(0, -1).trim();
  }
  // Normalize unit casing: 32gb -> 32GB, 1tb -> 1TB, 65w -> 65W, 20000mah -> 20000mAh
  val = val.replace(/\b(\d+(?:\.\d+)?)\s*(gb|tb|mhz|ghz|w|mah)\b/gi, (_, num: string, unit: string) => {
    const lower = unit.toLowerCase();
    if (lower === 'mah') return `${num}mAh`;
    if (lower === 'mhz') return `${num}MHz`;
    if (lower === 'ghz') return `${num}GHz`;
    return `${num}${lower.toUpperCase()}`;
  });
  if (/^(yes|true)$/i.test(val)) {
    return key.toUpperCase() === 'ANC' ? 'Active ANC' : `${key}: Yes`;
  }
  return val;
}

function normalizeSpecs(raw: Record<string, unknown> | null): Record<string, string> {
  if (!raw || typeof raw !== 'object') return {};
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v !== null && v !== undefined) {
      const cleaned = normalizeSpecValue(k, v);
      if (cleaned) {
        result[k] = cleaned;
      }
    }
  }
  return result;
}

const FALLBACK_PRODUCT_IMAGES: Record<string, string> = {
  'macbook-air-m3':
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
  'dell-optiplex-7010':
    'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80',
  'anker-powercore-20000':
    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80',
  'asus-rog-strix':
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
};

function sanitizeProductImages(slug: string, rawImages: string[] | null): string[] {
  const images = Array.isArray(rawImages)
    ? rawImages.filter((url) => typeof url === 'string' && url.trim().length > 0 && !url.trim().endsWith('/product-media/'))
    : [];

  if (slug === 'asus-rog-strix' || images.length === 0) {
    return FALLBACK_PRODUCT_IMAGES[slug] ? [FALLBACK_PRODUCT_IMAGES[slug]] : images;
  }

  return images.map((url) => {
    if (
      (slug === 'macbook-air-m3' && url.includes('photo-1611532736597-de2d4265fba3')) ||
      (slug === 'dell-optiplex-7010' && url.includes('photo-1588872657578-7efd1f1555ed')) ||
      (slug === 'anker-powercore-20000' && url === '/smart-glasses.jpg')
    ) {
      return FALLBACK_PRODUCT_IMAGES[slug];
    }
    return url;
  });
}

export function mapProductRow(
  row: ProductRow,
  activeSale?: FlashSaleRow | null
): Product {
  const basePrice = Number(row.price);
  const retailPrice =
    row.retail_price !== null && row.retail_price !== undefined
      ? Number(row.retail_price)
      : null;
  const compareAt =
    row.compare_at_price !== null && row.compare_at_price !== undefined
      ? Number(row.compare_at_price)
      : 0;

  const hasSale = Boolean(activeSale && Number(activeSale.sale_price) < basePrice);
  const effectivePrice = hasSale ? Number(activeSale!.sale_price) : basePrice;
  const oldPrice = hasSale
    ? Math.max(basePrice, compareAt)
    : compareAt > basePrice
      ? compareAt
      : 0;

  return {
    id: row.id,
    category_id: row.category,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    price: effectivePrice,
    base_price: basePrice,
    retail_price: retailPrice,
    old_price: oldPrice > 0 ? oldPrice : undefined,
    stock: Number(row.stock_quantity),
    brand: row.brand ?? undefined,
    model: row.model ?? undefined,
    specs: normalizeSpecs(row.specs),
    images: sanitizeProductImages(row.slug, row.images),
    is_featured: Boolean(row.is_featured),
    is_flash_sale: hasSale,
    flash_sale_ends: hasSale ? activeSale!.ends_at : undefined,
    flash_sale_title: hasSale ? activeSale!.title : undefined,
    is_published: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
    category: {
      id: row.category,
      name: formatCategoryName(row.category),
      slug: row.category,
      created_at: row.created_at,
    },
    tags: Array.isArray(row.tags) ? row.tags : [],
  };
}

export function mapFlashSaleRow(
  row: FlashSaleRow,
  product?: Product
): FlashSale {
  return {
    id: row.id,
    title: row.title,
    product_id: row.product_id,
    sale_price: Number(row.sale_price),
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    product,
  };
}

export function mapServiceRow(row: ServiceRow): Service {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    price_from:
      row.starting_price !== null && row.starting_price !== undefined
        ? Number(row.starting_price)
        : null,
    turnaround: row.turnaround,
    features: Array.isArray(row.features) ? row.features : [],
    icon: row.icon ?? 'wrench',
    image_url: row.image_url,
    sort_order: Number(row.sort_order),
    is_published: Boolean(row.is_active),
    created_at: row.created_at,
  };
}

export function mapBlogPostRow(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? undefined,
    content: row.content,
    cover_image: row.cover_image ?? undefined,
    author: row.author,
    category: row.category ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    is_featured: Boolean(row.is_featured),
    is_published: Boolean(row.published),
    published_at: row.published_at ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function mapReviewRow(row: ReviewRow): Review {
  return {
    id: row.id,
    product_id: row.product_id,
    reviewer_name: row.author_name,
    rating: Number(row.rating),
    text: row.comment,
    image_url: row.image_url,
    is_approved: Boolean(row.is_approved),
    created_at: row.created_at,
  };
}

export function mapContactMessageRow(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    service_slug: row.service_slug,
    is_resolved: Boolean(row.is_resolved),
    created_at: row.created_at,
  };
}

export function mapSiteBannerRow(row: SiteBannerRow): SiteBanner {
  const rawMeta = (row.metadata as SiteBannerMetadata) ?? {};
  const metadata: SiteBannerMetadata = {
    ...rawMeta,
    stats: Array.isArray(rawMeta.stats)
      ? rawMeta.stats.map((s) => ({
          ...s,
          value: typeof s.value === 'string' ? s.value.replace(/★/g, ' / 5') : s.value,
        }))
      : rawMeta.stats,
  };

  return {
    id: row.id,
    slot: row.slot,
    headline: row.headline,
    subheadline: row.subheadline,
    cta_text: row.cta_text,
    cta_link: row.cta_link,
    media_urls: Array.isArray(row.media_urls) ? row.media_urls : [],
    metadata,
    is_active: Boolean(row.is_active),
    updated_at: row.updated_at,
  };
}

export function mapShippingRates(raw: Record<string, unknown> | null): ShippingRates {
  const defaults: ShippingRates = {
    ikeja_pickup: 0,
    lagos_delivery: 500000,
    interstate_delivery: 1500000,
  };
  if (!raw || typeof raw !== 'object') return defaults;
  return {
    ikeja_pickup: Number(raw.ikeja_pickup ?? defaults.ikeja_pickup),
    lagos_delivery: Number(raw.lagos_delivery ?? defaults.lagos_delivery),
    interstate_delivery: Number(
      raw.interstate_delivery ?? defaults.interstate_delivery
    ),
  };
}

export function mapPublicSiteSettingsRow(
  row: PublicSiteSettingsRow
): PublicSiteSettings {
  const socialLinks: Record<string, string> = {};
  if (row.social_links && typeof row.social_links === 'object') {
    for (const [k, v] of Object.entries(row.social_links)) {
      if (typeof v === 'string') socialLinks[k] = v;
    }
  }

  return {
    id: Boolean(row.id),
    site_name: row.site_name,
    tagline: row.tagline ?? 'Smart Tech. Sharp Deals.',
    phone: row.phone,
    email: row.email,
    address: row.address,
    whatsapp_number: row.whatsapp_number,
    social_links: socialLinks,
    shipping_rates: mapShippingRates(row.shipping_rates),
    updated_at: row.updated_at,
  };
}

export function mapAdminSiteSettingsRow(
  row: AdminSiteSettingsRow
): AdminSiteSettings {
  return {
    ...mapPublicSiteSettingsRow(row),
    high_value_threshold: Number(row.high_value_threshold),
  };
}

export function mapOrderItemRow(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    order_id: row.order_id,
    product_id: row.product_id,
    product_name: row.product_name,
    sales_mode: row.sales_mode,
    unit_price: Number(row.unit_price),
    quantity: Number(row.quantity),
  };
}

export function mapOrderRow(row: OrderRow): Order {
  return {
    id: row.id,
    order_number: row.order_number,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    customer_phone: row.customer_phone,
    shipping_zone: row.shipping_zone,
    shipping_address: normalizeSpecs(row.shipping_address),
    sales_mode: row.sales_mode,
    notes: row.notes,
    subtotal: Number(row.subtotal),
    shipping_fee: Number(row.shipping_fee),
    total_amount: Number(row.total_amount),
    currency: row.currency,
    payment_reference: row.payment_reference,
    payment_status: row.payment_status,
    fulfillment_status: row.fulfillment_status,
    requires_review: Boolean(row.requires_review),
    tracking_code: row.tracking_code,
    expires_at: row.expires_at,
    created_at: row.created_at,
    items: Array.isArray(row.order_items)
      ? row.order_items.map(mapOrderItemRow)
      : undefined,
  };
}
