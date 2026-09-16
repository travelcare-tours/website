import React, { useState } from 'react';

interface TravelCareLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showText?: boolean;
  watermark?: boolean;
  customLogoUrl?: string;
  variant?: 'header' | 'watermark' | 'icon' | 'default';
}

// Helper to resolve public assets correctly with Vite's BASE_URL (e.g. /invoice/ or ./)
const resolveAsset = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${cleanPath}`;
};

export const TravelCareLogo: React.FC<TravelCareLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  watermark = false,
  customLogoUrl,
  variant = 'default'
}) => {
  const [imgError, setImgError] = useState(false);
  const [watermarkError, setWatermarkError] = useState(false);

  // Determine active logo source with base URL resolution
  const primaryLogo = resolveAsset(customLogoUrl || 'TC logo for word.png');
  const fallbackLogo = resolveAsset('header-logo.png');
  const activeLogoUrl = imgError ? fallbackLogo : primaryLogo;

  const primaryWatermark = resolveAsset(customLogoUrl || 'TC logo for word.png');
  const fallbackWatermark = resolveAsset('watermark.svg');
  const activeWatermarkUrl = watermarkError ? fallbackWatermark : primaryWatermark;

  // 1. Watermark rendering across invoice background
  if (watermark || variant === 'watermark') {
    return (
      <div className={`pointer-events-none select-none flex items-center justify-center w-full h-full ${className}`}>
        <img
          src={activeWatermarkUrl}
          alt="Watermark"
          referrerPolicy="no-referrer"
          onError={() => setWatermarkError(true)}
          className="max-w-[480px] max-h-[480px] w-full h-auto object-contain opacity-[0.07] select-none pointer-events-none"
        />
      </div>
    );
  }

  // 2. Header / Standard Banner Logo (Company Name + Vehicle + Brand Mark)
  if (variant === 'header' || showText) {
    const sizeClasses = {
      xs: 'h-8 max-w-[160px]',
      sm: 'h-11 max-w-[220px]',
      md: 'h-14 sm:h-16 max-w-[300px]',
      lg: 'h-16 sm:h-20 max-w-[360px]',
      xl: 'h-24 max-w-[440px]',
      custom: className
    };

    return (
      <div className={`inline-flex items-center ${sizeClasses[size] || 'h-14'} ${className}`}>
        <img
          src={activeLogoUrl}
          alt="Travel Care Tours Pvt Ltd"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-auto object-contain max-h-full max-w-full drop-shadow-2xs"
        />
      </div>
    );
  }

  // 3. Compact Icon only (for header nav / badges)
  const iconSrc = customLogoUrl ? resolveAsset(customLogoUrl) : resolveAsset('TC Logo.png');
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img
        src={iconSrc}
        alt="Travel Care"
        referrerPolicy="no-referrer"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = resolveAsset('TC Logo.png');
        }}
        className="h-full w-full object-contain"
      />
    </div>
  );
};
