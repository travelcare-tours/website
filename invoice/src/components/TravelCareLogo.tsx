import React, { useState } from 'react';

interface TravelCareLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showText?: boolean;
  watermark?: boolean;
  customLogoUrl?: string;
  variant?: 'header' | 'watermark' | 'icon' | 'white' | 'default';
}

// Helper to resolve public assets correctly in all environments (preview, GitHub pages, standalone)
const resolveAsset = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (typeof window !== 'undefined') {
    // If running under /invoice path on current host
    if (window.location.pathname.startsWith('/invoice')) {
      return `/invoice/${cleanPath}`;
    }
  }
  return `/${cleanPath}`;
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
  const [iconAttempt, setIconAttempt] = useState(0);
  const [whiteAttempt, setWhiteAttempt] = useState(0);

  // Standard clean assets located in public/ and invoice/public/
  const whiteCandidates = [
    resolveAsset('assets/TC_logo_footer.png'),
    '/assets/TC_logo_footer.png',
    '/invoice/assets/TC_logo_footer.png',
    resolveAsset('TC_logo_footer.png'),
    '/TC_logo_footer.png',
    '/invoice/TC_logo_footer.png'
  ];

  const logoCandidates = [
    resolveAsset('TC logo for word.png'),
    '/TC logo for word.png',
    '/invoice/TC logo for word.png',
    resolveAsset('assets/TC_logo_horizontal.png'),
    '/assets/TC_logo_horizontal.png',
    resolveAsset('TC_logo.png'),
    '/TC_logo.png'
  ];

  const watermarkCandidates = [
    resolveAsset('assets/TC_logo.png'),
    '/assets/TC_logo.png',
    '/invoice/assets/TC_logo.png',
    resolveAsset('TC_logo.png'),
    '/TC_logo.png',
    '/invoice/TC_logo.png',
    resolveAsset('TC logo for word.png'),
    '/TC logo for word.png'
  ];

  const iconCandidates = [
    resolveAsset('TC Logo.png'),
    '/TC Logo.png',
    '/invoice/TC Logo.png',
    resolveAsset('assets/TC_logo.png'),
    '/assets/TC_logo.png',
    resolveAsset('TC_favicon.svg'),
    resolveAsset('favicon.svg')
  ];

  const activeLogoUrl = customLogoUrl && logoAttempt === 0 
    ? resolveAsset(customLogoUrl) 
    : logoCandidates[logoAttempt] || logoCandidates[0];

  const activeWatermarkUrl = customLogoUrl && watermarkAttempt === 0
    ? resolveAsset(customLogoUrl)
    : watermarkCandidates[watermarkAttempt] || watermarkCandidates[0];

  const activeIconUrl = customLogoUrl && iconAttempt === 0 
    ? resolveAsset(customLogoUrl) 
    : iconCandidates[iconAttempt] || iconCandidates[0];

  const activeWhiteUrl = customLogoUrl && whiteAttempt === 0
    ? resolveAsset(customLogoUrl)
    : whiteCandidates[whiteAttempt] || whiteCandidates[0];

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

  const handleIconError = () => {
    if (iconAttempt < iconCandidates.length - 1) {
      setIconAttempt((prev) => prev + 1);
    }
  };

  const handleWhiteError = () => {
    if (whiteAttempt < whiteCandidates.length - 1) {
      setWhiteAttempt((prev) => prev + 1);
    }
  };

  // 1. Plain White Logo (matching footer and dark hero branding)
  if (variant === 'white') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src={activeWhiteUrl}
          alt="Travel Care Tours"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={handleWhiteError}
          className="h-full w-auto max-w-full object-contain"
        />
      </div>
    );
  }

  // 2. Watermark rendering across invoice background
  if (watermark || variant === 'watermark') {
    return (
      <div className={`pointer-events-none select-none flex items-center justify-center w-full h-full ${className}`}>
        <img
          src={activeWatermarkUrl}
          alt="Watermark"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={handleWatermarkError}
          className="max-w-[480px] max-h-[480px] w-full h-auto object-contain opacity-[0.07] select-none pointer-events-none"
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
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={handleLogoError}
          className="h-full w-auto max-w-full object-contain drop-shadow-2xs"
        />
      </div>
    );
  }

  // 3. Compact Icon only (for header nav, lockscreen, badges)
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img
        src={activeIconUrl}
        alt="Travel Care"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={handleIconError}
        className="h-full w-full object-contain"
      />
    </div>
  );
};
