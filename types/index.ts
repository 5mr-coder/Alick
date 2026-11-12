export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface Product {
  id: string;
  category_id?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  old_price?: number;
  stock: number;
  brand?: string;
  model?: string;
  specs?: Record<string, string>;
  images: string[];
  is_featured: boolean;
  is_flash_sale: boolean;
  flash_sale_ends?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  price_from?: number;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  cover_image?: string;
  author: string;
  category?: string;
  tags?: string[];
  is_published: boolean;
  is_featured: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FlashSale {
  id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
  products?: FlashSaleProduct[];
}

export interface FlashSaleProduct {
  flash_sale_id: string;
  product_id: string;
  sale_price: number;
  product?: Product;
}

export interface ContactMessage {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSettings {
  site_name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  twitter: string;
}
