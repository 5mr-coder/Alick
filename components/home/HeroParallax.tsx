'use client';

import { useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';

const heroImages = [
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
  'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
  'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800&q=80',
];

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default function HeroParallax() {
  const bgRef   = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (bgRef.current) {
        bgRef.current.style.transform = `translateY(${scrollY * 0.45}px)`;
      }
      if (textRef.current) {
        textRef.current.style.transform = `translateY(${scrollY * 0.18}px)`;
        textRef.current.style.opacity   = String(Math.max(0, 1 - scrollY / 600));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: '680px',
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
          transform: 'rotate(-6deg) scale(1.25)',
          willChange: 'transform',
        }}
      >
        {heroImages.map((src, i) => (
          <div
            key={i}
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <img
              src={src}
              alt=""
              aria-hidden="true"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
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
          height: '30%',
          background: 'linear-gradient(to top, var(--ash-950), transparent)',
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
          background: 'radial-gradient(circle, rgba(245,200,66,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />


      <div
        className="container"
        style={{ position: 'relative', zIndex: 10 }}
      >
        <div ref={textRef} style={{ maxWidth: '640px', willChange: 'transform, opacity' }}>
          <div
            className="section-label"
            style={{
              animation: 'fadeUp 0.6s ease 0.1s both',
            }}
          >
            Smart Tech. Sharp Deals.
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.75rem, 6vw, 5rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              color: 'white',
              marginBottom: '1.5rem',
              animation: 'fadeUp 0.7s ease 0.25s both',
            }}
          >
            Lagos&apos; Premier{' '}
            <span className="text-gradient">Tech Store.</span>
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
            Laptops, desktops, smart gadgets, and expert repairs — all under one roof at Ikeja, Lagos.
            Quality guaranteed, prices you&apos;ll love.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              animation: 'fadeUp 0.7s ease 0.55s both',
            }}
          >
            <Button size="lg" href="/products" icon={<ArrowRight />}>
              Shop Laptops
            </Button>
            <Button size="lg" variant="outline" href="/services">
              Our Services
            </Button>
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
            {[
              { value: '500+', label: 'Products Sold' },
              { value: '4.9★', label: 'Customer Rating' },
              { value: '24hr', label: 'Repair Turnaround' },
            ].map((stat) => (
              <div key={stat.label}>
                <div
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
                <div style={{ fontSize: '0.75rem', color: 'var(--ash-400)', marginTop: '0.25rem' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 1s ease 1.2s both',
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--ash-500)', textTransform: 'uppercase' }}>
          Scroll
        </span>
        <div
          style={{
            width: '24px',
            height: '38px',
            borderRadius: '12px',
            border: '1.5px solid var(--ash-600)',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '6px',
          }}
        >
          <div
            style={{
              width: '4px',
              height: '8px',
              borderRadius: '2px',
              background: 'var(--gold-400)',
              animation: 'scrollDot 1.8s ease infinite',
            }}
          />
        </div>
        <style>{`
          @keyframes scrollDot {
            0%   { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(14px); }
          }
        `}</style>
      </div>
    </section>
  );
}
