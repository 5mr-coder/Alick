'use client';

import { useState } from 'react';
import AnimatedSection from '@/components/ui/AnimatedSection';

type Review = {
  id: string;
  image_url: string;
  reviewer_name: string;
  text: string;
  created_at: string;
};

const reviews: Review[] = [
  {
    id: 'review-1',
    image_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&q=80',
    reviewer_name: 'Chioma Okonkwo',
    text: 'I bought a laptop from Alick System Services and it arrived in perfect condition. The team was very helpful and patient with all my questions.',
    created_at: '2026-01-12T00:00:00.000Z',
  },
  {
    id: 'review-2',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    reviewer_name: 'Emeka Nwosu',
    text: 'My laptop battery was dying fast. They replaced it quickly, at a fair price, and now my machine lasts all day again. Highly recommend.',
    created_at: '2026-01-18T00:00:00.000Z',
  },
  {
    id: 'review-3',
    image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
    reviewer_name: 'Yetunde Adesanya',
    text: 'I came in with a cracked screen and left with a laptop that looks and feels brand new. Online reviews don\'t lie — they really do great work.',
    created_at: '2026-01-25T00:00:00.000Z',
  },
];

export default function ReviewsPage() {
  const [selectedReviews, setSelectedReviews] = useState<Review[]>(reviews);

  return (
    <>

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


      <section className="section">
        <div className="container">
          {selectedReviews.length === 0 ? (
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
              {selectedReviews.map((review, i) => (
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


                    <div style={{ padding: '1.25rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

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
