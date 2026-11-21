'use client';

import Link from 'next/link';
import AnimatedSection from '@/components/ui/AnimatedSection';
import SkeletonImage from '@/components/ui/SkeletonImage';

const categories = [
  {
    label: 'Laptops',
    href: '/products',
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80',
    desc: 'Business, gaming & everyday',
  },
  {
    label: 'Desktops',
    href: '/desktops',
    image:
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=500&q=80',
    desc: 'High-performance workstations',
  },
  {
    label: 'Smart Gadgets',
    href: '/smart-gadgets',
    image: '/smart-glasses.jpg',
    desc: 'Accessories & smart devices',
  },
  {
    label: 'Services',
    href: '/services',
    image:
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80',
    desc: 'Repairs & upgrades',
  },
];

export default function CategoryGrid() {
  return (
    <section
      className="section"
      style={{
        background: 'var(--ash-900)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="container">
        <AnimatedSection style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>
            Browse by category
          </div>
          <h2 className="section-heading" style={{ textAlign: 'center' }}>
            Shop Our Range
          </h2>
        </AnimatedSection>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {categories.map((cat, i) => (
            <AnimatedSection key={cat.label} delay={i * 70}>
              <Link
                href={cat.href}
                className="force-dark cat-tile img-outline"
              >
                <SkeletonImage
                  src={cat.image}
                  alt={cat.label}
                  loading="lazy"
                  style={{ filter: 'brightness(0.5)' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to top, rgba(14,15,17,0.95) 0%, transparent 60%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      color: 'white',
                    }}
                  >
                    {cat.label}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--ash-400)',
                      marginTop: '0.2rem',
                    }}
                  >
                    {cat.desc}
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
