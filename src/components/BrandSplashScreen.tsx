import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, X, Sparkles } from 'lucide-react';

interface BrandSplashScreenProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc?: string;
}

export const BrandSplashScreen: React.FC<BrandSplashScreenProps> = ({
  isOpen,
  onClose,
  videoSrc,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const baseUrl = (import.meta.env.BASE_URL || './').replace(/\/$/, '');
  const [activeVideoSrc, setActiveVideoSrc] = useState(videoSrc || `${baseUrl}/brand-animation.mp4`);
  const logoSrc = `${baseUrl}/TC_Logo.png`;

  const DURATION_SECONDS = 9.5;

  const handleDismiss = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  const handleVideoError = () => {
    // If brand-animation.mp4 failed, attempt fallback to brand-animation.mp4.mp4
    const doubleExtSrc = `${baseUrl}/brand-animation.mp4.mp4`;
    if (activeVideoSrc !== doubleExtSrc) {
      setActiveVideoSrc(doubleExtSrc);
    } else {
      setVideoFailed(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(pct);
    }
  };

  // Keyboard accessibility (Esc to close)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Progress animation and auto-dismiss fallback
  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsFadingOut(false);
      return;
    }

    const interval = 50; // every 50ms
    const step = (interval / (DURATION_SECONDS * 1000)) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          handleDismiss();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Attempt to autoplay video when modal opens
  useEffect(() => {
    if (isOpen && videoRef.current && !videoFailed) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Browser autoplay restrictions handled gracefully with muted state
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => setVideoFailed(true));
        }
      });
    }
  }, [isOpen, videoFailed]);

  if (!isOpen) return null;

  return (
    <div
      id="brand-splash-screen"
      role="dialog"
      aria-modal="true"
      aria-label="Travel Care Brand Introduction"
      className={`fixed inset-0 z-[9999] bg-black text-white flex flex-col justify-between transition-opacity duration-500 ease-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Controls Bar */}
      <header className="relative z-20 flex items-center justify-between p-4 sm:p-6 md:p-8">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold tracking-wider uppercase text-emerald-400 font-sans">
              Travel Care
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 tracking-tight">
              Kerala Holidays &amp; Private Fleet
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Audio Toggle */}
          <button
            id="splash-audio-toggle"
            type="button"
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (videoRef.current) {
                videoRef.current.muted = nextMuted;
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 transition-all text-xs font-medium cursor-pointer backdrop-blur-md"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Unmute</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Sound On</span>
              </>
            )}
          </button>

          {/* Instant Skip Button */}
          <button
            id="splash-skip-btn"
            type="button"
            onClick={handleDismiss}
            className="flex items-center space-x-1 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/30 hover:scale-105 cursor-pointer"
          >
            <span>Skip Intro</span>
            <X className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </header>

      {/* Main Video Presentation Stage */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 max-w-5xl mx-auto w-full">
        <div className="relative w-full aspect-video max-h-[72vh] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800/80 bg-black shadow-2xl shadow-emerald-950/30 flex items-center justify-center">
          {!videoFailed ? (
            <video
              ref={videoRef}
              src={activeVideoSrc}
              playsInline
              autoPlay
              muted={isMuted}
              onEnded={handleDismiss}
              onTimeUpdate={handleTimeUpdate}
              onError={handleVideoError}
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            /* Graceful Fallback Animation if video file is not yet placed in public/ */
            <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-slate-950 via-black to-slate-950">
              {/* Glowing Ambient Halo */}
              <div className="absolute w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl animate-pulse pointer-events-none" />
              <div className="absolute w-60 h-60 rounded-full bg-blue-500/15 blur-3xl -translate-y-6 pointer-events-none" />

              <div className="relative z-10 space-y-5 flex flex-col items-center">
                <div className="relative">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-900/90 border border-emerald-500/30 flex items-center justify-center p-3 shadow-2xl shadow-emerald-500/20">
                    <img
                      src={logoSrc}
                      alt="Travel Care Tours Emblem"
                      className="w-full h-full object-contain drop-shadow-md animate-pulse"
                      onError={(e) => {
                        // Fallback text icon
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
                    Welcome to Travel Care
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                    Authentic Kerala Holiday Packages &amp; Personalized Chauffeur Fleet
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Progress Bar & Skip Hint */}
      <footer className="relative z-20 p-4 sm:p-6 md:p-8 flex flex-col items-center space-y-2">
        <div className="w-full max-w-md bg-slate-800/80 rounded-full h-1 overflow-hidden border border-slate-700/50">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 h-full transition-all duration-75 ease-linear rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 tracking-wide font-sans">
          Press <span className="text-slate-300 font-mono">Esc</span> or tap Skip to enter site
        </p>
      </footer>
    </div>
  );
};
