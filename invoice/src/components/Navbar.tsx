import { useState } from 'react';
import { ViewMode, TripRecord } from '../types';
import { TravelCareLogo } from './TravelCareLogo';
import { 
  FileText, 
  PlusCircle, 
  Plus,
  History, 
  Settings, 
  TrendingUp,
  Lock,
  Menu,
  X,
  ChevronRight,
  Car,
  LayoutGrid,
  Cloud,
  CloudOff,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  selectedTrip: TripRecord | null;
  totalTripsCount: number;
  onExportCsv: () => void;
  onLock?: () => void;
  onReturnToHub?: () => void;
  syncStatus?: 'synced' | 'syncing' | 'offline' | 'error';
  onTriggerSync?: () => void;
}

export const Navbar = ({
  currentView,
  onViewChange,
  selectedTrip,
  totalTripsCount,
  onLock,
  onReturnToHub,
  syncStatus = 'synced',
  onTriggerSync
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
          
          {/* Left Brand Area & Workspace Hub Quick Access Button (Logo only, without text) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onReturnToHub && (
              <button
                id="nav-btn-hub-quick"
                onClick={onReturnToHub}
                title="Return to Workspace Hub (Operations & Planner)"
                aria-label="Workspace Hub"
                className="p-2 sm:p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/90 hover:border-blue-500/50 transition-all cursor-pointer flex items-center justify-center group shadow-xs active:scale-95 shrink-0"
              >
                <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </button>
            )}

            {/* Plain White Logo as given in the footer of the main webpage */}
            <div 
              className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer select-none group py-1" 
              onClick={() => onReturnToHub ? onReturnToHub() : handleNavClick('create')}
              title="Travel Care Tours - Workspace Hub"
            >
              <TravelCareLogo 
                variant="white" 
                className="h-9 sm:h-11 lg:h-13 w-auto transition-transform group-hover:scale-[1.02]" 
              />
              <div className="hidden sm:block border-l border-slate-700/80 pl-2.5 sm:pl-3">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 tracking-wider uppercase block">
                  Trip Billing & Invoicing
                </span>
              </div>
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

            {/* Real-time Cloud Multi-Device Sync Indicator (Icon Only, No Text) */}
            <button
              id="nav-btn-cloud-sync"
              onClick={onTriggerSync}
              title={
                syncStatus === 'syncing'
                  ? 'Syncing with cloud...'
                  : syncStatus === 'error'
                  ? 'Cloud sync error - click to retry'
                  : syncStatus === 'offline'
                  ? 'Offline - click to reconnect'
                  : 'Cloud Synced: All bills sync automatically across all devices. Click to refresh.'
              }
              aria-label="Cloud Sync Status"
              className={`p-1.5 lg:p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-xs active:scale-95 ${
                syncStatus === 'syncing'
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/25'
                  : syncStatus === 'error'
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                  : syncStatus === 'offline'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {syncStatus === 'syncing' ? (
                <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              ) : syncStatus === 'offline' ? (
                <CloudOff className="w-4 h-4 text-amber-400" />
              ) : syncStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <div className="relative flex items-center justify-center">
                  <Cloud className="w-4 h-4 text-emerald-400" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
              )}
            </button>

            {/* Desktop Right Quick Access to Workspace Hub (Logo Only, No Text) */}
            {onReturnToHub && (
              <button
                id="nav-btn-hub-desktop-right"
                onClick={onReturnToHub}
                title="Return to Workspace Hub"
                aria-label="Workspace Hub"
                className="p-1.5 lg:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer flex items-center justify-center shadow-xs active:scale-95 shrink-0"
              >
                <LayoutGrid className="w-4 h-4 text-blue-400" />
              </button>
            )}

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
                title="Lock Staff Portal"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 lg:py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Lock</span>
              </button>
            )}
          </div>

          {/* Mobile Right Controls: Hub Quick Access, New Trip (+), Lock Icon, and Menu Hamburger */}
          <div className="flex md:hidden items-center space-x-1.5 sm:space-x-2">
            {/* Quick Access to Workspace Hub on Mobile (Logo Only, No Text) */}
            {onReturnToHub && (
              <button
                id="mobile-btn-hub"
                onClick={onReturnToHub}
                title="Return to Workspace Hub"
                aria-label="Workspace Hub"
                className="p-2 sm:p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700/90 hover:border-blue-500/50 transition-all cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
              >
                <LayoutGrid className="w-5 h-5 text-blue-400" />
              </button>
            )}

            {/* Direct + Icon for New Trip */}
            <button
              id="mobile-btn-new-trip"
              onClick={() => handleNavClick('create')}
              title="Create New Trip"
              className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                currentView === 'create'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25'
                  : 'bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 border-blue-500/30'
              }`}
              aria-label="New Trip"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Direct Lock Icon in Header */}
            {onLock && (
              <button
                id="mobile-btn-lock"
                onClick={onLock}
                title="Lock Staff Portal"
                className="p-2 sm:p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-750 border border-slate-700/90 transition-all cursor-pointer flex items-center justify-center"
                aria-label="Lock Portal"
              >
                <Lock className="w-5 h-5" />
              </button>
            )}

            {/* Compact Hamburger Toggle */}
            <button
              id="nav-mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-750 border border-slate-700/90 focus:outline-none transition-all cursor-pointer flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modern, Streamlined Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/98 backdrop-blur-xl px-4 py-3.5 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-2 pt-0.5 pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Staff Portal Views
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <Cloud className="w-3 h-3 text-emerald-400" />
              <span>Multi-Device Cloud Sync</span>
            </div>
          </div>

          {/* Quick Access back to Workspace Hub in Mobile Drawer */}
          {onReturnToHub && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onReturnToHub();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold bg-blue-600/10 hover:bg-blue-600/20 text-blue-200 border border-blue-500/30 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs text-white">Workspace Hub</div>
                  <div className="text-[11px] text-blue-300">Operations &amp; Itinerary Planner</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400 opacity-80" />
            </button>
          )}

          {/* Active Invoice (Placed BEFORE Trip Records & Ledger) */}
          {selectedTrip ? (
            <button
              onClick={() => handleNavClick('invoice')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'invoice'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  currentView === 'invoice' ? 'bg-blue-700 text-white' : 'bg-slate-700/80 text-amber-400'
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs">Active Invoice ({selectedTrip.billNo})</div>
                  <div className={`text-[11px] ${currentView === 'invoice' ? 'text-blue-100' : 'text-slate-400'}`}>
                    {selectedTrip.customerName} • Preview & Share
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('invoice')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'invoice'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-700/80 text-amber-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs">Active Invoice</div>
                  <div className="text-[11px] text-slate-400">Preview & Share bill</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>
          )}

          {/* Trips History & Ledger */}
          <button
            onClick={() => handleNavClick('history')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentView === 'history'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                currentView === 'history' ? 'bg-blue-700 text-white' : 'bg-slate-700/80 text-emerald-400'
              }`}>
                <History className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs">Trip Records & Ledger</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950 text-emerald-300 border border-slate-700 font-mono font-bold">
                    {totalTripsCount}
                  </span>
                </div>
                <div className={`text-[11px] ${currentView === 'history' ? 'text-blue-100' : 'text-slate-400'}`}>
                  Balances, settlements & archive
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-60" />
          </button>

          {/* Fleet Insights */}
          <button
            onClick={() => handleNavClick('analytics')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentView === 'analytics'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                currentView === 'analytics' ? 'bg-blue-700 text-white' : 'bg-slate-700/80 text-purple-400'
              }`}>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold text-xs">Fleet & Revenue Insights</div>
                <div className={`text-[11px] ${currentView === 'analytics' ? 'text-blue-100' : 'text-slate-400'}`}>
                  Earnings, driver batta & KM analytics
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-60" />
          </button>

          {/* Settings */}
          <button
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentView === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                currentView === 'settings' ? 'bg-blue-700 text-white' : 'bg-slate-700/80 text-slate-300'
              }`}>
                <Settings className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold text-xs">Company & Tariff Settings</div>
                <div className={`text-[11px] ${currentView === 'settings' ? 'text-blue-100' : 'text-slate-400'}`}>
                  Address, GST, UPI & default tariffs
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-60" />
          </button>
        </div>
      )}
    </header>
  );
};


