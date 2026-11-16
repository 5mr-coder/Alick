import Link from 'next/link';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Button from '@/components/ui/Button';
import { notFound } from 'next/navigation';
import { posts } from '@/types';

export const revalidate = 60;

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slug === params.slug && p.is_published);

  if (!post) {
    notFound();
  }

  return (
    <>

      <section style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
        <img
          src={post.cover_image || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&q=80'}
          alt={post.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,15,17,1) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '3rem' }}>
          <AnimatedSection>
            <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--gold-400)', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none', marginBottom: '1rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>
            <span className="badge badge-gold" style={{ marginBottom: '0.875rem' }}>{post.category}</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'white', lineHeight: 1.2, maxWidth: '760px' }}>
              {post.title}
            </h1>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', color: 'var(--ash-400)', fontSize: '0.8125rem' }}>
              <span>By {post.author}</span>
              <span>
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                style={{ color: 'var(--ash-300)', lineHeight: 1.85, fontSize: '1.0625rem' }}
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />
            </AnimatedSection>


            <AnimatedSection style={{ marginTop: '3rem', padding: '2rem', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border-gold)', textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'white', marginBottom: '0.75rem' }}>
                Need help from our team?
              </h3>
              <p style={{ color: 'var(--ash-400)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Visit Alick System Services at Ikeja, Lagos or reach us on WhatsApp.
              </p>
              <Button href="https://wa.me/2348030841357" size="md">Chat on WhatsApp</Button>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}

export async function generateStaticParams() {
  return posts.filter((p) => p.is_published).map((p) => ({ slug: p.slug }));
}
