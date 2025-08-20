"use client";

import Image from 'next/image';
import { getLogo } from '@/lib/utils/theme-manager';

interface LogoProps {
  variant?: 'primary' | 'secondary' | 'full' | 'verified' | 'circle';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
  priority?: boolean;
}

const sizeConfig = {
  sm: { width: 32, height: 32 },
  md: { width: 64, height: 32 },
  lg: { width: 120, height: 48 },
  xl: { width: 200, height: 80 },
};

export function Logo({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  alt = 'EHockey League',
  priority = false 
}: LogoProps) {
  const logoUrl = getLogo(variant);
  const dimensions = sizeConfig[size];

  // Auto-select variant based on size if not specified
  const autoVariant = variant === 'primary' ? 
    (size === 'sm' ? 'secondary' : 'primary') : 
    variant;

  const finalLogoUrl = variant === 'primary' ? getLogo(autoVariant) : logoUrl;

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={finalLogoUrl}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        priority={priority}
        className="object-contain"
      />
    </div>
  );
}

// Specialized logo components for common use cases
export function HeaderLogo() {
  return <Logo variant="secondary" size="md" className="h-8" />;
}

export function FooterLogo() {
  return <Logo variant="full" size="lg" className="h-12" />;
}

export function AuthLogo() {
  return <Logo variant="primary" size="xl" className="h-20" priority />;
}

export function CompactLogo() {
  return <Logo variant="secondary" size="sm" className="h-6" />;
}

export function VerifiedBadge() {
  return <Logo variant="verified" size="sm" className="h-4" />;
}

export function CircleLogo() {
  return <Logo variant="circle" size="md" className="h-8" />;
}
