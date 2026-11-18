import AnimatedSection from '@/components/ui/AnimatedSection';
import ProductCard from '@/components/products/ProductCard';
import Button from '@/components/ui/Button';
import type { Product } from '@/types';

export default function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="section" style={{ background: 'var(--ash-950)' }}>
      <div className="container">
        <AnimatedSection
          style={{
            marginBottom: '3rem',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div className="section-label">Hand-picked for you</div>
            <h2 className="section-heading">Featured Products</h2>
          </div>
          <Button
            variant="secondary"
            href="/products"
            size="sm"
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            }
          >
            View All
          </Button>
        </AnimatedSection>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {products.map((product, i) => (
            <AnimatedSection key={product.id} delay={i * 80}>
              <ProductCard product={product} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
