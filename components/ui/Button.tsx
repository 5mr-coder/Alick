"use client";

import React from 'react';
import Link from 'next/link';
import { OriginButton } from './origin-button';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  href,
  icon,
  iconPosition = 'right',
  loading = false,
  children,
  className = '',
  ...props
}) => {
  // Map variants to complementary colors
  const variantClasses = {
    primary: "bg-[#d4a017] text-black border-transparent hover:bg-[#f5c842] [--ic-background:#d4a017] [--ic-foreground:#000]",
    secondary: "bg-[#26292f] text-white border-[rgba(255,255,255,0.1)] hover:bg-[#363a42] [--ic-background:#26292f] [--ic-foreground:#fff]",
    outline: "bg-transparent text-white border-[#D4A017] border hover:bg-[rgba(212,160,23,0.15)] [--ic-background:transparent] [--ic-foreground:#fff]",
    ghost: "bg-transparent text-[#D4A017] border-transparent hover:text-white hover:bg-[rgba(212,160,23,0.1)] [--ic-background:transparent] [--ic-foreground:#D4A017]"
  };

  const sizeClasses = {
    sm: "h-9 px-4 text-xs",
    md: "h-12 px-6 text-sm",
    lg: "h-14 px-8 text-base",
  };

  const content = (
    <>
      {icon && iconPosition === 'left' && !loading && <span className="mr-2">{icon}</span>}
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading…
        </span>
      ) : (
        children
      )}
      {icon && iconPosition === 'right' && !loading && <span className="ml-2">{icon}</span>}
    </>
  );

  const buttonElement = (
    <OriginButton
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      loading={loading}
      {...(props as any)}
    >
      {content}
    </OriginButton>
  );

  if (href) {
    // If it's an external link
    if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) {
      return (
        <a href={href} className="inline-block" style={{ textDecoration: 'none' }}>
          {buttonElement}
        </a>
      );
    }
    
    // Internal link
    return (
      <Link href={href} className="inline-block" style={{ textDecoration: 'none' }}>
        {buttonElement}
      </Link>
    );
  }

  return buttonElement;
};

export default Button;
