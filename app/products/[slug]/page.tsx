"use client";

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShinyButton } from '@/components/ui/shiny-button';
import { ShoppingCart, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import ShopModePicker from '@/components/shop/ShopModePicker';

import { getProductBySlug } from '@/types';

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { addToCart, salesMode, setSalesMode, isLoaded } = useCart();
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showRetailPrompt, setShowRetailPrompt] = useState(false);
  const product = getProductBySlug(params.slug);

  useEffect(() => {
    if (!isLoaded || !salesMode) return;
    setQuantity(salesMode === 'retail' ? 10 : 1);
  }, [isLoaded, salesMode, product?.id]);

  if (!product) {
    notFound();
  }

  const discount = product.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : null;

  const addProductToCart = () => {
    if (!salesMode) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      stock: product.stock,
      image: product.images[0],
      salesMode,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (!isLoaded) return null;
  if (!salesMode) return <ShopModePicker mode={salesMode} onChange={setSalesMode} />;

  const retailUnavailable = salesMode === 'retail' && product.stock < 10;
  const maximumQuantity = salesMode === 'consumer' ? Math.min(product.stock, 9) : product.stock;
  const quantityLimitReached = quantity >= maximumQuantity && !(salesMode === 'consumer' && quantity >= 9);

  return (
    <div style={{ background: 'var(--ash-950)', minHeight: '100vh', paddingBottom: '6rem' }}>
      <div className="container" style={{ paddingTop: '2rem' }}>
        <ShopModePicker mode={salesMode} onChange={setSalesMode} compact />
        <Link
          href="/products"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            color: 'var(--ash-400)', textDecoration: 'none', fontSize: '0.875rem',
            marginBottom: '2rem', transition: 'color 200ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-400)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ash-400)')}
        >
          <ArrowLeft size={14} />
          Back to Products
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}
          className="product-grid">

          <div>
            <div style={{
              aspectRatio: '4/3', borderRadius: '16px', overflow: 'hidden',
              border: '1px solid var(--border)', background: 'var(--ash-800)', marginBottom: '1rem',
            }}>
              <img
                src={product.images[activeImage]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    style={{
                      width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden',
                      border: i === activeImage ? '2px solid var(--gold-400)' : '2px solid var(--border)',
                      cursor: 'pointer', padding: 0, background: 'none', flexShrink: 0,
                      transition: 'border-color 200ms ease',
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
              <span className="badge badge-gold">{product.category?.name || 'Uncategorized'}</span>
              <span style={{ color: 'var(--ash-400)', fontSize: '0.8rem' }}>·</span>
              <span style={{ color: 'var(--gold-400)', fontSize: '0.8rem', fontWeight: 600 }}>{product.brand}</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gold-400)' }}>
                ₦{product.price.toLocaleString()}
              </span>
              {(product.old_price ?? 0) > 0 && (
                <span style={{ fontSize: '1.1rem', color: 'var(--ash-400)', textDecoration: 'line-through' }}>
                  ₦{product.old_price!.toLocaleString()}
                </span>
              )}
              {(discount ?? 0) > 0 && (
                <span className="badge badge-sale">–{discount}%</span>
              )}
            </div>

            <p style={{ color: 'var(--ash-300)', lineHeight: 1.75, marginBottom: '2rem', fontSize: '0.975rem' }}>
              {product.description}
            </p>

            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: '#ffffff', fontWeight: 600, fontSize: '0.95rem',
                marginBottom: '0.75rem', paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border)',
              }}>
                <Info size={15} color="var(--gold-400)" /> Key Specifications
              </h3>
              <dl style={{ display: 'grid', gap: '0' }}>
                {Object.entries(product.specs || {}).map(([key, val]) => (
                  <div key={key} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '0.6rem 0', borderBottom: '1px dashed rgba(255,255,255,0.06)',
                  }}>
                    <dt style={{ color: 'var(--ash-400)', fontSize: '0.875rem' }}>{key}</dt>
                    <dd style={{ color: '#fff', fontWeight: 500, fontSize: '0.875rem' }}>{val}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              {product.stock === 0 ? (
                <span style={{
                  display: 'inline-block', padding: '0.3rem 0.75rem', borderRadius: '6px',
                  background: 'rgba(34,211,238,0.1)', color: 'var(--cyan-400)',
                  fontSize: '0.8rem', fontWeight: 600, border: '1px solid var(--cyan-glow)',
                }}>Out of Stock</span>
              ) : product.stock < 5 ? (
                <span style={{
                  display: 'inline-block', padding: '0.3rem 0.75rem', borderRadius: '6px',
                  background: 'rgba(245,200,66,0.12)', color: 'var(--gold-400)',
                  fontSize: '0.8rem', fontWeight: 600, border: '1px solid var(--border-gold)',
                }}>⚠ Only {product.stock} left in stock!</span>
              ) : (
                <span style={{ color: 'var(--ash-400)', fontSize: '0.8rem' }}>✓ {product.stock} units available</span>
              )}
            </div>

            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--ash-400)', fontSize: '0.875rem' }}>Qty:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setQuantity((current) => Math.max(salesMode === 'retail' ? 10 : 1, current - 1))}
                    disabled={quantity <= (salesMode === 'retail' ? 10 : 1)}
                    aria-label="Decrease quantity"
                    style={{ padding: '0.4rem 0.75rem', background: 'var(--ash-800)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                  >−</button>
                  <span style={{ padding: '0.4rem 1rem', color: 'white', fontSize: '0.9rem', minWidth: '2.5rem', textAlign: 'center' }}>{quantity}</span>
                  <button
                    onClick={() => {
                      if (salesMode === 'consumer' && quantity >= 9) {
                        setShowRetailPrompt(true);
                        return;
                      }
                      setQuantity((current) => Math.min(maximumQuantity, current + 1));
                    }}
                    disabled={quantityLimitReached || retailUnavailable}
                    aria-label="Increase quantity"
                    style={{ padding: '0.4rem 0.75rem', background: 'var(--ash-800)', color: quantityLimitReached || retailUnavailable ? 'var(--ash-600)' : 'white', border: 'none', cursor: quantityLimitReached || retailUnavailable ? 'default' : 'pointer', fontSize: '1rem' }}
                  >+</button>
                </div>
                {quantity >= maximumQuantity && !retailUnavailable && !(salesMode === 'consumer' && quantity >= 9) && (
                  <span style={{ color: 'var(--gold-400)', fontSize: '0.75rem', fontWeight: 600 }}>Selected all available</span>
                )}
              </div>
            )}

            {retailUnavailable && (
              <p role="status" style={{ color: 'var(--gold-400)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Retail orders start at 10 units. There are {product.stock} listed in stock, so contact us to confirm bulk availability.
              </p>
            )}

            {product.stock === 0 ? (
              <button disabled style={{
                width: '100%', padding: '0.875rem', borderRadius: '10px',
                background: 'var(--ash-800)', color: 'var(--ash-500)',
                border: '1px solid var(--border)', cursor: 'not-allowed', fontSize: '0.95rem', fontWeight: 600,
              }}>
                Out of Stock
              </button>
            ) : retailUnavailable ? (
              <a
                href={`https://wa.me/2348030841357?text=${encodeURIComponent(`Hi, I would like to ask about a retail order of at least 10 ${product.name}.` )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', width: '100%', padding: '0.875rem', borderRadius: '10px', background: 'var(--gold-400)', color: '#111', textAlign: 'center', textDecoration: 'none', fontWeight: 700 }}
              >
                Ask about bulk availability
              </a>
            ) : (
              <ShinyButton
                onClick={addProductToCart}
                className={added ? 'shiny-added' : ''}
              >
                {added ? '✓ Added to Cart!' : <><ShoppingCart size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />Add to Cart</>}
              </ShinyButton>
            )}
          </div>
        </div>
      </div>

      {showRetailPrompt && (
        <div role="presentation" onClick={() => setShowRetailPrompt(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.72)', display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <div role="dialog" aria-modal="true" aria-labelledby="retail-prompt-title" onClick={(event) => event.stopPropagation()} style={{ width: '100%', maxWidth: '440px', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-gold)', background: 'var(--ash-900)', color: 'white' }}>
            <h2 id="retail-prompt-title" style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Buying 10 or more?</h2>
            <p style={{ color: 'var(--ash-300)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Switch to retail mode to place orders starting at 10 units per product.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { setSalesMode('retail'); setQuantity(10); setShowRetailPrompt(false); }}
                style={{ flex: 1, padding: '0.8rem 1rem', border: 0, borderRadius: '8px', background: 'var(--gold-400)', color: '#111', fontWeight: 700, cursor: 'pointer' }}
              >
                Switch to retail mode
              </button>
              <button type="button" onClick={() => setShowRetailPrompt(false)} style={{ padding: '0.8rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'transparent', color: 'white', cursor: 'pointer' }}>
                Keep shopping
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ marginTop: '4rem', paddingTop: '4rem', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', marginBottom: '2rem' }}>Customer Reviews</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }} className="product-grid">
          <div>
            <p style={{ color: 'var(--ash-400)' }}>No reviews yet. Be the first to review!</p>
          </div>

          <div style={{ background: 'var(--ash-900)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Write a Review</h3>
            <p style={{ color: 'var(--ash-400)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Reviews are not available yet.
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
        .shiny-added {
          --shiny-cta-highlight: #22c55e !important;
          --shiny-cta-highlight-subtle: #86efac !important;
        }
      `}} />
    </div>
  );
}
