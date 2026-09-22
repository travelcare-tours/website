import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Maximize2, Sparkles, Globe, HeartHandshake, Compass } from 'lucide-react';

interface BrandVideoShowcaseProps {
  onOpenFullscreenIntro?: () => void;
  videoSrc?: string;
}

export const BrandVideoShowcase: React.FC<BrandVideoShowcaseProps> = ({
  onOpenFullscreenIntro,
  videoSrc,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const baseUrl = (import.meta.env.BASE_URL || './').replace(/\/$/, '');
  const [activeVideoSrc, setActiveVideoSrc] = useState(videoSrc || `${baseUrl}/brand-animation.mp4`);
  const logoSrc = `${baseUrl}/TC_Logo.png`;

  const handleVideoError = () => {
    const doubleExtSrc = `${baseUrl}/brand-animation.mp4.mp4`;
    if (activeVideoSrc !== doubleExtSrc) {
      setActiveVideoSrc(doubleExtSrc);
    } else {
      setVideoFailed(true);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  return (
    <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-800 shadow-2xl text-white relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left: Video Player Card (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 text-[11px] font-bold uppercase tracking-wider border border-emerald-800/60 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Brand Emblem Story</span>
            </div>

            {onOpenFullscreenIntro && (
              <button
                type="button"
                onClick={onOpenFullscreenIntro}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer font-medium"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Theater Mode</span>
              </button>
            )}
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-xl group">
            {!videoFailed ? (
              <video
                ref={videoRef}
                src={activeVideoSrc}
                playsInline
                autoPlay
                loop
                muted={isMuted}
                onError={handleVideoError}
                className="w-full h-full object-contain bg-black cursor-pointer"
                onClick={togglePlay}
              />
            ) : (
              /* Fallback Card if video has not been dropped in public folder */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-black">
                <div className="w-20 h-20 rounded-2xl bg-slate-800/80 border border-emerald-500/30 flex items-center justify-center p-3 mb-3 shadow-lg shadow-emerald-500/10">
                  <img
                    src={logoSrc}
                    alt="Travel Care Emblem"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h4 className="text-sm font-bold text-white font-display">Travel Care Kerala</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  Place <code className="text-emerald-400 font-mono">brand-animation.mp4</code> in the <code className="text-emerald-400 font-mono">public/</code> directory to display this animation.
                </p>
              </div>
            )}

            {/* Overlay Video Controls Bar */}
            {!videoFailed && (
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between opacity-95 transition-opacity">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-300" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleRestart}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                    title="Replay from start"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                    {isMuted ? 'MUTED' : 'AUDIO ON'}
                  </span>
                  {onOpenFullscreenIntro && (
                    <button
                      type="button"
                      onClick={onOpenFullscreenIntro}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Open Fullscreen"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: What Our Emblem Stands For (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
              The Meaning Behind Our Emblem
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Every curve and element in our brand identity was crafted to reflect the safety, care, and joyful freedom we bring to every traveler.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-white">The Gentle Green Palm</h5>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Care and genuine caretaker responsibility. We protect your peace of mind with vetted drivers and fair pricing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-white">The Globe in Hand</h5>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Welcoming guests from every corner of India and the world to experience Kerala&apos;s wonders in complete comfort.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-white">The Soaring Bird &amp; Travel Ring</h5>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Unrestricted freedom to explore. From mist-covered tea gardens to serene backwaters, travel at your own pace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
