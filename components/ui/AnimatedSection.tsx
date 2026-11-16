'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  threshold?: number;
  style?: React.CSSProperties;
}

export default function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.15,
  style,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const getInitialTransform = () => {
    switch (direction) {
      case 'up':    return 'translateY(48px)';
      case 'down':  return 'translateY(-48px)';
      case 'left':  return 'translateX(48px)';
      case 'right': return 'translateX(-48px)';
      case 'fade':  return 'none';
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    };

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsObserver = typeof IntersectionObserver !== 'undefined';

    // Content must never stay hidden: if we cannot animate, or the element is
    // already on screen, show it immediately.
    const rect = el.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight && rect.bottom > 0;

    if (reduceMotion || !supportsObserver || alreadyInView) {
      reveal();
      return;
    }

    el.style.opacity = '0';
    el.style.transform = getInitialTransform();
    el.style.transition = `opacity 0.75s ease ${delay}ms, transform 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms`;

    let revealed = false;
    const finish = () => {
      if (revealed) return;
      revealed = true;
      reveal();
      observer.disconnect();
      window.clearTimeout(failsafe);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) finish();
      },
      { threshold, rootMargin: '0px 0px -5% 0px' }
    );

    // Safety net: never leave a block hidden if the observer never reports.
    const failsafe = window.setTimeout(finish, 2000);

    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [delay, direction, threshold]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
