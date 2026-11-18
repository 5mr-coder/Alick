'use client';

import { useState } from 'react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import type { Review } from '@/types';
import { submitReview } from '@/lib/actions/public';

export default function ReviewsClient({ reviews }: { reviews: Review[] }) {
  const [form, setForm] = useState({
    author_name: '',
    rating: 5,
    comment: '',
    website: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg(null);
    const res = await submitReview({
      author_name: form.author_name,
      rating: form.rating,
      comment: form.comment,
      website: form.website,
    });
    if (!res.ok) {
      setStatus('error');
      setErrorMsg(res.error || 'Could not submit review.');
      return;
    }
    setStatus('success');
    setForm({ author_name: '', rating: 5, comment: '', website: '' });
  };

  return (
    <>
      <section
        style={{
          padding: '5rem 0 3.5rem',
          background:
            'linear-gradient(180deg, var(--ash-900) 0%, var(--ash-950) 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container">
          <AnimatedSection style={{ maxWidth: '600px' }}>
            <div className="section-label">
              <span
                style={{
                  background: 'var(--gold-400)',
                  width: '2rem',
                  height: '1px',
                  display: 'inline-block',
                }}
              />
              Happy Customers
            </div>
            <h1 className="section-heading">Customer Reviews</h1>
            <p
              style={{
                color: 'var(--ash-400)',
                marginTop: '0.75rem',
                fontSize: '0.9375rem',
                lineHeight: 1.7,
              }}
            >
              Real feedback from real customers. See what people are saying
              about Alick System Services.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {reviews.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem',
                color: 'var(--ash-500)',
              }}
            >
              No reviews yet. Check back soon!
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {reviews.map((review, i) => (
                <AnimatedSection key={review.id} delay={i * 60}>
                  <div
                    className="card"
                    style={{
                      overflow: 'hidden',
                      borderRadius: '14px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                  >
                    {review.image_url && (
                      <div
                        style={{
                          overflow: 'hidden',
                          borderRadius: '14px 14px 0 0',
                        }}
                      >
                        <img
                          src={review.image_url}
                          alt={`Review by ${review.reviewer_name}`}
                          style={{
                            width: '100%',
                            maxHeight: '260px',
                            objectFit: 'cover',
                            objectPosition: 'top',
                            display: 'block',
                            transition: 'transform 400ms ease',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = 'scale(1.03)')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = 'scale(1)')
                          }
                        />
                      </div>
                    )}

                    <div
                      style={{
                        padding: '1.25rem 1.5rem 1.5rem',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg
                            key={s}
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill={
                              s <= review.rating
                                ? 'var(--gold-400)'
                                : 'var(--ash-700)'
                            }
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--ash-300)',
                          lineHeight: 1.7,
                          flex: 1,
                        }}
                      >
                        {review.text}
                      </p>
                      <p
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'var(--gold-400)',
                          marginTop: '0.5rem',
                        }}
                      >
                        — {review.reviewer_name}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}

          <div
            style={{
              maxWidth: '560px',
              margin: '4rem auto 0',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '2rem',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'var(--heading)',
                marginBottom: '0.5rem',
              }}
            >
              Share Your Experience
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--ash-400)',
                marginBottom: '1.5rem',
              }}
            >
              Bought a device or repaired your laptop with us? Leave a review
              below.
            </p>

            {status === 'success' ? (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '10px',
                  background: 'rgba(34, 211, 238, 0.1)',
                  border: '1px solid var(--cyan-glow)',
                  color: 'var(--cyan-400)',
                }}
              >
                Thank you for your feedback! Your review has been submitted for
                approval.
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                />

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
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
                    value={form.author_name}
                    onChange={(e) =>
                      setForm({ ...form, author_name: e.target.value })
                    }
                    placeholder="e.g. Tunde Bakare"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
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
                      fontWeight: 600,
                      color: 'var(--ash-300)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Rating *
                  </label>
                  <select
                    value={form.rating}
                    onChange={(e) =>
                      setForm({ ...form, rating: Number(e.target.value) })
                    }
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
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
                      fontWeight: 600,
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
                    value={form.comment}
                    onChange={(e) =>
                      setForm({ ...form, comment: e.target.value })
                    }
                    placeholder="Tell others about your experience..."
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: '8px',
                      background: 'var(--ash-900)',
                      border: '1px solid var(--border)',
                      color: 'var(--heading)',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {status === 'error' && errorMsg && (
                  <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    padding: '0.8rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--gold-400)',
                    color: 'var(--on-gold)',
                    fontWeight: 700,
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  }}
                >
                  {status === 'loading' ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
