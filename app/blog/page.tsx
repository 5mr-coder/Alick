'use client';

import { useState } from 'react';
import Link from 'next/link';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { posts } from '@/types';

const ALL_CATEGORIES = ['All', 'Buying Guide', 'Tech Tips', 'News', 'Announcements'];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = posts
    .filter((post) => post.is_published && (activeCategory === 'All' || post.category === activeCategory))
    .sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());


  return (
    <>

      <section style={{ padding: '5rem 0 3rem', background: 'var(--ash-900)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <AnimatedSection style={{ maxWidth: '600px' }}>
            <div className="section-label">Stay informed</div>
            <h1 className="section-heading">Tech News & Insights</h1>
            <p style={{ color: 'var(--ash-400)', marginTop: '0.75rem', fontSize: '0.9375rem', lineHeight: 1.7 }}>
              Buying guides, repair tips, product news, and everything tech — written by the Alick System Services team.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">

          <>

          <AnimatedSection style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600,
                  border: '1px solid', cursor: 'pointer', transition: 'all 200ms ease',
                  background: activeCategory === cat ? 'rgba(212,160,23,0.12)' : 'transparent',
                  color: activeCategory === cat ? 'var(--gold-400)' : 'var(--ash-400)',
                  borderColor: activeCategory === cat ? 'rgba(212,160,23,0.4)' : 'var(--border)',
                }}
              >
                {cat}
              </button>
            ))}
          </AnimatedSection>


          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((post, i) => (
              <AnimatedSection key={post.id} delay={i * 70}>
                <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <article
                    className="card"
                    style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: 'var(--ash-800)' }}>
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 400ms ease' }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.06)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
                      />
                    </div>
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span className="badge badge-gold">{post.category}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--ash-500)' }}>
                          {post.published_at ? new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </span>
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', fontWeight: 700, color: 'white', lineHeight: 1.45, marginBottom: '0.625rem', flex: 1 }}>
                        {post.title}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--ash-400)', lineHeight: 1.65, marginBottom: '1rem',
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.excerpt}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--gold-400)', fontSize: '0.8125rem', fontWeight: 600, marginTop: 'auto' }}>
                        Read more
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </article>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ash-500)' }}>
              No posts in this category yet. Check back soon!
            </div>
          )}
          </>
        </div>
      </section>
    </>
  );
}

