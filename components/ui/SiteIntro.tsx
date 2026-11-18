'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function SiteIntro() {
  const pathname = usePathname();
  const [show, setShow] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // The intro only plays on the home page
    if (pathname !== '/') {
      return;
    }
    document.body.style.overflow = 'hidden';

    const leaveTimer = setTimeout(() => setLeaving(true), 2600);
    const hideTimer = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = '';
    }, 3200);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(hideTimer);
      document.body.style.overflow = '';
    };
  }, [pathname]);

  if (!show || pathname !== '/') return null;

  return (
    <div
      className="force-dark"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#0e0f11',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        opacity: leaving ? 0 : 1,
        pointerEvents: 'none',
        transition: 'opacity 600ms ease',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
          fontWeight: 700,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          whiteSpace: 'nowrap',
          animation: 'introSlide 700ms cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <img
            src="/logo.png"
            alt="Alick System Services"
            style={{ width: '36px', height: '36px', objectFit: 'contain' }}
          />
        </div>
        <span style={{ letterSpacing: '-0.02em' }}>Alick System Services</span>
      </div>

      <style>{`
        @keyframes introSlide {
          from { transform: translateX(-100vw); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
