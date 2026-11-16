export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export const products: Product[] = [
  {
    id: 'hp-elitebook-840-g9',
    category_id: 'laptops',
    name: 'HP EliteBook 840 G9',
    slug: 'hp-elitebook-840-g9',
    description: 'Business powerhouse with a stunning display, strong security features, and all-day battery life.',
    price: 680000,
    old_price: 750000,
    stock: 100,
    brand: 'HP',
    model: 'EliteBook 840 G9',
    specs: { RAM: '16GB', Storage: '512GB SSD', Processor: 'Intel i7' },
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80'],
    is_featured: true,
    is_flash_sale: false,
    is_published: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dell-xps-15-oled',
    category_id: 'laptops',
    name: 'Dell XPS 15 OLED',
    slug: 'dell-xps-15-oled',
    description: 'The creator\'s ultimate laptop with a gorgeous OLED panel, powerful performance, and premium build.',
    price: 1250000,
    old_price: 1400000,
    stock: 100,
    brand: 'Dell',
    model: 'XPS 15 9530',
    specs: { RAM: '32GB', Storage: '1TB SSD', Processor: 'Intel i9' },
    images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80'],
    is_featured: true,
    is_flash_sale: true,
    is_published: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'lenovo-thinkpad-x1-carbon',
    category_id: 'laptops',
    name: 'Lenovo ThinkPad X1 Carbon',
    slug: 'lenovo-thinkpad-x1-carbon',
    description: 'Ultra-light, ultra-durable business laptop that travels as hard as you do.',
    price: 890000,
    old_price: 980000,
    stock: 100,
    brand: 'Lenovo',
    model: 'ThinkPad X1 Carbon Gen 11',
    specs: { RAM: '16GB', Storage: '512GB SSD', Processor: 'Intel i7' },
    images: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80'],
    is_featured: true,
    is_flash_sale: false,
    is_published: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'macbook-air-m3',
    category_id: 'laptops',
    name: 'MacBook Air M3',
    slug: 'macbook-air-m3',
    description: 'Apple silicon at its finest — silent, fast, and incredibly efficient.',
    price: 1550000,
    old_price: 0,
    stock: 100,
    brand: 'Apple',
    model: 'MacBook Air 15" M3',
    specs: { RAM: '16GB', Storage: '512GB SSD', Processor: 'Apple M3' },
    images: ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80'],
    is_featured: true,
    is_flash_sale: false,
    is_published: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'hp-prodesk-400-g9',
    category_id: 'desktops',
    name: 'HP ProDesk 400 G9 SFF',
    slug: 'hp-prodesk-400-g9',
    description: 'Compact small-form-factor desktop for office work, accounts, and everyday multitasking.',
    price: 520000,
    old_price: 590000,
    stock: 40,
    brand: 'HP',
    model: 'ProDesk 400 G9',
    specs: { RAM: '8GB', Storage: '512GB SSD', Processor: 'Intel i5' },
    images: ['https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=80'],
    is_featured: true,
    is_flash_sale: false,
    is_published: true,
    created_at: '2026-01-02T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'dell-optiplex-7010',
    category_id: 'desktops',
    name: 'Dell OptiPlex 7010 Tower',
    slug: 'dell-optiplex-7010',
    description: 'Reliable business desktop with room for upgrades — ideal for offices and cyber cafés.',
    price: 445000,
    old_price: 510000,
    stock: 22,
    brand: 'Dell',
    model: 'OptiPlex 7010',
    specs: { RAM: '16GB', Storage: '256GB SSD', Processor: 'Intel i5' },
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80'],
    is_featured: false,
    is_flash_sale: true,
    is_published: true,
    created_at: '2026-01-03T00:00:00.000Z',
    updated_at: '2026-01-03T00:00:00.000Z',
  },
  {
    id: 'lenovo-thinkcentre-m70q',
    category_id: 'desktops',
    name: 'Lenovo ThinkCentre M70q Tiny',
    slug: 'lenovo-thinkcentre-m70q',
    description: 'Ultra-compact desktop that fits behind a monitor yet handles heavy office workloads.',
    price: 615000,
    old_price: 0,
    stock: 12,
    brand: 'Lenovo',
    model: 'ThinkCentre M70q',
    specs: { RAM: '16GB', Storage: '512GB SSD', Processor: 'Intel i7' },
    images: ['https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=600&q=80'],
    is_featured: false,
    is_flash_sale: false,
    is_published: true,
    created_at: '2026-01-04T00:00:00.000Z',
    updated_at: '2026-01-04T00:00:00.000Z',
  },
  {
    id: 'sony-wf-1000xm5',
    category_id: 'smart-gadgets',
    name: 'Sony WF-1000XM5 Earbuds',
    slug: 'sony-wf-1000xm5',
    description: 'Industry-leading noise cancelling earbuds with rich sound and all-day comfort.',
    price: 285000,
    old_price: 320000,
    stock: 30,
    brand: 'Sony',
    model: 'WF-1000XM5',
    specs: { Type: 'Wireless earbuds', Battery: '8 hrs', ANC: 'Yes' },
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80'],
    is_featured: true,
    is_flash_sale: true,
    is_published: true,
    created_at: '2026-01-05T00:00:00.000Z',
    updated_at: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'apple-watch-series-9',
    category_id: 'smart-gadgets',
    name: 'Apple Watch Series 9',
    slug: 'apple-watch-series-9',
    description: 'Health, fitness, and notifications on your wrist with a bright always-on display.',
    price: 420000,
    old_price: 465000,
    stock: 18,
    brand: 'Apple',
    model: 'Watch Series 9 45mm',
    specs: { Size: '45mm', Battery: '18 hrs', Connectivity: 'GPS' },
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80'],
    is_featured: true,
    is_flash_sale: false,
    is_published: true,
    created_at: '2026-01-06T00:00:00.000Z',
    updated_at: '2026-01-06T00:00:00.000Z',
  },
  {
    id: 'anker-powercore-20000',
    category_id: 'smart-gadgets',
    name: 'Anker PowerCore 20,000mAh',
    slug: 'anker-powercore-20000',
    description: 'High-capacity power bank with fast charging for laptops, phones, and tablets.',
    price: 48000,
    old_price: 0,
    stock: 60,
    brand: 'Anker',
    model: 'PowerCore 20K',
    specs: { Capacity: '20,000mAh', Output: '65W', Ports: '2x USB-C' },
    images: ['/smart-glasses.jpg'],
    is_featured: false,
    is_flash_sale: false,
    is_published: true,
    created_at: '2026-01-07T00:00:00.000Z',
    updated_at: '2026-01-07T00:00:00.000Z',
  },
];

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

export function getProductsByCategory(slug: string): Product[] {
  return products.filter((p) => p.category_id === slug && p.is_published);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug && p.is_published);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.is_featured && p.is_published);
}

export function getFlashSaleProducts(): Product[] {
  return products.filter((p) => p.is_flash_sale && p.is_published);
}

export { postsStatic as posts };


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

const postsStatic: BlogPost[] = [
  {
    id: 'post-1',
    title: 'How to choose the right laptop in Lagos',
    slug: 'how-to-choose-laptop-lagos',
    excerpt: 'A practical buying guide for students, professionals, and small business owners shopping for a laptop in Nigeria.',
    cover_image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
    author: 'Alick System Services',
    category: 'Buying Guide',
    tags: ['laptops', 'buying guide'],
    is_published: true,
    is_featured: true,
    published_at: '2026-01-10T00:00:00.000Z',
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'post-2',
    title: 'MacBook Air M3 vs Windows ultrabooks',
    slug: 'macbook-air-m3-vs-windows-ultrabooks',
    excerpt: 'An honest comparison of battery life, performance, and value before you spend big on a new ultrabook.',
    cover_image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80',
    author: 'Alick System Services',
    category: 'Buying Guide',
    tags: ['macbook', 'comparison'],
    is_published: true,
    is_featured: false,
    published_at: '2026-01-15T00:00:00.000Z',
    created_at: '2026-01-15T00:00:00.000Z',
    updated_at: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'post-3',
    title: 'Keep your laptop cool in Nigerian heat',
    slug: 'keep-laptop-cool-nigerian-heat',
    excerpt: 'Simple tips to stop overheating, extend battery life, and avoid costly repairs in a hot climate.',
    cover_image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80',
    author: 'Alick System Services',
    category: 'Tech Tips',
    tags: ['cooling', 'maintenance'],
    is_published: true,
    is_featured: false,
    published_at: '2026-01-20T00:00:00.000Z',
    created_at: '2026-01-20T00:00:00.000Z',
    updated_at: '2026-01-20T00:00:00.000Z',
  },
];

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
