'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonImageProps {
  src: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  className?: string;
  style?: CSSProperties;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
  ariaHidden?: boolean;
  fallback?: ReactNode;
  as?: 'div' | 'span';
}

export default function SkeletonImage({
  src,
  alt,
  loading = 'lazy',
  decoding = 'async',
  className,
  style,
  wrapperClassName,
  wrapperStyle,
  ariaHidden,
  fallback,
  as = 'div',
}: SkeletonImageProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [errorSrc, setErrorSrc] = useState<string | null>(null);

  const isLoaded = loadedSrc === src;
  const hasError = errorSrc === src;

  const checkCached = useCallback(
    (node: HTMLImageElement | null) => {
      if (node && node.complete && node.naturalWidth > 0) {
        setLoadedSrc(src);
      }
    },
    [src]
  );

  const setRefs = useCallback(
    (node: HTMLImageElement | null) => {
      imgRef.current = node;
      checkCached(node);
    },
    [checkCached]
  );

  useEffect(() => {
    checkCached(imgRef.current);
  }, [checkCached]);

  const WrapperTag = as;
  const InnerTag = as;

  return (
    <WrapperTag
      className={cn(
        'relative block overflow-hidden bg-[var(--ash-800)]',
        wrapperClassName
      )}
      style={{ width: '100%', height: '100%', ...wrapperStyle }}
    >
      {!isLoaded && !hasError && (
        <InnerTag
          aria-hidden="true"
          className="skeleton block absolute inset-0 w-full h-full pointer-events-none"
        />
      )}

      {hasError ? (
        fallback ?? (
          <InnerTag
            aria-hidden="true"
            className="w-full h-full flex items-center justify-center"
            style={{ color: 'var(--ash-500)' }}
          />
        )
      ) : (
        <img
          ref={setRefs}
          src={src}
          alt={alt}
          aria-hidden={ariaHidden}
          loading={loading}
          decoding={decoding}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setErrorSrc(src)}
          className={cn(
            'transition-opacity duration-200 ease-out',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            ...style,
          }}
        />
      )}
    </WrapperTag>
  );
}
