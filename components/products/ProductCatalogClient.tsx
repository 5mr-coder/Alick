'use client';

import { useState } from 'react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import ProductCard from '@/components/products/ProductCard';
import { Filter, Search, X, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ShopModePicker from '@/components/shop/ShopModePicker';
import type { Product } from '@/types';
import { getEffectiveUnitPrice } from '@/lib/utils';

const sortOptions = [
  'Newest',
  'Price: Low to High',
  'Price: High to Low',
  'Featured',
];

function FilterSidebar({
  uniqueBrands,
  activeBrand,
  onBrandChange,
  showFlash,
  onShowFlashChange,
  onReset,
  radioName,
}: {
  uniqueBrands: string[];
  activeBrand: string;
  onBrandChange: (brand: string) => void;
  showFlash: boolean;
  onShowFlashChange: (checked: boolean) => void;
  onReset: () => void;
  radioName: string;
}) {
  return (
    <div className="filter-sidebar">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'var(--heading)',
            fontFamily: 'var(--font-display)',
          }}
        >
          Filters
        </h3>
        <button
          onClick={onReset}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--gold-400)',
            fontSize: '0.8125rem',
            cursor: 'pointer',
          }}
        >
          Clear All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h4
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--ash-200)',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Brand
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {uniqueBrands.map((brand) => (
              <label
                key={brand}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name={radioName}
                  checked={activeBrand === brand}
                  onChange={() => onBrandChange(brand)}
                  style={{ accentColor: 'var(--gold-400)' }}
                />
                <span
                  style={{
                    fontSize: '0.875rem',
                    color:
                      activeBrand === brand
                        ? 'var(--heading)'
                        : 'var(--ash-400)',
                  }}
                >
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--ash-200)',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Deals
          </h4>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={showFlash}
              onChange={(e) => onShowFlashChange(e.target.checked)}
              style={{ accentColor: 'var(--cyan-400)' }}
            />
            <span
              className="inline-flex items-center gap-1.5"
              style={{
                fontSize: '0.875rem',
                color: showFlash ? 'var(--cyan-400)' : 'var(--ash-400)',
              }}
            >
              <Zap size={14} aria-hidden="true" />
              Flash Sale
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default function ProductCatalogClient({
  products,
  title,
  label,
  subtitle,
  radioName,
}: {
  products: Product[];
  title: string;
  label: string;
  subtitle: string;
  radioName: string;
}) {
  const { salesMode, setSalesMode, isLoaded } = useCart();
  const activeSalesMode = salesMode ?? 'consumer';

  const [activeBrand, setActiveBrand] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [showFlash, setShowFlash] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const uniqueBrands = [
    'All',
    ...Array.from(
      new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b)))
    ),
  ];

  const resetFilters = () => {
    setActiveBrand('All');
    setShowFlash(false);
    setSortBy('Newest');
    setSearchQuery('');
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = products
    .filter((p) => (activeBrand === 'All' ? true : p.brand === activeBrand))
    .filter((p) => (showFlash ? p.is_flash_sale : true))
    .filter((p) => {
      if (!normalizedQuery) return true;
      const specValues = p.specs ? Object.values(p.specs).join(' ') : '';
      const haystack = `${p.name} ${p.brand || ''} ${p.model || ''} ${specValues}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    })
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') {
        return (
          getEffectiveUnitPrice(a, activeSalesMode) -
          getEffectiveUnitPrice(b, activeSalesMode)
        );
      }
      if (sortBy === 'Price: High to Low') {
        return (
          getEffectiveUnitPrice(b, activeSalesMode) -
          getEffectiveUnitPrice(a, activeSalesMode)
        );
      }
      if (sortBy === 'Featured') {
        return Number(b.is_featured) - Number(a.is_featured);
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  return (
    <>
      <section
        style={{
          padding: '3.25rem 0 2.5rem',
          background:
            'linear-gradient(180deg, var(--ash-900) 0%, var(--ash-950) 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="section-label">{label}</div>
                <h1 className="section-heading">{title}</h1>
                <p
                  style={{
                    color: 'var(--ash-400)',
                    marginTop: '0.5rem',
                    fontSize: '0.9375rem',
                    maxWidth: '580px',
                  }}
                >
                  {subtitle}
                </p>
              </div>
              {isLoaded && (
                <div className="shrink-0">
                  <ShopModePicker
                    mode={activeSalesMode}
                    onChange={setSalesMode}
                    compact
                  />
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="layout-grid">
            <div className="desktop-sidebar hidden-on-mobile">
              <FilterSidebar
                uniqueBrands={uniqueBrands}
                activeBrand={activeBrand}
                onBrandChange={setActiveBrand}
                showFlash={showFlash}
                onShowFlashChange={setShowFlash}
                onReset={resetFilters}
                radioName={radioName}
              />
            </div>

            <div className="main-content">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <p className="text-sm tabular-nums" style={{ color: 'var(--ash-400)' }}>
                  Showing{' '}
                  <span style={{ color: 'var(--heading)', fontWeight: 600 }}>
                    {filtered.length}
                  </span>{' '}
                  result{filtered.length !== 1 ? 's' : ''}
                </p>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative flex-1 sm:flex-initial min-w-[230px]">
                    <Search
                      size={15}
                      aria-hidden="true"
                      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'var(--ash-500)' }}
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search model or spec..."
                      aria-label="Search products"
                      style={{
                        width: '100%',
                        background: 'var(--surface)',
                        color: 'var(--heading)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '0.5rem 0.75rem 0.5rem 2.15rem',
                        fontSize: '0.875rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <button
                    className="mobile-filter-btn"
                    onClick={() => setMobileFiltersOpen(true)}
                  >
                    <Filter size={16} /> Filters
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort products"
                    style={{
                      background: 'var(--surface)',
                      color: 'var(--ash-200)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.875rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    {sortOptions.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {filtered.map((product, i) => (
                  <AnimatedSection key={product.id} delay={i * 50}>
                    <ProductCard product={product} />
                  </AnimatedSection>
                ))}
              </div>

              {filtered.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '4rem',
                    background: 'var(--surface)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    marginTop: '1rem',
                  }}
                >
                  <h3
                    style={{
                      color: 'var(--heading)',
                      fontSize: '1.125rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    No results found
                  </h3>
                  <p style={{ color: 'var(--ash-400)', fontSize: '0.875rem' }}>
                    Try adjusting your filters or search criteria.
                  </p>
                  <button
                    onClick={resetFilters}
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      background: 'var(--ash-800)',
                      color: 'var(--heading)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
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
        <div
          className="mobile-filter-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Product filters"
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              background: 'var(--ash-950)',
            }}
          >
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--heading)',
              }}
            >
              Filters
            </h2>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--heading)',
                cursor: 'pointer',
                padding: '0.5rem',
              }}
            >
              <X size={24} />
            </button>
          </div>
          <div
            style={{
              padding: '1.5rem',
              overflowY: 'auto',
              flex: 1,
              paddingBottom: '6rem',
            }}
          >
            <FilterSidebar
              uniqueBrands={uniqueBrands}
              activeBrand={activeBrand}
              onBrandChange={setActiveBrand}
              showFlash={showFlash}
              onShowFlashChange={setShowFlash}
              onReset={resetFilters}
              radioName={`${radioName}-mobile`}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '1rem 1.5rem',
              background: 'var(--ash-950)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '1rem',
            }}
          >
            <button
              onClick={resetFilters}
              style={{
                flex: 1,
                padding: '0.875rem',
                background: 'var(--ash-800)',
                color: 'var(--heading)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontWeight: 600,
              }}
            >
              Clear
            </button>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              style={{
                flex: 2,
                padding: '0.875rem',
                background: 'var(--gold-400)',
                color: 'var(--on-gold)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
              }}
            >
              Show {filtered.length} Results
            </button>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .layout-grid {
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
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
          overscroll-behavior: contain;
        }

        @media (max-width: 900px) {
          .layout-grid {
            grid-template-columns: minmax(0, 1fr);
          }
          .hidden-on-mobile {
            display: none;
          }
          .mobile-filter-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--surface);
            border: 1px solid var(--border);
            color: var(--heading);
            padding: 0.5rem 0.875rem;
            border-radius: 8px;
            font-size: 0.875rem;
            cursor: pointer;
          }
        }
      `,
        }}
      />
    </>
  );
}
