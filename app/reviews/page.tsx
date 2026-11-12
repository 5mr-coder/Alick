'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AnimatedSection from '@/components/ui/AnimatedSection';

type Review = {
  id: string;
  image_url: string;
  reviewer_name: string;
  text: string;
  created_at: string;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      setReviews(data || []);
      setLoading(false);
    }
    fetchReviews();
  }, []);

  return (
    <>
      {/* Hero */}
      <section
        style={{
          padding: '5rem 0 3.5rem',
          background: 'linear-gradient(180deg, var(--ash-900) 0%, var(--ash-950) 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container">
          <AnimatedSection style={{ maxWidth: '600px' }}>
            <div className="section-label">
                                        <span style={{ background: 'var(--gold-400)', width: '2rem', height: '1px', display: 'inline-block' }} />
              Happy Customers
            </div>
            <h1 className="section-heading">Customer Reviews</h1>
            <p style={{ color: 'var(--ash-400)', marginTop: '0.75rem', fontSize: '0.9375rem', lineHeight: 1.7 }}>
              Real feedback from real customers. See what people are saying about Alick System Services.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ash-500)' }}>
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ash-500)' }}>
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
                    {/* Review Image */}
                    <div style={{ overflow: 'hidden', borderRadius: '14px 14px 0 0' }}>
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
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                    </div>

                    {/* Review Text */}
                    <div style={{ padding: '1.25rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {/* Stars */}
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="var(--gold-400)">
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
        </div>
      </section>
    </>
  );
}
