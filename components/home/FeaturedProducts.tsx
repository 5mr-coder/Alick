import AnimatedSection from '@/components/ui/AnimatedSection';
import ProductCard from '@/components/products/ProductCard';
import Button from '@/components/ui/Button';
import { Product } from '@/types';

// Unsplash placeholder data until Supabase is connected
const placeholderProducts: Product[] = [
  {
    id: '1', category_id: '1', name: 'HP EliteBook 840 G9', slug: 'hp-elitebook-840-g9',
    description: 'Business powerhouse with stunning display.', price: 680000, old_price: 750000,
    stock: 5, brand: 'HP', model: 'EliteBook 840 G9',
    specs: { RAM: '16GB', Storage: '512GB SSD', Processor: 'Intel i7' },
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80'],
    is_featured: true, is_flash_sale: false, is_published: true,
    created_at: '', updated_at: '',
  },
  {
    id: '2', category_id: '1', name: 'Dell XPS 15 OLED', slug: 'dell-xps-15-oled',
    description: 'The creator\'s ultimate laptop.', price: 1250000,
    stock: 3, brand: 'Dell', model: 'XPS 15 9530',
    specs: { RAM: '32GB', Storage: '1TB SSD', Processor: 'Intel i9' },
    images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80'],
    is_featured: true, is_flash_sale: false, is_published: true,
    created_at: '', updated_at: '',
  },
  {
    id: '3', category_id: '1', name: 'Lenovo ThinkPad X1 Carbon', slug: 'lenovo-thinkpad-x1-carbon',
    description: 'Ultra-light, ultra-durable business laptop.', price: 890000, old_price: 980000,
    stock: 7, brand: 'Lenovo', model: 'ThinkPad X1 Carbon Gen 11',
    specs: { RAM: '16GB', Storage: '512GB SSD', Processor: 'Intel i7' },
    images: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80'],
    is_featured: true, is_flash_sale: false, is_published: true,
    created_at: '', updated_at: '',
  },
  {
    id: '4', category_id: '1', name: 'MacBook Air M3', slug: 'macbook-air-m3',
    description: 'Apple silicon at its finest.', price: 1550000,
    stock: 4, brand: 'Apple', model: 'MacBook Air 15" M3',
    specs: { RAM: '16GB', Storage: '512GB SSD', Processor: 'Apple M3' },
    images: ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80'],
    is_featured: true, is_flash_sale: false, is_published: true,
    created_at: '', updated_at: '',
  },
];

export default function FeaturedProducts() {
  return (
    <section className="section" style={{ background: 'var(--ash-950)' }}>
      <div className="container">
        {/* Header */}
        <AnimatedSection style={{ marginBottom: '3rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="section-label">Hand-picked for you</div>
            <h2 className="section-heading">Featured Laptops</h2>
          </div>
          <Button variant="secondary" href="/products" size="sm"
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            }
          >
            View All
          </Button>
        </AnimatedSection>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {placeholderProducts.map((product, i) => (
            <AnimatedSection key={product.id} delay={i * 80}>
              <ProductCard product={product} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
