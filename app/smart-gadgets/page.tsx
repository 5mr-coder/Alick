'use client';

import { useState } from 'react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import ProductCard from '@/components/products/ProductCard';
import { getProductsByCategory } from '@/types';
import { useCart } from '@/context/CartContext';
import ShopModePicker from '@/components/shop/ShopModePicker';

const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Featured'];

export default function SmartGadgetsPage() {
  const { salesMode, setSalesMode, isLoaded } = useCart();
  const gadgets = getProductsByCategory('smart-gadgets');
  const [activeBrand, setActiveBrand] = useState('All');
  const [sortBy, setSortBy]           = useState('Newest');
  const [showFlash, setShowFlash]     = useState(false);

  const brands = ['All', ...Array.from(new Set(gadgets.map(p => p.brand).filter(Boolean)))];
  const safeBrands = brands.filter((b): b is string => typeof b === 'string');

  const filtered = gadgets
    .filter((p) => (activeBrand === 'All' ? true : p.brand === activeBrand))
    .filter((p) => (showFlash ? p.is_flash_sale : true))
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Featured') return Number(b.is_featured) - Number(a.is_featured);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  if (!isLoaded) return null;
  if (!salesMode) return <ShopModePicker mode={salesMode} onChange={setSalesMode} />;

  return (
    <>
      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <ShopModePicker mode={salesMode} onChange={setSalesMode} compact />
      </div>

      <section
        style={{
          position: 'relative',
          padding: '5rem 0 4rem',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/smart-glasses.jpg"
            alt=""
            aria-hidden
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.15)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(14,15,17,0.98) 40%, transparent 100%)' }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <AnimatedSection style={{ maxWidth: '580px' }}>
            <div className="section-label">The future is now</div>
            <h1 className="section-heading">Smart Gadgets</h1>
            <p style={{ color: 'var(--ash-400)', marginTop: '0.75rem', fontSize: '0.9375rem', lineHeight: 1.7 }}>
              Earbuds, smartwatches, power banks, accessories — everything to elevate your tech lifestyle.
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.25)', color: 'var(--gold-400)', fontSize: '0.8rem', fontWeight: 600 }}>
                {gadgets.length} gadgets available
              </span>
              <span style={{ padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'rgba(34,211,238,0.1)', border: '1px solid var(--cyan-glow)', color: 'var(--cyan-400)', fontSize: '0.8rem', fontWeight: 600 }}>
                ⚡ {gadgets.filter(g => g.is_flash_sale).length} Flash Sale items
              </span>
            </div>
          </AnimatedSection>
        </div>
      </section>


      <section className="section">
        <div className="container">

          <AnimatedSection style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ash-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: '0.25rem' }}>Brand:</span>
                  {safeBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setActiveBrand(brand)}
                      style={{
                        padding: '0.35rem 0.875rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                        border: '1px solid', cursor: 'pointer', transition: 'all 200ms ease',
                        background: activeBrand === brand ? 'rgba(212,160,23,0.12)' : 'transparent',
                        color: activeBrand === brand ? 'var(--gold-400)' : 'var(--ash-500)',
                        borderColor: activeBrand === brand ? 'rgba(212,160,23,0.4)' : 'var(--border)',
                      }}
                    >
                      {brand}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowFlash(!showFlash)}
                    style={{
                      padding: '0.35rem 0.875rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                      border: '1px solid', cursor: 'pointer', transition: 'all 200ms ease',
                      background: showFlash ? 'rgba(34,211,238,0.12)' : 'transparent',
                      color: showFlash ? 'var(--cyan-400)' : 'var(--ash-500)',
                      borderColor: showFlash ? 'var(--cyan-glow)' : 'var(--border)',
                    }}
                  >
                    ⚡ Flash Sale
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    background: 'var(--surface)', color: 'var(--ash-200)',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '0.4rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', outline: 'none',
                  }}
                >
                  {sortOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </AnimatedSection>


          <AnimatedSection style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ash-500)' }}>
              Showing {filtered.length} gadget{filtered.length !== 1 ? 's' : ''}
            </p>
          </AnimatedSection>


          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {filtered.map((product, i) => (
              <AnimatedSection key={product.id} delay={i * 55}>
                <ProductCard product={product} />
              </AnimatedSection>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ash-500)' }}>
              No gadgets match your filters. Try adjusting the selection above.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
