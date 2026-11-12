"use client";

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShinyButton } from '@/components/ui/shiny-button';
import { ShoppingCart, Check, ArrowLeft, Info, Star } from 'lucide-react';
import Link from 'next/link';

import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Unwrap params if it's a promise (Next.js 14+ best practice for client components)
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => {
    Promise.resolve(params).then(p => setSlug(p.slug));
  }, [params]);

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', rating: 5, text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(name)')
        .eq('slug', slug)
        .single();
      
      if (data && !error) {
        setProduct(data);
        setQuantity(1); // reset quantity when product loads
        
        const { data: reviewsData } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', data.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });
        setReviews(reviewsData || []);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ background: 'var(--ash-950)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--ash-400)' }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const discount = product.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : null;

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!reviewForm.name || !reviewForm.email || !reviewForm.text) { setReviewError('Please fill all fields'); return; }
    setSubmittingReview(true); setReviewError('');
    const { error } = await supabase.from('product_reviews').insert({
      product_id: product.id,
      reviewer_name: reviewForm.name,
      reviewer_email: reviewForm.email,
      rating: reviewForm.rating,
      text: reviewForm.text,
    });
    setSubmittingReview(false);
    if (error) setReviewError(error.message);
    else { setReviewSubmitted(true); setReviewForm({ name: '', email: '', rating: 5, text: '' }); }
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      stock: product.stock,
      image: product.images[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div style={{ background: 'var(--ash-950)', minHeight: '100vh', paddingBottom: '6rem' }}>
      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Breadcrumb */}
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

          {/* ── Images ── */}
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

          {/* ── Details ── */}
          <div>
            {/* Brand + category */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
              <span className="badge badge-gold">{product.category?.name || 'Uncategorized'}</span>
              <span style={{ color: 'var(--ash-400)', fontSize: '0.8rem' }}>·</span>
              <span style={{ color: 'var(--gold-400)', fontSize: '0.8rem', fontWeight: 600 }}>{product.brand}</span>
            </div>

            {/* Name — explicit white so it's always readable */}
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

            {/* Price */}
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

            {/* Description */}
            <p style={{ color: 'var(--ash-300)', lineHeight: 1.75, marginBottom: '2rem', fontSize: '0.975rem' }}>
              {product.description}
            </p>

            {/* Specs */}
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

            {/* Stock indicator */}
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

            {/* Quantity selector */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--ash-400)', fontSize: '0.875rem' }}>Qty:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ padding: '0.4rem 0.75rem', background: 'var(--ash-800)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                  >−</button>
                  <span style={{ padding: '0.4rem 1rem', color: 'white', fontSize: '0.9rem', minWidth: '2.5rem', textAlign: 'center' }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    style={{ padding: '0.4rem 0.75rem', background: 'var(--ash-800)', color: quantity >= product.stock ? 'var(--ash-600)' : 'white', border: 'none', cursor: quantity >= product.stock ? 'default' : 'pointer', fontSize: '1rem' }}
                  >+</button>
                </div>
                {quantity >= product.stock && (
                  <span style={{ color: 'var(--gold-400)', fontSize: '0.75rem', fontWeight: 600 }}>Selected all available</span>
                )}
              </div>
            )}

            {/* Add to Cart */}
            {product.stock === 0 ? (
              <button disabled style={{
                width: '100%', padding: '0.875rem', borderRadius: '10px',
                background: 'var(--ash-800)', color: 'var(--ash-500)',
                border: '1px solid var(--border)', cursor: 'not-allowed', fontSize: '0.95rem', fontWeight: 600,
              }}>
                Out of Stock
              </button>
            ) : (
              <ShinyButton
                onClick={handleAddToCart}
                className={added ? 'shiny-added' : ''}
              >
                {added ? '✓ Added to Cart!' : <><ShoppingCart size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />Add to Cart</>}
              </ShinyButton>
            )}
          </div>
        </div>
      </div>

      {/* Product Reviews Section */}
      <div className="container" style={{ marginTop: '4rem', paddingTop: '4rem', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', marginBottom: '2rem' }}>Customer Reviews</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }} className="product-grid">
          {/* Reviews List */}
          <div>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--ash-400)' }}>No reviews yet. Be the first to review!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reviews.map(review => (
                  <div key={review.id} style={{ background: 'var(--ash-900)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{review.reviewer_name}</span>
                      <div style={{ display: 'flex', gap: '2px', color: '#c9a84c' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < review.rating ? '#c9a84c' : 'transparent'} stroke={i < review.rating ? '#c9a84c' : 'var(--ash-600)'} />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: 'var(--ash-300)', fontSize: '0.9rem', lineHeight: 1.6 }}>{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Form */}
          <div style={{ background: 'var(--ash-900)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Write a Review</h3>
            {reviewSubmitted ? (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                Thank you! Your review has been submitted and is pending approval.
              </div>
            ) : (
              <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviewError && <div style={{ color: 'var(--cyan-400)', fontSize: '0.875rem' }}>{reviewError}</div>}
                <div>
                  <label style={{ display: 'block', color: 'var(--ash-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Rating</label>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" onClick={() => setReviewForm(f => ({...f, rating: star}))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <Star size={24} fill={star <= reviewForm.rating ? '#c9a84c' : 'transparent'} stroke={star <= reviewForm.rating ? '#c9a84c' : 'var(--ash-500)'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--ash-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Name</label>
                  <input type="text" value={reviewForm.name} onChange={e => setReviewForm(f => ({...f, name: e.target.value}))} style={{ width: '100%', padding: '0.75rem', background: 'var(--ash-950)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--ash-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Email</label>
                  <input type="email" value={reviewForm.email} onChange={e => setReviewForm(f => ({...f, email: e.target.value}))} style={{ width: '100%', padding: '0.75rem', background: 'var(--ash-950)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--ash-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Review</label>
                  <textarea value={reviewForm.text} onChange={e => setReviewForm(f => ({...f, text: e.target.value}))} rows={4} style={{ width: '100%', padding: '0.75rem', background: 'var(--ash-950)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', resize: 'vertical' }} required />
                </div>
                <button type="submit" disabled={submittingReview} style={{ width: '100%', padding: '0.875rem', background: '#c9a84c', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: submittingReview ? 'not-allowed' : 'pointer' }}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
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
