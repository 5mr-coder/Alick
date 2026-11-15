'use client';

import { useState } from 'react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import ProductCard from '@/components/products/ProductCard';
import { getProductsByCategory } from '@/types';
import { Filter, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ShopModePicker from '@/components/shop/ShopModePicker';

const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Featured'];

export default function LaptopsPage() {
  const { salesMode, setSalesMode, isLoaded } = useCart();
  const laptops = getProductsByCategory('laptops');

  const [activeBrand, setActiveBrand] = useState('All');
  const [sortBy, setSortBy]           = useState('Newest');
  const [showFlash, setShowFlash]     = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const uniqueBrands = ['All', ...Array.from(new Set(laptops.map(p => p.brand).filter((b): b is string => Boolean(b))))];

  const resetFilters = () => {
    setActiveBrand('All');
    setShowFlash(false);
    setSortBy('Newest');
  };

  const filtered = laptops
    .filter(p => activeBrand === 'All' ? true : p.brand === activeBrand)
    .filter(p => showFlash ? p.is_flash_sale : true)
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Featured') return Number(b.is_featured) - Number(a.is_featured);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const FilterSidebar = () => (
    <div className="filter-sidebar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', fontFamily: 'var(--font-display)' }}>Filters</h3>
        <button
          onClick={resetFilters}
          style={{ background: 'transparent', border: 'none', color: 'var(--gold-400)', fontSize: '0.8125rem', cursor: 'pointer' }}
        >
          Clear All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ash-200)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brand</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {uniqueBrands.map(brand => (
              <label key={brand} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="brand"
                  checked={activeBrand === brand}
                  onChange={() => setActiveBrand(brand)}
                  style={{ accentColor: 'var(--gold-400)' }}
                />
                <span style={{ fontSize: '0.875rem', color: activeBrand === brand ? 'white' : 'var(--ash-400)' }}>{brand}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ash-200)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deals</h4>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showFlash}
              onChange={(e) => setShowFlash(e.target.checked)}
              style={{ accentColor: 'var(--cyan-400)' }}
            />
            <span style={{ fontSize: '0.875rem', color: showFlash ? 'var(--cyan-400)' : 'var(--ash-400)' }}>⚡ Flash Sale</span>
          </label>
        </div>
      </div>
    </div>
  );

  if (!isLoaded) return null;
  if (!salesMode) return <ShopModePicker mode={salesMode} onChange={setSalesMode} />;

  return (
    <>
      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <ShopModePicker mode={salesMode} onChange={setSalesMode} compact />
      </div>
      <section
        style={{
          padding: '4rem 0 3rem',
          background: 'linear-gradient(180deg, var(--ash-900) 0%, var(--ash-950) 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container">
          <AnimatedSection>
            <div className="section-label">Our Inventory</div>
            <h1 className="section-heading">Laptops</h1>
            <p style={{ color: 'var(--ash-400)', marginTop: '0.5rem', fontSize: '0.9375rem' }}>
              {laptops.length} laptops available — new arrivals weekly
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="layout-grid">
            <div className="desktop-sidebar hidden-on-mobile">
              <FilterSidebar />
            </div>

            <div className="main-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--ash-400)' }}>
                  Showing <span style={{ color: 'white', fontWeight: 600 }}>{filtered.length}</span> results
                </p>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button
                    className="mobile-filter-btn"
                    onClick={() => setMobileFiltersOpen(true)}
                  >
                    <Filter size={16} /> Filters
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      background: 'var(--surface)', color: 'var(--ash-200)',
                      border: '1px solid var(--border)', borderRadius: '8px',
                      padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer', outline: 'none',
                    }}
                  >
                    {sortOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
                {filtered.map((product, i) => (
                  <AnimatedSection key={product.id} delay={i * 50}>
                    <ProductCard product={product} />
                  </AnimatedSection>
                ))}
              </div>

              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '1rem' }}>
                  <h3 style={{ color: 'white', fontSize: '1.125rem', marginBottom: '0.5rem' }}>No results found</h3>
                  <p style={{ color: 'var(--ash-400)', fontSize: '0.875rem' }}>Try adjusting your filters or search criteria.</p>
                  <button
                    onClick={resetFilters}
                    style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'var(--ash-800)', color: 'white', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {mobileFiltersOpen && (
        <div className="mobile-filter-modal">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--ash-950)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>Filters</h2>
            <button onClick={() => setMobileFiltersOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem' }}>
              <X size={24} />
            </button>
          </div>
          <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, paddingBottom: '6rem' }}>
            <FilterSidebar />
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem 1.5rem', background: 'var(--ash-950)', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
            <button
              onClick={resetFilters}
              style={{ flex: 1, padding: '0.875rem', background: 'var(--ash-800)', color: 'white', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600 }}
            >
              Clear
            </button>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              style={{ flex: 2, padding: '0.875rem', background: 'var(--gold-400)', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 600 }}
            >
              Show {filtered.length} Results
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .layout-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 2rem;
          align-items: start;
        }
        .filter-sidebar {
          position: sticky;
          top: 100px;
        }
        .mobile-filter-btn {
          display: none;
        }
        .mobile-filter-modal {
          position: fixed;
          inset: 0;
          background: var(--ash-950);
          z-index: 9999;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 900px) {
          .layout-grid {
            grid-template-columns: 1fr;
          }
          .hidden-on-mobile {
            display: none;
          }
          .mobile-filter-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--ash-800);
            border: 1px solid var(--border);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.875rem;
            cursor: pointer;
          }
        }
      `}} />
    </>
  );
}
