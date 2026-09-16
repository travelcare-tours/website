import { useState } from 'react';
import { ViewMode, TripRecord } from '../types';
import { TravelCareLogo } from './TravelCareLogo';
import { 
  FileText, 
  PlusCircle, 
  History, 
  Settings, 
  TrendingUp,
  Lock,
  Menu,
  X,
  ChevronRight,
  Car,
  Phone,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  selectedTrip: TripRecord | null;
  totalTripsCount: number;
  onExportCsv: () => void;
  onLock?: () => void;
}

export const Navbar = ({
  currentView,
  onViewChange,
  selectedTrip,
  totalTripsCount,
  onLock,
}: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view: ViewMode) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="no-print bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Responsive Header Height */}
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
          
          {/* Logo & Branding - Well-proportioned across Mobile, Tablet, and Desktop */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 lg:gap-3.5 cursor-pointer select-none group py-1" 
            onClick={() => handleNavClick('create')}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-white rounded-xl p-1 flex items-center justify-center shadow-lg shadow-blue-500/10 ring-1 ring-white/20 transition-transform group-hover:scale-105 shrink-0">
              <TravelCareLogo size="xs" showText={false} customLogoUrl="TC Logo.png" className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <h1 className="text-base sm:text-lg lg:text-xl font-extrabold leading-tight tracking-tight text-white whitespace-nowrap">
                  Travel Care
                </h1>
                <span className="text-[9px] sm:text-[10px] lg:text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 sm:px-2 py-0.5 rounded-md tracking-wider uppercase">
                  Tours
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-none mt-1 hidden lg:block">
                Travel Agency Trip Billing & Invoicing
              </p>
            </div>
          </div>

          {/* Desktop & Tablet Navigation Controls */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-3 xl:gap-4">
            {/* Nav Tabs */}
            <nav className="flex items-center space-x-1 lg:space-x-2">
              <button
                id="nav-btn-new-trip"
                onClick={() => handleNavClick('create')}
                className={`flex items-center space-x-1.5 lg:space-x-2 px-2.5 sm:px-3 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  currentView === 'create'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Trip</span>
              </button>

              {selectedTrip && (
                <button
                  id="nav-btn-invoice-preview"
                  onClick={() => handleNavClick('invoice')}
                  className={`flex items-center space-x-1.5 lg:space-x-2 px-2.5 sm:px-3 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    currentView === 'invoice'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="hidden lg:inline">Invoice ({selectedTrip.billNo})</span>
                  <span className="lg:hidden">Invoice</span>
                </button>
              )}

              <button
                id="nav-btn-history"
                onClick={() => handleNavClick('history')}
                className={`flex items-center space-x-1.5 lg:space-x-2 px-2.5 sm:px-3 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  currentView === 'history'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <History className="w-4 h-4 text-emerald-400" />
                <span>Trips</span>
                <span className="ml-0.5 lg:ml-1 text-[10px] lg:text-[11px] px-1.5 lg:px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 font-mono font-bold">
                  {totalTripsCount}
                </span>
              </button>

              <button
                id="nav-btn-analytics"
                onClick={() => handleNavClick('analytics')}
                className={`flex items-center space-x-1.5 lg:space-x-2 px-2.5 sm:px-3 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  currentView === 'analytics'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>Insights</span>
              </button>
            </nav>

            <div className="h-6 lg:h-7 w-px bg-slate-800"></div>

            {/* Settings Button */}
            <button
              id="nav-btn-settings"
              onClick={() => handleNavClick('settings')}
              title="Company & Billing Settings"
              className={`flex items-center gap-1.5 lg:gap-2 px-2.5 sm:px-3 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer whitespace-nowrap ${
                currentView === 'settings' 
                  ? 'bg-slate-800 text-white border-slate-600 shadow-xs' 
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            {/* Lock / Exit Staff Portal Button */}
            {onLock && (
              <button
                id="nav-btn-lock"
                onClick={onLock}
                title="Lock Staff Portal (Requires PIN 2030 to unlock)"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 lg:py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Lock</span>
              </button>
            )}
          </div>

          {/* Mobile Right Controls: Prominent Action Button + Larger Hamburger Button */}
          <div className="flex md:hidden items-center space-x-2.5">
            {/* Quick action button on mobile */}
            {currentView !== 'create' && (
              <button
                onClick={() => handleNavClick('create')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ New Trip</span>
              </button>
            )}

            {/* Large, comfortable Hamburger Toggle Button */}
            <button
              id="nav-mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white border border-slate-700 focus:outline-none transition-all cursor-pointer flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded, Spacious Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/98 backdrop-blur-xl px-4 py-4 space-y-2.5 shadow-2xl animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between px-2 pt-1 pb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Navigation Menu
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Travel Care Tours
            </span>
          </div>

          {/* New Trip */}
          <button
            onClick={() => handleNavClick('create')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              currentView === 'create'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-750'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentView === 'create' ? 'bg-blue-700 text-white' : 'bg-slate-700 text-blue-400'
              }`}>
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">New Trip Invoice</div>
                <div className={`text-xs ${currentView === 'create' ? 'text-blue-100' : 'text-slate-400'}`}>
                  Create new booking & calculate bill
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-70" />
          </button>

          {/* Selected Trip Invoice (if active) */}
          {selectedTrip && (
            <button
              onClick={() => handleNavClick('invoice')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                currentView === 'invoice'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-750'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  currentView === 'invoice' ? 'bg-blue-700 text-white' : 'bg-slate-700 text-amber-400'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold">Invoice ({selectedTrip.billNo})</div>
                  <div className={`text-xs ${currentView === 'invoice' ? 'text-blue-100' : 'text-slate-400'}`}>
                    {selectedTrip.customerName} • Preview & Share
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 opacity-70" />
            </button>
          )}

          {/* Trips History */}
          <button
            onClick={() => handleNavClick('history')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              currentView === 'history'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-750'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentView === 'history' ? 'bg-blue-700 text-white' : 'bg-slate-700 text-emerald-400'
              }`}>
                <History className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">Trip Records & Ledger</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-950 text-emerald-300 border border-slate-700 font-mono font-bold">
                    {totalTripsCount}
                  </span>
                </div>
                <div className={`text-xs ${currentView === 'history' ? 'text-blue-100' : 'text-slate-400'}`}>
                  All bills, settlements, balances & archive
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-70" />
          </button>

          {/* Fleet Insights */}
          <button
            onClick={() => handleNavClick('analytics')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              currentView === 'analytics'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-750'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentView === 'analytics' ? 'bg-blue-700 text-white' : 'bg-slate-700 text-purple-400'
              }`}>
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">Fleet & Revenue Insights</div>
                <div className={`text-xs ${currentView === 'analytics' ? 'text-blue-100' : 'text-slate-400'}`}>
                  Driver allowances, vehicle KM and earnings
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-70" />
          </button>

          {/* Settings */}
          <button
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              currentView === 'settings'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-750'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentView === 'settings' ? 'bg-blue-700 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                <Settings className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">Company & Tariff Settings</div>
                <div className={`text-xs ${currentView === 'settings' ? 'text-blue-100' : 'text-slate-400'}`}>
                  Address, GST, UPI QR & Google Sheet sync
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-70" />
          </button>

          {/* Lock Staff Portal (Mobile) */}
          {onLock && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLock();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold text-rose-300 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-800/40 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-900/50 text-rose-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-rose-200">Lock Staff Portal</div>
                  <div className="text-xs text-rose-400/80">
                    Sign out (Requires PIN 2030 to unlock)
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 opacity-70" />
            </button>
          )}
        </div>
      )}
    </header>
  );
};


