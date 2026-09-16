import React, { useState } from 'react';

interface TravelCareLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showText?: boolean;
  watermark?: boolean;
  customLogoUrl?: string;
  variant?: 'header' | 'watermark' | 'icon' | 'default';
}

// Helper to resolve public assets correctly in all environments (preview, GitHub pages, standalone)
const resolveAsset = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If we are on GitHub pages under /invoice/, prepend base, otherwise root
  const base = (typeof window !== 'undefined' && window.location.pathname.includes('/invoice')) 
    ? './' 
    : '/';
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
  const [logoAttempt, setLogoAttempt] = useState(0);
  const [watermarkAttempt, setWatermarkAttempt] = useState(0);

  // Logo candidate cascade:
  // User requested single logo: "invoice/Logo/TC logo for word.png"
  const logoCandidates = [
    resolveAsset('invoice/Logo/TC logo for word.png'),
    resolveAsset('Logo/TC logo for word.png'),
    resolveAsset('TC logo for word.png'),
    '/invoice/Logo/TC logo for word.png',
    '/Logo/TC logo for word.png',
    '/TC logo for word.png',
    resolveAsset('TC_logo_horizontal.png'),
    resolveAsset('header-logo.png'),
    resolveAsset('TC_logo.png')
  ];

  const watermarkCandidates = [
    resolveAsset('invoice/Logo/TC logo for word.png'),
    resolveAsset('Logo/TC logo for word.png'),
    resolveAsset('TC logo for word.png'),
    resolveAsset('watermark.svg'),
    resolveAsset('tc-logo.svg'),
    resolveAsset('TC_logo.png')
  ];

  const iconCandidates = [
    resolveAsset('invoice/Logo/TC Logo.png'),
    resolveAsset('Logo/TC Logo.png'),
    resolveAsset('TC Logo.png'),
    '/invoice/Logo/TC Logo.png',
    '/Logo/TC Logo.png',
    '/TC Logo.png',
    resolveAsset('invoice/public/favicon.svg'),
    resolveAsset('favicon.svg'),
    resolveAsset('tc-logo.svg'),
    resolveAsset('TC_logo.png')
  ];

  const activeLogoUrl = customLogoUrl && logoAttempt === 0 
    ? resolveAsset(customLogoUrl) 
    : logoCandidates[logoAttempt] || logoCandidates[0];

  const activeWatermarkUrl = watermarkCandidates[watermarkAttempt] || watermarkCandidates[0];

  const handleLogoError = () => {
    if (logoAttempt < logoCandidates.length - 1) {
      setLogoAttempt((prev) => prev + 1);
    }
  };

  const handleWatermarkError = () => {
    if (watermarkAttempt < watermarkCandidates.length - 1) {
      setWatermarkAttempt((prev) => prev + 1);
    }
  };

  // 1. Watermark rendering across invoice background
  if (watermark || variant === 'watermark') {
    return (
      <div className={`pointer-events-none select-none flex items-center justify-center w-full h-full ${className}`}>
        <img
          src={activeWatermarkUrl}
          alt="Watermark"
          referrerPolicy="no-referrer"
          onError={handleWatermarkError}
          className="max-w-[480px] max-h-[480px] w-full h-auto object-contain opacity-[0.06] select-none pointer-events-none"
        />
      </div>
    );
  }

  // 2. Header / Standard Banner Logo (The single unified brand logo)
  if (variant === 'header' || showText) {
    const sizeClasses = {
      xs: 'h-8',
      sm: 'h-10 sm:h-11',
      md: 'h-12 sm:h-14',
      lg: 'h-14 sm:h-16',
      xl: 'h-20 sm:h-24',
      custom: className
    };

    return (
      <div className={`inline-flex items-center ${sizeClasses[size] || 'h-12'} ${className}`}>
        <img
          src={activeLogoUrl}
          alt="Travel Care Tours Pvt Ltd"
          referrerPolicy="no-referrer"
          onError={handleLogoError}
          className="h-full w-auto max-w-full object-contain drop-shadow-2xs"
        />
      </div>
    );
  }

  // 3. Compact Icon only (for header nav, lockscreen, badges)
  const activeIconUrl = customLogoUrl && logoAttempt === 0 
    ? resolveAsset(customLogoUrl) 
    : iconCandidates[logoAttempt] || iconCandidates[0];

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img
        src={activeIconUrl}
        alt="Travel Care"
        referrerPolicy="no-referrer"
        onError={handleLogoError}
        className="h-full w-full object-contain"
      />
    </div>
  );
};
