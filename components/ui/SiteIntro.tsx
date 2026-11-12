'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SiteIntro() {
  const [show, setShow] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = '';
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  if (!isClient) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: '#0e0f11',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <motion.div
            initial={{ x: '-100vw' }}
            animate={{ x: 0 }}
            exit={{ x: '100vw' }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 100,
              mass: 1
            }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
              fontWeight: 700,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              whiteSpace: 'nowrap',
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
