'use client';

import { useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import SkeletonImage from '@/components/ui/SkeletonImage';
import type { SiteBanner } from '@/types';

const defaultHeroImages = [
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
  'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
  'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800&q=80',
];

const defaultStats = [
  { value: '500+', label: 'Products Sold' },
  { value: '4.9 / 5', label: 'Customer Rating' },
  { value: '24hr', label: 'Repair Turnaround' },
];

const ArrowRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default function HeroParallax({ banner }: { banner?: SiteBanner | null }) {
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const heroImages =
    banner?.media_urls && banner.media_urls.length > 0
      ? banner.media_urls
      : defaultHeroImages;
  const label = banner?.metadata?.label || 'Smart Tech. Sharp Deals.';
  const headline = banner?.headline || "Lagos' Premier Tech Store.";
  const subheadline =
    banner?.subheadline ||
    "Laptops, desktops, smart gadgets, and expert repairs — all under one roof at Ikeja, Lagos. Quality guaranteed, prices you'll love.";
  const ctaText = banner?.cta_text || 'Shop Laptops';
  const ctaLink = banner?.cta_link || '/products';
  const secondaryCta = banner?.metadata?.secondary_cta ?? {
    text: 'Our Services',
    link: '/services',
  };
  const stats =
    banner?.metadata?.stats && banner.metadata.stats.length > 0
      ? banner.metadata.stats
      : defaultStats;

  const words = headline.trim().split(/\s+/);
  const splitIndex = Math.max(1, words.length - 2);
  const headlineStart = words.slice(0, splitIndex).join(' ');
  const headlineAccent = words.slice(splitIndex).join(' ');

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (bgRef.current) {
        bgRef.current.style.transform = `rotate(-6deg) scale(1.22) translateY(${scrollY * 0.28}px)`;
      }
      if (textRef.current) {
        textRef.current.style.transform = `translateY(${scrollY * 0.14}px)`;
        textRef.current.style.opacity = String(Math.max(0, 1 - scrollY / 600));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      className="force-dark"
      style={{
        position: 'relative',
        minHeight: 'min(88dvh, 760px)',
        padding: '4.5rem 0',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        ref={bgRef}
        style={{
          position: 'absolute',
          inset: '-20%',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '6px',
          transform: 'rotate(-6deg) scale(1.22)',
          willChange: 'transform',
        }}
      >
        {heroImages.slice(0, 6).map((src, i) => (
          <div
            key={`${src}-${i}`}
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <SkeletonImage
              src={src}
              alt=""
              ariaHidden
              loading="eager"
              style={{
                filter: 'brightness(0.45) saturate(0.7)',
              }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, rgba(14,15,17,0.96) 0%, rgba(14,15,17,0.7) 50%, rgba(14,15,17,0.4) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '16%',
          background: 'linear-gradient(to top, var(--ash-950), transparent)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(245,200,66,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div
          ref={textRef}
          style={{ maxWidth: '640px', willChange: 'transform, opacity' }}
        >
          <div
            className="section-label"
            style={{
              animation: 'fadeUp 0.6s ease 0.1s both',
            }}
          >
            {label}
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.75rem, 6vw, 4.75rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              color: 'white',
              marginBottom: '1.5rem',
              animation: 'fadeUp 0.7s ease 0.25s both',
            }}
          >
            {headlineStart}{' '}
            {headlineAccent && (
              <span className="text-gradient">{headlineAccent}</span>
            )}
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
              color: 'var(--ash-300)',
              lineHeight: 1.75,
              marginBottom: '2.5rem',
              maxWidth: '480px',
              animation: 'fadeUp 0.7s ease 0.4s both',
            }}
          >
            {subheadline}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              animation: 'fadeUp 0.7s ease 0.55s both',
            }}
          >
            <Button size="lg" href={ctaLink} icon={<ArrowRight />}>
              {ctaText}
            </Button>
            {secondaryCta?.text && (
              <Button
                size="lg"
                variant="outline"
                href={secondaryCta.link || '/services'}
              >
                {secondaryCta.text}
              </Button>
            )}
          </div>

          <div
            style={{
              marginTop: '3rem',
              display: 'flex',
              gap: '2rem',
              flexWrap: 'wrap',
              animation: 'fadeUp 0.7s ease 0.7s both',
            }}
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <div
                  className="tabular-nums"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--gold-400)',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--ash-400)',
                    marginTop: '0.25rem',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
