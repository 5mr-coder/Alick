'use client';

import AnimatedSection from '@/components/ui/AnimatedSection';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import type { BlogPost } from '@/types';

export default function BlogPreview({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      className="section"
      style={{
        background:
          'linear-gradient(180deg, var(--ash-950) 0%, var(--ash-900) 100%)',
      }}
    >
      <div className="container">
        <AnimatedSection
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '3rem',
          }}
        >
          <div>
            <div className="section-label">Stay informed</div>
            <h2 className="section-heading">Latest Tech News</h2>
          </div>
          <Button
            variant="ghost"
            href="/blog"
            size="sm"
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            }
          >
            All Articles
          </Button>
        </AnimatedSection>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {posts.map((post, i) => (
            <AnimatedSection key={post.id} delay={i * 90}>
              <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <article
                  className="card"
                  style={{
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      aspectRatio: '16/9',
                      overflow: 'hidden',
                      background: 'var(--ash-800)',
                    }}
                  >
                    <img
                      src={
                        post.cover_image ||
                        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=700&q=80'
                      }
                      alt={post.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 400ms ease',
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.transform =
                          'scale(1.05)')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.transform =
                          'scale(1)')
                      }
                    />
                  </div>
                  <div
                    style={{
                      padding: '1.25rem',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <span className="badge badge-gold">
                        {post.category || 'Article'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ash-500)' }}>
                        {new Date(
                          post.published_at || post.created_at
                        ).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--heading)',
                        lineHeight: 1.4,
                        marginBottom: '0.625rem',
                      }}
                    >
                      {post.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--ash-400)',
                        lineHeight: 1.65,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {post.excerpt}
                    </p>
                    <div
                      style={{
                        marginTop: 'auto',
                        paddingTop: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        color: 'var(--gold-400)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                      }}
                    >
                      Read more
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </article>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
