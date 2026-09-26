import React from 'react';
import { 
  FileSpreadsheet, 
  Compass, 
  ExternalLink, 
  ArrowRight, 
  Lock, 
  ShieldCheck, 
  Car, 
  MapPin, 
  Receipt, 
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { TravelCareLogo } from './TravelCareLogo';

interface StaffWorkspaceHubProps {
  onOpenInvoice: () => void;
  onLock: () => void;
  companyName?: string;
  totalTripsCount?: number;
}

export const StaffWorkspaceHub: React.FC<StaffWorkspaceHubProps> = ({
  onOpenInvoice,
  onLock,
  companyName = 'Travel Care Tours Pvt Ltd',
  totalTripsCount = 0,
}) => {
  const ITINERARY_PLANNER_URL = 'https://travelcare-tours.github.io/planner/';

  const handleLaunchPlanner = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.open(ITINERARY_PLANNER_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-[100dvh] max-h-[100dvh] sm:min-h-screen sm:max-h-none bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white overflow-hidden sm:overflow-auto justify-between">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md shrink-0 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-12 sm:h-16 flex items-center justify-between">
          
          {/* Brand Logo & Context */}
          <div className="flex items-center gap-2 sm:gap-3">
            <TravelCareLogo variant="white" className="h-7 sm:h-10 w-auto" />
            <div className="border-l border-slate-700/80 pl-2 sm:pl-3">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-200 tracking-wider uppercase block leading-tight">
                Staff Workspace
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium hidden xs:inline block leading-none">
                {companyName}
              </span>
            </div>
          </div>

          {/* Right Status & Lock Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Authenticated Staff Pill (Desktop) */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Staff Active</span>
            </div>

            {/* Lock / Exit Button */}
            <button
              id="hub-btn-lock"
              onClick={onLock}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold text-slate-300 hover:text-rose-400 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Lock Staff Session and return to PIN screen"
            >
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Compact for Mobile Single-Screen Viewing */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-6 lg:py-10 flex flex-col justify-center">
        
        {/* Workspace Greeting Header */}
        <div className="text-center max-w-2xl mx-auto mb-2.5 sm:mb-6 space-y-1 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-semibold">
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
            <span>Operations Workspace</span>
          </div>

          <h1 className="text-lg sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Choose Your Workspace
          </h1>

          <p className="text-[11px] sm:text-sm text-slate-400 leading-snug max-w-md mx-auto line-clamp-1 sm:line-clamp-none">
            Generate tour invoices and trip sheets, or design custom holiday itineraries.
          </p>
        </div>

        {/* 2-Card Chooser Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-6 lg:gap-8 items-stretch">
          
          {/* CARD 1: INVOICE AND BILLING */}
          <div
            id="card-choose-invoice"
            onClick={onOpenInvoice}
            className="group relative bg-slate-900/90 hover:bg-slate-850/95 border border-slate-800 hover:border-blue-500/50 rounded-xl sm:rounded-2xl p-3.5 sm:p-7 transition-all duration-200 cursor-pointer shadow-xl flex flex-col justify-between hover:shadow-blue-500/10 hover:shadow-2xl active:scale-[0.99]"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenInvoice();
              }
            }}
          >
            {/* Accent Top Border Indicator */}
            <div className="absolute top-0 left-4 right-4 sm:left-6 sm:right-6 h-0.5 sm:h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b opacity-80 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-2.5 sm:space-y-4">
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:bg-blue-500/20 transition-all shadow-inner">
                  <Receipt className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 tracking-wide uppercase">
                  DriveBill Pro
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1 sm:space-y-1.5">
                <h2 className="text-base sm:text-2xl font-bold text-white tracking-tight flex items-center gap-1.5 sm:gap-2 group-hover:text-blue-300 transition-colors">
                  <span>Invoice &amp; Billing</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-400" />
                </h2>
                <p className="text-[11px] sm:text-sm text-slate-400 leading-snug">
                  Driver trip sheets, odometer calculation, GST invoices, customer receipts, and driver bata ledger.
                </p>
              </div>

              {/* Feature Highlights Chips */}
              <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5">
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                  Trip Sheets
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                  GST Invoices
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                  Bata Ledger
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 hidden xs:inline">
                  WhatsApp &amp; PDF
                </span>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-2.5 sm:pt-5 mt-2.5 sm:mt-5 border-t border-slate-800/80 flex items-center justify-between">
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium">
                {totalTripsCount > 0 ? (
                  <span><strong className="text-slate-200">{totalTripsCount}</strong> trips on file</span>
                ) : (
                  <span>Ready for trip entry</span>
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] sm:text-xs transition-all shadow-md shadow-blue-600/25 group-hover:shadow-blue-500/40">
                <span>Open Invoices</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* CARD 2: ITINERARY PLANNER */}
          <div
            id="card-choose-planner"
            onClick={() => handleLaunchPlanner()}
            className="group relative bg-slate-900/90 hover:bg-slate-850/95 border border-slate-800 hover:border-emerald-500/50 rounded-xl sm:rounded-2xl p-3.5 sm:p-7 transition-all duration-200 cursor-pointer shadow-xl flex flex-col justify-between hover:shadow-emerald-500/10 hover:shadow-2xl active:scale-[0.99]"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLaunchPlanner();
              }
            }}
          >
            {/* Accent Top Border Indicator */}
            <div className="absolute top-0 left-4 right-4 sm:left-6 sm:right-6 h-0.5 sm:h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-b opacity-80 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-2.5 sm:space-y-4">
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:bg-emerald-500/20 transition-all shadow-inner">
                  <Compass className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 tracking-wide uppercase">
                  Kerala Tour Builder
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1 sm:space-y-1.5">
                <h2 className="text-base sm:text-2xl font-bold text-white tracking-tight flex items-center gap-1.5 sm:gap-2 group-hover:text-emerald-300 transition-colors">
                  <span>Itinerary Planner</span>
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                </h2>
                <p className="text-[11px] sm:text-sm text-slate-400 leading-snug">
                  Design bespoke Kerala holiday packages, day-by-day sightseeing schedules, cab circuits, and guest quotations.
                </p>
              </div>

              {/* Feature Highlights Chips */}
              <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5">
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                  Day Routing
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                  Kerala Circuits
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                  Hotel &amp; Cab Plans
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 hidden xs:inline">
                  Instant Quotes
                </span>
              </div>
            </div>

            {/* Bottom Action Footer (link text removed as requested) */}
            <div className="pt-2.5 sm:pt-5 mt-2.5 sm:mt-5 border-t border-slate-800/80 flex items-center justify-between">
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium">
                Holiday Tour Builder
              </div>

              <button
                id="link-launch-planner"
                type="button"
                onClick={handleLaunchPlanner}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs transition-all shadow-md shadow-emerald-600/25 hover:shadow-emerald-500/40 cursor-pointer active:scale-95"
              >
                <span>Launch Planner</span>
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Quick Helper Note */}
        <div className="mt-2 sm:mt-4 text-center text-[10px] sm:text-xs text-slate-400">
          Switch between apps anytime via the <span className="text-slate-300 font-semibold">Workspace Hub</span> in the nav bar.
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/70 py-2 sm:py-3 px-3 text-center text-[10px] sm:text-xs text-slate-400 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-row items-center justify-between gap-2">
          <span className="truncate">© {new Date().getFullYear()} {companyName}</span>
          <span className="text-slate-400 whitespace-nowrap">PIN Protected</span>
        </div>
      </footer>
    </div>
  );
};
