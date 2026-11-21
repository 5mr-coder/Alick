'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Info,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import ShopModePicker from '@/components/shop/ShopModePicker';
import SkeletonImage from '@/components/ui/SkeletonImage';
import type { Product, Review } from '@/types';
import { formatNaira, getEffectiveUnitPrice } from '@/lib/utils';
import { submitReview } from '@/lib/actions/public';

export default function ProductDetailClient({
  product,
  reviews,
  whatsappNumber,
}: {
  product: Product;
  reviews: Review[];
  whatsappNumber: string;
}) {
  const { addToCart, salesMode, setSalesMode, isLoaded } = useCart();
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [prevSalesMode, setPrevSalesMode] = useState<typeof salesMode>(null);
  const [showRetailPrompt, setShowRetailPrompt] = useState(false);
  const [showConsumerPrompt, setShowConsumerPrompt] = useState(false);

  if (isLoaded && salesMode && salesMode !== prevSalesMode) {
    setPrevSalesMode(salesMode);
    setQuantity(salesMode === 'retail' ? 10 : 1);
  }

  const [reviewForm, setReviewForm] = useState({
    author_name: '',
    rating: 5,
    comment: '',
    website: '',
  });
  const [reviewState, setReviewState] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');
  const [reviewError, setReviewError] = useState<string | null>(null);

  const activeSalesMode = salesMode ?? 'consumer';
  const effectivePrice = getEffectiveUnitPrice(product, activeSalesMode);
  const strikePrice =
    product.old_price && product.old_price > effectivePrice
      ? product.old_price
      : product.base_price > effectivePrice
        ? product.base_price
        : 0;
  const discount =
    strikePrice > effectivePrice
      ? Math.round(((strikePrice - effectivePrice) / strikePrice) * 100)
      : null;

  const addProductToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: effectivePrice,
      consumerPrice: product.price,
      retailPrice: product.retail_price,
      quantity,
      stock: product.stock,
      image: product.images[0] || '',
      salesMode: activeSalesMode,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewState('submitting');
    setReviewError(null);
    const res = await submitReview({
      product_id: product.id,
      author_name: reviewForm.author_name,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      website: reviewForm.website,
    });
    if (!res.ok) {
      setReviewState('error');
      setReviewError(res.error || 'Could not submit review.');
      return;
    }
    setReviewState('success');
    setReviewForm({ author_name: '', rating: 5, comment: '', website: '' });
  };

  const retailUnavailable = activeSalesMode === 'retail' && product.stock < 10;
  const maximumQuantity =
    activeSalesMode === 'consumer' ? Math.min(product.stock, 9) : product.stock;
  const quantityLimitReached =
    quantity >= maximumQuantity && !(activeSalesMode === 'consumer' && quantity >= 9);

  const whatsappDigits = whatsappNumber.replace(/\D/g, '') || '2348030841357';

  return (
    <div
      className="pb-28 md:pb-24"
      style={{
        background: 'var(--ash-950)',
        minHeight: '100vh',
      }}
    >
      <div className="container" style={{ paddingTop: '2rem' }}>
        <Link
          href={
            product.category_id === 'desktops'
              ? '/desktops'
              : product.category_id === 'smart-gadgets'
                ? '/smart-gadgets'
                : '/products'
          }
          className="inline-flex items-center gap-1.5 text-sm mb-8 no-underline transition-colors hover:text-[var(--gold-400)]"
          style={{ color: 'var(--ash-400)' }}
        >
          <ArrowLeft size={14} />
          Back to Products
        </Link>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'start',
          }}
          className="product-grid"
        >
          <div>
            <div
              className="img-outline"
              style={{
                aspectRatio: '4/3',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--ash-800)',
                marginBottom: '1rem',
              }}
            >
              {product.images[activeImage] ? (
                <SkeletonImage
                  src={product.images[activeImage]}
                  alt={product.name}
                  loading="eager"
                />
              ) : (
                <div
                  className="skeleton"
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ash-500)',
                  }}
                >
                  No image available
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border:
                        i === activeImage
                          ? '2px solid var(--gold-400)'
                          : '2px solid var(--border)',
                      cursor: 'pointer',
                      padding: 0,
                      background: 'none',
                      flexShrink: 0,
                      transition: 'border-color 200ms ease',
                    }}
                  >
                    <SkeletonImage
                      src={img}
                      alt=""
                      ariaHidden
                      as="span"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '0.75rem',
                alignItems: 'center',
              }}
            >
              <span className="badge badge-gold">
                {product.category?.name || 'Uncategorized'}
              </span>
              {product.brand && (
                <>
                  <span style={{ color: 'var(--ash-400)', fontSize: '0.8rem' }}>
                    ·
                  </span>
                  <span
                    style={{
                      color: 'var(--gold-400)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    {product.brand}
                  </span>
                </>
              )}
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: 'var(--heading)',
                lineHeight: 1.1,
                marginBottom: '1rem',
              }}
            >
              {product.name}
            </h1>

            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.875rem',
                marginBottom: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <span
                className="tabular-nums"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--heading)',
                }}
              >
                {formatNaira(effectivePrice)}
              </span>
              {strikePrice > 0 && (
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: '1.05rem',
                    color: 'var(--ash-400)',
                    textDecoration: 'line-through',
                  }}
                >
                  {formatNaira(strikePrice)}
                </span>
              )}
              {(discount ?? 0) > 0 && (
                <span className="badge badge-sale tabular-nums">–{discount}%</span>
              )}
            </div>

            {isLoaded && (
              <div style={{ marginBottom: '1.25rem' }}>
                <ShopModePicker
                  mode={activeSalesMode}
                  onChange={setSalesMode}
                  compact
                />
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              {product.stock === 0 ? (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    background: 'rgba(34,211,238,0.1)',
                    color: 'var(--cyan-400)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: '1px solid var(--cyan-glow)',
                  }}
                >
                  Out of Stock
                </span>
              ) : product.stock < 5 ? (
                <span
                  className="inline-flex items-center gap-1.5 tabular-nums"
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    background: 'rgba(245,200,66,0.12)',
                    color: 'var(--gold-400)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: '1px solid var(--border-gold)',
                  }}
                >
                  <AlertTriangle size={14} aria-hidden="true" />
                  Only {product.stock} left in stock
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 tabular-nums"
                  style={{ color: 'var(--ash-400)', fontSize: '0.8125rem' }}
                >
                  <Check size={14} style={{ color: 'var(--cyan-400)' }} aria-hidden="true" />
                  {product.stock} units available
                </span>
              )}
            </div>

            {product.stock > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: 'var(--ash-400)', fontSize: '0.875rem' }}>
                    Qty:
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => {
                        if (activeSalesMode === 'retail' && quantity <= 10) {
                          setShowConsumerPrompt(true);
                          return;
                        }
                        setQuantity((current) =>
                          Math.max(activeSalesMode === 'retail' ? 10 : 1, current - 1)
                        );
                      }}
                      aria-label="Decrease quantity"
                      style={{
                        padding: '0.45rem 0.85rem',
                        background: 'var(--ash-800)',
                        color: 'var(--heading)',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                      }}
                    >
                      −
                    </button>
                    <span
                      className="tabular-nums"
                      style={{
                        padding: '0.45rem 1rem',
                        color: 'var(--heading)',
                        fontSize: '0.9rem',
                        minWidth: '2.5rem',
                        textAlign: 'center',
                      }}
                    >
                      {quantity}
                    </span>
                    <button
                      onClick={() => {
                        if (activeSalesMode === 'consumer' && quantity >= 9) {
                          setShowRetailPrompt(true);
                          return;
                        }
                        setQuantity((current) =>
                          Math.min(maximumQuantity, current + 1)
                        );
                      }}
                      disabled={quantityLimitReached || retailUnavailable}
                      aria-label="Increase quantity"
                      style={{
                        padding: '0.45rem 0.85rem',
                        background: 'var(--ash-800)',
                        color:
                          quantityLimitReached || retailUnavailable
                            ? 'var(--ash-600)'
                            : 'var(--heading)',
                        border: 'none',
                        cursor:
                          quantityLimitReached || retailUnavailable
                            ? 'default'
                            : 'pointer',
                        fontSize: '1rem',
                      }}
                    >
                      +
                    </button>
                  </div>
                  {quantity >= maximumQuantity &&
                    !retailUnavailable &&
                    !(activeSalesMode === 'consumer' && quantity >= 9) && (
                      <span
                        style={{
                          color: 'var(--gold-400)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        Selected all available
                      </span>
                    )}
                </div>

                {quantity > 1 && !retailUnavailable && (
                  <div
                    className="text-sm tabular-nums"
                    style={{ color: 'var(--ash-300)' }}
                  >
                    Subtotal:{' '}
                    <strong style={{ color: 'var(--heading)' }}>
                      {formatNaira(effectivePrice * quantity)}
                    </strong>
                  </div>
                )}
              </div>
            )}

            {retailUnavailable && (
              <p
                role="status"
                style={{
                  color: 'var(--gold-400)',
                  lineHeight: 1.6,
                  marginBottom: '1.25rem',
                }}
              >
                Retail orders start at 10 units. There are {product.stock} listed
                in stock, so contact us to confirm bulk availability.
              </p>
            )}

            {product.stock === 0 ? (
              <button
                disabled
                style={{
                  width: '100%',
                  height: '50px',
                  borderRadius: '10px',
                  background: 'var(--ash-800)',
                  color: 'var(--ash-500)',
                  border: '1px solid var(--border)',
                  cursor: 'not-allowed',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              >
                Out of Stock
              </button>
            ) : retailUnavailable ? (
              <a
                href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
                  `Hi, I would like to ask about a retail order of at least 10 ${product.name}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '50px',
                  borderRadius: '10px',
                  background: 'var(--gold-fill)',
                  color: 'var(--on-gold-fill)',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              >
                Ask about bulk availability
              </a>
            ) : (
              <button
                type="button"
                onClick={addProductToCart}
                className="active:scale-[0.985] transition-transform transition-colors"
                style={{
                  width: '100%',
                  height: '50px',
                  borderRadius: '10px',
                  border: 'none',
                  background: added ? '#22c55e' : 'var(--gold-fill)',
                  color: added ? '#052e16' : 'var(--on-gold-fill)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {added ? (
                  <>
                    <Check size={17} aria-hidden="true" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={17} aria-hidden="true" />
                    Add to Cart
                  </>
                )}
              </button>
            )}

            <div
              className="mt-4 p-3.5 rounded-xl flex flex-col gap-2 text-xs"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--ash-300)',
              }}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} style={{ color: 'var(--gold-400)', flexShrink: 0 }} aria-hidden="true" />
                <span>Stress-tested hardware backed by Alick store warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={15} style={{ color: 'var(--gold-400)', flexShrink: 0 }} aria-hidden="true" />
                <span>Same-day Ikeja pickup or tracked Lagos & interstate delivery</span>
              </div>
            </div>

            {product.description && (
              <p
                style={{
                  color: 'var(--ash-300)',
                  lineHeight: 1.75,
                  marginTop: '2rem',
                  marginBottom: '2rem',
                  fontSize: '0.95rem',
                }}
              >
                {product.description}
              </p>
            )}

            {Object.keys(product.specs || {}).length > 0 && (
              <div style={{ marginTop: product.description ? 0 : '2rem' }}>
                <h3
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--heading)',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <Info size={15} color="var(--gold-400)" /> Key Specifications
                </h3>
                <dl style={{ display: 'grid', gap: '0' }}>
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0',
                        borderBottom: '1px dashed var(--border)',
                      }}
                    >
                      <dt style={{ color: 'var(--ash-400)', fontSize: '0.875rem' }}>
                        {key}
                      </dt>
                      <dd
                        style={{
                          color: 'var(--heading)',
                          fontWeight: 500,
                          fontSize: '0.875rem',
                        }}
                      >
                        {val}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>

      {showConsumerPrompt && (
        <div
          role="presentation"
          onClick={() => setShowConsumerPrompt(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.72)',
            display: 'grid',
            placeItems: 'center',
            padding: '1rem',
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consumer-prompt-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid var(--border-gold)',
              background: 'var(--ash-900)',
              color: 'var(--heading)',
            }}
          >
            <h2
              id="consumer-prompt-title"
              style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}
            >
              Ordering fewer than 10?
            </h2>
            <p
              style={{
                color: 'var(--ash-300)',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
              }}
            >
              Retail mode starts at 10 units. Switch to personal shopping to buy
              between 1 and 9 units of this product.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setSalesMode('consumer');
                  setQuantity(Math.min(9, product.stock));
                  setShowConsumerPrompt(false);
                }}
                style={{
                  flex: 1,
                  padding: '0.8rem 1rem',
                  border: 0,
                  borderRadius: '8px',
                  background: 'var(--gold-400)',
                  color: 'var(--on-gold)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Switch to personal shopping
              </button>
              <button
                type="button"
                onClick={() => setShowConsumerPrompt(false)}
                style={{
                  padding: '0.8rem 1rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: 'var(--heading)',
                  cursor: 'pointer',
                }}
              >
                Keep retail quantity
              </button>
            </div>
          </div>
        </div>
      )}

      {showRetailPrompt && (
        <div
          role="presentation"
          onClick={() => setShowRetailPrompt(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.72)',
            display: 'grid',
            placeItems: 'center',
            padding: '1rem',
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="retail-prompt-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid var(--border-gold)',
              background: 'var(--ash-900)',
              color: 'var(--heading)',
            }}
          >
            <h2
              id="retail-prompt-title"
              style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}
            >
              Buying 10 or more?
            </h2>
            <p
              style={{
                color: 'var(--ash-300)',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
              }}
            >
              Switch to retail mode to place orders starting at 10 units per
              product.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setSalesMode('retail');
                  setQuantity(10);
                  setShowRetailPrompt(false);
                }}
                style={{
                  flex: 1,
                  padding: '0.8rem 1rem',
                  border: 0,
                  borderRadius: '8px',
                  background: 'var(--gold-400)',
                  color: 'var(--on-gold)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Switch to retail mode
              </button>
              <button
                type="button"
                onClick={() => setShowRetailPrompt(false)}
                style={{
                  padding: '0.8rem 1rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: 'var(--heading)',
                  cursor: 'pointer',
                }}
              >
                Keep shopping
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="container"
        style={{
          marginTop: '4rem',
          paddingTop: '4rem',
          borderTop: '1px solid var(--border)',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            color: 'var(--heading)',
            marginBottom: '2rem',
          }}
        >
          Customer Reviews
        </h2>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}
          className="product-grid"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.length === 0 ? (
              <div
                style={{
                  background: 'var(--surface)',
                  padding: '1.75rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: 'var(--heading)',
                    marginBottom: '0.4rem',
                  }}
                >
                  No reviews yet
                </div>
                <p style={{ color: 'var(--ash-400)', fontSize: '0.875rem', lineHeight: 1.65 }}>
                  Purchased this device from our Ikeja store or online? Share your
                  feedback using the form to help other buyers.
                </p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    background: 'var(--surface)',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <strong style={{ color: 'var(--gold-400)', fontSize: '0.9rem' }}>
                      {rev.reviewer_name}
                    </strong>
                    <span
                      aria-label={`${rev.rating} out of 5 stars`}
                      className="inline-flex items-center gap-0.5"
                      style={{ color: 'var(--gold-400)' }}
                    >
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          size={14}
                          fill={idx < rev.rating ? 'currentColor' : 'none'}
                          aria-hidden="true"
                        />
                      ))}
                    </span>
                  </div>
                  <p
                    style={{
                      color: 'var(--ash-300)',
                      fontSize: '0.875rem',
                      lineHeight: 1.65,
                    }}
                  >
                    {rev.text}
                  </p>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              background: 'var(--surface)',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid var(--border)',
            }}
          >
            <h3
              style={{
                color: 'var(--heading)',
                fontSize: '1.25rem',
                marginBottom: '1.25rem',
                fontWeight: 600,
              }}
            >
              Write a Review
            </h3>

            {reviewState === 'success' ? (
              <div style={{ color: 'var(--cyan-400)', lineHeight: 1.6 }}>
                Thank you! Your review has been submitted and will appear once
                approved by our team.
              </div>
            ) : (
              <form
                onSubmit={handleReviewSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={reviewForm.website}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, website: e.target.value })
                  }
                  style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                />

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      color: 'var(--ash-300)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Your Name *
                  </label>
                  <input
                    required
                    minLength={2}
                    maxLength={80}
                    value={reviewForm.author_name}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        author_name: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '8px',
                      background: 'var(--ash-900)',
                      border: '1px solid var(--border)',
                      color: 'var(--heading)',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      color: 'var(--ash-300)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Rating *
                  </label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        rating: Number(e.target.value),
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '8px',
                      background: 'var(--ash-900)',
                      border: '1px solid var(--border)',
                      color: 'var(--heading)',
                    }}
                  >
                    <option value={5}>5 Stars — Excellent</option>
                    <option value={4}>4 Stars — Very Good</option>
                    <option value={3}>3 Stars — Good</option>
                    <option value={2}>2 Stars — Fair</option>
                    <option value={1}>1 Star — Poor</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      color: 'var(--ash-300)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Review *
                  </label>
                  <textarea
                    required
                    minLength={5}
                    maxLength={1000}
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '8px',
                      background: 'var(--ash-900)',
                      border: '1px solid var(--border)',
                      color: 'var(--heading)',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {reviewError && (
                  <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
                    {reviewError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={reviewState === 'submitting'}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--gold-400)',
                    color: 'var(--on-gold)',
                    fontWeight: 700,
                    cursor:
                      reviewState === 'submitting' ? 'not-allowed' : 'pointer',
                  }}
                >
                  {reviewState === 'submitting'
                    ? 'Submitting...'
                    : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `,
        }}
      />

      {product.stock > 0 && !retailUnavailable && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3"
          style={{
            background: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.28)',
          }}
        >
          <div className="min-w-0">
            <div
              className="text-[0.65rem] uppercase tracking-[0.08em]"
              style={{ color: 'var(--ash-400)' }}
            >
              {activeSalesMode === 'retail' ? 'Retail total' : 'Total'}
            </div>
            <div
              className="text-base font-bold tabular-nums truncate"
              style={{ color: 'var(--heading)' }}
            >
              {formatNaira(effectivePrice * quantity)}
            </div>
          </div>
          <button
            type="button"
            onClick={addProductToCart}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm inline-flex items-center gap-1.5 shrink-0 active:scale-[0.97] transition-transform"
            style={{
              background: added ? '#22c55e' : 'var(--gold-fill)',
              color: added ? '#052e16' : 'var(--on-gold-fill)',
              border: 0,
              cursor: 'pointer',
            }}
          >
            {added ? (
              <>
                <Check size={15} aria-hidden="true" /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={15} aria-hidden="true" /> Add to Cart
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
