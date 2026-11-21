import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Button from '@/components/ui/Button';
import SkeletonImage from '@/components/ui/SkeletonImage';
import {
  getPublicSiteSettings,
  getPublishedBlogPostBySlug,
  getPublishedBlogPosts,
} from '@/lib/db/queries';

export const revalidate = 60;
export const dynamicParams = true;

function normalizeSeedHtmlToMarkdown(content: string): string {
  const trimmed = content.trim();
  if (/^<p>[\s\S]*<\/p>$/i.test(trimmed)) {
    return trimmed
      .replace(/<\/p>\s*<p>/gi, '\n\n')
      .replace(/^<p>/i, '')
      .replace(/<\/p>$/i, '')
      .trim();
  }
  return trimmed;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getPublishedBlogPostBySlug(slug),
    getPublicSiteSettings(),
  ]);

  if (!post) {
    notFound();
  }

  const whatsappDigits =
    settings.whatsapp_number.replace(/\D/g, '') || '2348030841357';
  const markdownBody = normalizeSeedHtmlToMarkdown(post.content || '');

  return (
    <>
      <section
        className="force-dark"
        style={{ position: 'relative', height: '420px', overflow: 'hidden' }}
      >
        <SkeletonImage
          src={
            post.cover_image ||
            'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&q=80'
          }
          alt={post.title}
          loading="eager"
          style={{ filter: 'brightness(0.22)' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(8,10,14,0.98) 0%, rgba(8,10,14,0.82) 35%, rgba(8,10,14,0.45) 65%, rgba(8,10,14,0.3) 100%)',
          }}
        />
        <div
          className="container"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            paddingBottom: '3rem',
          }}
        >
          <AnimatedSection>
            <Link
              href="/blog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: 'var(--gold-400)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textDecoration: 'none',
                marginBottom: '1rem',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>
            {post.category && (
              <span className="badge badge-gold" style={{ marginBottom: '0.875rem' }}>
                {post.category}
              </span>
            )}
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                color: '#F8FAFC',
                lineHeight: 1.2,
                maxWidth: '760px',
                textShadow: '0 2px 18px rgba(0,0,0,0.55)',
              }}
            >
              {post.title}
            </h1>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                gap: '1.5rem',
                color: 'var(--ash-400)',
                fontSize: '0.8125rem',
              }}
            >
              <span>By {post.author}</span>
              <span>
                {new Date(
                  post.published_at || post.created_at
                ).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <AnimatedSection>
              <div
                className="space-y-4 leading-relaxed"
                style={{
                  color: 'var(--ash-300)',
                  lineHeight: 1.85,
                  fontSize: '1.0625rem',
                }}
              >
                <ReactMarkdown
                  rehypePlugins={[rehypeSanitize]}
                  components={{
                    h1: ({ children }) => (
                      <h2
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.75rem',
                          fontWeight: 700,
                          color: 'var(--heading)',
                          marginTop: '2rem',
                          marginBottom: '0.75rem',
                        }}
                      >
                        {children}
                      </h2>
                    ),
                    h2: ({ children }) => (
                      <h2
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.45rem',
                          fontWeight: 700,
                          color: 'var(--heading)',
                          marginTop: '1.75rem',
                          marginBottom: '0.75rem',
                        }}
                      >
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          color: 'var(--heading)',
                          marginTop: '1.5rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p style={{ marginBottom: '1rem' }}>{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul
                        style={{
                          paddingLeft: '1.5rem',
                          marginBottom: '1rem',
                          listStyleType: 'disc',
                        }}
                      >
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol
                        style={{
                          paddingLeft: '1.5rem',
                          marginBottom: '1rem',
                          listStyleType: 'decimal',
                        }}
                      >
                        {children}
                      </ol>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: 'var(--gold-400)',
                          textDecoration: 'underline',
                        }}
                      >
                        {children}
                      </a>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote
                        style={{
                          borderLeft: '3px solid var(--gold-400)',
                          paddingLeft: '1rem',
                          color: 'var(--ash-400)',
                          fontStyle: 'italic',
                          margin: '1.25rem 0',
                        }}
                      >
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {markdownBody}
                </ReactMarkdown>
              </div>
            </AnimatedSection>

            <AnimatedSection
              style={{
                marginTop: '3rem',
                padding: '2rem',
                borderRadius: '12px',
                background: 'var(--surface)',
                border: '1px solid var(--border-gold)',
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  color: 'var(--heading)',
                  marginBottom: '0.75rem',
                }}
              >
                Need help from our team?
              </h3>
              <p
                style={{
                  color: 'var(--ash-400)',
                  fontSize: '0.9rem',
                  marginBottom: '1.5rem',
                }}
              >
                Visit Alick System Services at Ikeja, Lagos or reach us on
                WhatsApp.
              </p>
              <Button href={`https://wa.me/${whatsappDigits}`} size="md">
                Chat on WhatsApp
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}
