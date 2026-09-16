import React, { useEffect } from 'react';
import { Compass, Home, ArrowLeft, Phone, MapPin, Calendar } from 'lucide-react';
import { COMPANY_DETAILS, DESTINATIONS } from '../data/travelData';
import { WhatsAppIcon } from './WhatsAppIcon';

interface NotFoundProps {
  onNavigateHome: (sectionId?: string) => void;
  onSelectDestination?: (destName: string) => void;
}

export const NotFound: React.FC<NotFoundProps> = ({
  onNavigateHome,
  onSelectDestination,
}) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "404 - Page Not Found | Travel Care Tours Kerala";
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => {
      document.title = prevTitle;
    };
  }, []);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      onNavigateHome();
    }
  };

  const topDestinations = DESTINATIONS.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-brand-green/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-teal-600/10 blur-3xl pointer-events-none" />

      {/* Top Simple Nav */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigateHome()}
            className="flex items-center gap-3 text-left group focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400/40 transition-colors">
              <Compass className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-white block">
                Travel Care Tours
              </span>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                Kerala Holiday Specialists
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigateHome()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <span>Home</span>
          </button>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 flex flex-col justify-center items-center text-center">
        {/* Animated Compass Badge */}
        <div className="relative mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center justify-center text-emerald-400 shadow-2xl shadow-emerald-900/30">
            <Compass className="w-10 h-10 sm:w-12 sm:h-12 animate-[spin_20s_linear_infinite]" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow-md">
            Lost Route
          </span>
        </div>

        {/* Big 404 Headline */}
        <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500">
          404
        </h1>

        <h2 className="mt-3 text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
          Lost in the Western Ghats?
        </h2>

        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed">
          The page or link you're looking for seems to have taken a detour through the Kerala backwaters. Don’t worry, your journey is just a click away!
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full max-w-md">
          <button
            onClick={() => onNavigateHome()}
            className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-green hover:bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>

          <button
            onClick={() => onNavigateHome('trip-planner')}
            className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Plan a Kerala Trip</span>
          </button>
        </div>

        {/* Secondary Actions: Go Back & WhatsApp Support */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-white transition-colors hover:bg-white/5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back Previous Page</span>
          </button>
          <span>•</span>
          <a
            href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=Hi%20Travel%20Care%20Tours,%20I%20hit%20a%20404%20link%20and%20need%20assistance.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#25D366] hover:text-white hover:bg-[#25D366]/20 transition-colors font-medium"
          >
            <WhatsAppIcon variant="green" className="w-3.5 h-3.5 fill-current" />
            <span>Ask Support on WhatsApp</span>
          </a>
        </div>

        {/* Popular Kerala Destinations to Explore */}
        <div className="mt-12 w-full pt-10 border-t border-slate-800/80">
          <div className="flex items-center justify-center gap-2 mb-5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Or Explore Popular Kerala Destinations
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            {topDestinations.map((dest) => (
              <button
                key={dest.name}
                onClick={() => {
                  if (onSelectDestination) {
                    onSelectDestination(dest.name);
                  } else {
                    onNavigateHome('trip-planner');
                  }
                }}
                className="group p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-emerald-500/40 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {dest.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {dest.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {dest.tagline}
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Contact Bar */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-800/80 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span>Need immediate assistance?</span>
          <a
            href={`tel:${COMPANY_DETAILS.phone.replace(/\s+/g, '')}`}
            className="text-white hover:text-emerald-400 font-bold flex items-center gap-1 transition-colors"
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>{COMPANY_DETAILS.phone}</span>
          </a>
        </div>

        <p className="text-[11px] text-slate-500">
          Travel Care Tours Pvt Ltd • Daily 8:00 AM – 8:00 PM Support
        </p>
      </footer>
    </div>
  );
};
