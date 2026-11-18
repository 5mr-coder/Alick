export type ShippingZone =
  | 'ikeja_pickup'
  | 'lagos_delivery'
  | 'interstate_delivery';

export interface ShippingRates {
  ikeja_pickup: number;
  lagos_delivery: number;
  interstate_delivery: number;
  [key: string]: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  price: number; // Minor-unit kobo (active sale price when flash sale is live)
  base_price: number; // Regular price in minor-unit kobo
  retail_price?: number | null; // Wholesale price in minor-unit kobo
  old_price?: number; // Strike-through price in minor-unit kobo
  stock: number;
  brand?: string;
  model?: string;
  specs: Record<string, string>;
  images: string[];
  is_featured: boolean;
  is_flash_sale: boolean;
  flash_sale_ends?: string;
  flash_sale_title?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  tags: string[];
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  price_from?: number | null; // Minor-unit kobo
  turnaround?: string | null;
  features: string[];
  image_url?: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  author: string;
  category?: string;
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id?: string | null;
  reviewer_name: string;
  rating: number;
  text: string;
  image_url?: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  service_slug?: string | null;
  is_resolved: boolean;
  created_at: string;
}

export interface FlashSale {
  id: string;
  title: string;
  product_id: string;
  sale_price: number; // Minor-unit kobo
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
  product?: Product;
}

export interface SiteBannerMetadata {
  label?: string;
  stats?: Array<{ value: string; label: string }>;
  secondary_cta?: { text: string; link: string };
}

export interface SiteBanner {
  id: string;
  slot: string;
  headline: string;
  subheadline?: string | null;
  cta_text?: string | null;
  cta_link?: string | null;
  media_urls: string[];
  metadata: SiteBannerMetadata;
  is_active: boolean;
  updated_at: string;
}

export interface PublicSiteSettings {
  id: boolean;
  site_name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  whatsapp_number: string;
  social_links: Record<string, string>;
  shipping_rates: ShippingRates;
  updated_at: string;
}

export interface AdminSiteSettings extends PublicSiteSettings {
  high_value_threshold: number;
}

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'paid_needs_review'
  | 'failed'
  | 'refunded';

export type FulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  sales_mode: 'consumer' | 'retail';
  unit_price: number; // Minor-unit kobo
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_zone: string;
  shipping_address: Record<string, string>;
  sales_mode: 'consumer' | 'retail';
  notes?: string | null;
  subtotal: number; // Minor-unit kobo
  shipping_fee: number; // Minor-unit kobo
  total_amount: number; // Minor-unit kobo
  currency: string;
  payment_reference?: string | null;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  requires_review: boolean;
  tracking_code?: string | null;
  expires_at: string;
  created_at: string;
  items?: OrderItem[];
}
