import React, { useState, useEffect, useRef } from 'react';
import { TripRecord, CompanySettings } from '../types';
import { formatCurrency, formatNumber, convertTripsToCsv, generateWhatsAppMessage } from '../utils/calculations';
import { PaymentSettlementModal } from './PaymentSettlementModal';
import { DataBackupModal } from './DataBackupModal';
import { GuestReceiptModal } from './GuestReceiptModal';
import { ShareInvoiceModal } from './ShareInvoiceModal';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  PlusCircle, 
  FileText, 
  Share2, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Car, 
  User, 
  Calendar, 
  IndianRupee, 
  TrendingUp, 
  ArrowUpRight,
  ExternalLink,
  Archive,
  RotateCcw,
  BadgeCheck,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Database,
  Smartphone,
  MoreVertical,
  ChevronRight
} from 'lucide-react';

interface TripHistoryProps {
  trips: TripRecord[];
  archivedTrips: TripRecord[];
  companySettings: CompanySettings;
  onSelectTrip: (trip: TripRecord) => void;
  onEditTrip: (trip: TripRecord) => void;
  onDeleteTrip: (tripId: string) => void;
  onRestoreTrip: (tripId: string) => void;
  onPermanentDeleteTrip: (tripId: string) => void;
  onSaveSettlement: (updatedTrip: TripRecord) => void;
  onSaveSettings: (settings: CompanySettings) => void;
  onNewTrip: () => void;
  onImportTrips: (newTrips: TripRecord[]) => void;
  onRestoreData?: (activeTrips: TripRecord[], archivedTrips: TripRecord[], settings?: CompanySettings) => void;
}

export const TripHistory: React.FC<TripHistoryProps> = ({
  trips,
  archivedTrips = [],
  companySettings,
  onSelectTrip,
  onEditTrip,
  onDeleteTrip,
  onRestoreTrip,
  onPermanentDeleteTrip,
  onSaveSettlement,
  onSaveSettings,
  onNewTrip,
  onImportTrips,
  onRestoreData,
}) => {
  const [activeViewTab, setActiveViewTab] = useState<'active' | 'archive'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'closed'>('all');
  const [filterVehicle, setFilterVehicle] = useState<string>('all');

  // Modal states
  const [settlementTrip, setSettlementTrip] = useState<TripRecord | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [guestReceiptTrip, setGuestReceiptTrip] = useState<TripRecord | null>(null);
  const [shareTripModal, setShareTripModal] = useState<TripRecord | null>(null);
  const [actionMenuTripId, setActionMenuTripId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  // Close action dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActionMenuTripId(null);
      }
    };
    if (actionMenuTripId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionMenuTripId]);

  const currency = companySettings.currencySymbol || '₹';

  // Current active list based on tab
  const displayedSourceList = activeViewTab === 'active' ? trips : archivedTrips;

  // Extract unique vehicles
  const vehicleList = Array.from(new Set(trips.map(t => t.vehicleNumber).filter(Boolean)));

  // Filtered trips
  const filteredTrips = displayedSourceList.filter(trip => {
    const matchesSearch = 
      trip.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.tripRoute.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const isClosed = trip.status === 'closed' || trip.balanceAmount <= 0;
    const matchesStatus = 
      filterStatus === 'all' ? true :
      filterStatus === 'closed' ? isClosed :
      !isClosed;

    const matchesVehicle = 
      filterVehicle === 'all' ? true :
      trip.vehicleNumber === filterVehicle;

    return matchesSearch && matchesStatus && matchesVehicle;
  });

  // High-level ledger calculations for active trips
  const totalRevenue = trips.reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  const totalAdvance = trips.reduce((acc, t) => acc + (t.advanceReceived || 0), 0);
  const totalSettlements = trips.reduce((acc, t) => acc + (t.settlementAmount || 0), 0);
  const totalPending = trips.reduce((acc, t) => acc + Math.max(0, t.balanceAmount || 0), 0);
  const totalKmDriven = trips.reduce((acc, t) => acc + (t.totalKm || 0), 0);

  // Handle CSV Download
  const handleExportCsv = () => {
    const csvContent = convertTripsToCsv(displayedSourceList);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TravelCare_${activeViewTab === 'active' ? 'Active_Trips' : 'Archived_Bills'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick WhatsApp share
  const handleQuickWhatsApp = (trip: TripRecord) => {
    const message = generateWhatsAppMessage(trip, companySettings);
    const cleanPhone = trip.customerPhone ? trip.customerPhone.replace(/[^0-9]/g, '') : '';
    const whatsappUrl = cleanPhone.length >= 10
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Stats Overview & Balanced Ledger */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Trips & Mileage */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">Fleet Volume</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 font-mono tracking-tight">{trips.length} <span className="text-sm font-sans font-medium text-slate-500">Trips</span></div>
          <span className="text-[11px] text-slate-500 mt-1 block truncate font-mono">{formatNumber(totalKmDriven)} KM logged</span>
        </div>

        {/* Total Revenue & Advance */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">Gross Billed</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 font-mono tracking-tight">
            {formatCurrency(totalRevenue, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono truncate">
            Adv Received: {formatCurrency(totalAdvance, currency)}
          </span>
        </div>

        {/* Closed / Settled Collected */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">Total Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-800 mt-2 font-mono tracking-tight">
            {formatCurrency(totalAdvance + totalSettlements, currency)}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block font-mono truncate">
            Post-Trip Settled: {formatCurrency(totalSettlements, currency)}
          </span>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-200 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">Outstanding Due</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-900 mt-2 font-mono tracking-tight">
            {formatCurrency(totalPending, currency)}
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block font-medium truncate">
            {trips.filter(t => (t.balanceAmount || 0) > 0 && t.status !== 'closed').length} trips pending payment
          </span>
        </div>
      </div>

      {/* Main Tabs: Active Trips vs Archive / Recycle Bin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveViewTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-2 cursor-pointer ${
              activeViewTab === 'active'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Active Trips ({trips.length})</span>
          </button>

          <button
            onClick={() => setActiveViewTab('archive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-2 cursor-pointer ${
              activeViewTab === 'archive'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Archive / Recycle Bin ({archivedTrips.length})</span>
          </button>
        </div>

        {/* Data Backup & Export & New Trip CTAs */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download & Backup</span>
          </button>

          {activeViewTab === 'active' && (
            <button
              onClick={onNewTrip}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Trip</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by customer, bill no, driver, route, vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center flex-wrap gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Payment Status</option>
            <option value="pending">⏳ Pending Balance</option>
            <option value="closed">✅ Closed / Settled</option>
          </select>

          <select
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Vehicles</option>
            {vehicleList.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Trips Display: Responsive Mobile Cards (md:hidden) & Polished Desktop Table (hidden md:block) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* ===================== 1. MOBILE CARD VIEW (Responsive & Touch-Friendly) ===================== */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredTrips.length === 0 ? (
            <div className="py-12 px-4 text-center text-slate-400">
              {activeViewTab === 'active' ? (
                <>
                  <Car className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-xs">No trip records found matching your filters</p>
                  <button
                    onClick={onNewTrip}
                    className="mt-3 inline-flex items-center text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    + Create a new trip record
                  </button>
                </>
              ) : (
                <>
                  <Archive className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-xs">The Archive is currently empty.</p>
                </>
              )}
            </div>
          ) : (
            filteredTrips.map((trip) => {
              const isClosed = trip.status === 'closed' || trip.balanceAmount <= 0;
              const isMenuOpen = actionMenuTripId === trip.id;

              return (
                <div key={trip.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                  {/* Top Row: Bill No & Status Pill Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-900 border border-slate-200 text-xs font-mono font-bold">
                        {trip.billNo}
                      </span>
                      <span className="text-xs text-slate-500 font-medium flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                        {trip.dateOfTrip}
                      </span>
                    </div>

                    {/* Status Pill Badge with Perfect Border Radius */}
                    {isClosed ? (
                      <span className="inline-flex items-center text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        Settled
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
                        <Clock className="w-3 h-3 mr-1 text-amber-600" />
                        Due: {formatCurrency(trip.balanceAmount, currency)}
                      </span>
                    )}
                  </div>

                  {/* Customer & Route Details */}
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-slate-900">
                      {trip.customerName}
                    </div>
                    <div className="text-xs font-medium text-slate-700">
                      {trip.tripRoute || 'Cab Tour'}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{trip.vehicleNumber} • {trip.vehicleType}</span>
                      <span className="font-mono font-bold text-slate-800">{formatNumber(trip.totalKm)} KM</span>
                    </div>
                  </div>

                  {/* Financial Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Total Bill:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(trip.totalAmount, currency)}
                    </span>
                  </div>

                  {/* Action Bar (Streamlined) */}
                  <div className="pt-1 flex items-center justify-between gap-2 relative">
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => onSelectTrip(trip)}
                        className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>

                      {activeViewTab === 'active' && !isClosed && (
                        <button
                          onClick={() => setSettlementTrip(trip)}
                          className="py-1.5 px-3 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <span>Settle</span>
                        </button>
                      )}
                    </div>

                    {/* Secondary Actions Dropdown Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuTripId(isMenuOpen ? null : trip.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                        aria-label="More actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div 
                          ref={actionMenuRef}
                          className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                        >
                          {activeViewTab === 'active' ? (
                            <>
                              <button
                                onClick={() => {
                                  setActionMenuTripId(null);
                                  setGuestReceiptTrip(trip);
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                                <span>Guest View (Mobile)</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActionMenuTripId(null);
                                  setShareTripModal(trip);
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Share2 className="w-3.5 h-3.5 text-blue-500" />
                                <span>Share & WhatsApp</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActionMenuTripId(null);
                                  onEditTrip(trip);
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5 text-slate-600" />
                                <span>Edit Trip Details</span>
                              </button>
                              <div className="my-1 border-t border-slate-100"></div>
                              <button
                                onClick={() => {
                                  setActionMenuTripId(null);
                                  onDeleteTrip(trip.id);
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Move to Archive</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setActionMenuTripId(null);
                                  onRestoreTrip(trip.id);
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-medium text-blue-700 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restore Trip</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActionMenuTripId(null);
                                  onPermanentDeleteTrip(trip.id);
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Permanently</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ===================== 2. DESKTOP TABLE VIEW (Decluttered & Clean) ===================== */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Bill No</th>
                <th className="py-3 px-4">Date & Customer</th>
                <th className="py-3 px-4">Route & Duration</th>
                <th className="py-3 px-4">Vehicle & Driver</th>
                <th className="py-3 px-4 text-center">Distance</th>
                <th className="py-3 px-4 text-right">Ledger Status & Balance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {activeViewTab === 'active' ? (
                      <>
                        <Car className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-medium">No trip records found matching your filters</p>
                        <button
                          onClick={onNewTrip}
                          className="mt-3 inline-flex items-center text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          + Create a new trip record
                        </button>
                      </>
                    ) : (
                      <>
                        <Archive className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-medium">The Archive is currently empty.</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          When you delete any invoice, it is safely preserved here for audit or restoration.
                        </p>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => {
                  const isClosed = trip.status === 'closed' || trip.balanceAmount <= 0;
                  const isMenuOpen = actionMenuTripId === trip.id;

                  return (
                    <tr key={trip.id} className="hover:bg-slate-50/80 transition-colors group">
                      
                      {/* Bill No */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors">
                          {trip.billNo}
                        </span>
                      </td>

                      {/* Date & Customer (Phone number removed as requested for aesthetics) */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs">{trip.customerName}</div>
                        <div className="text-slate-500 text-[11px] flex items-center mt-0.5">
                          <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                          <span>{trip.dateOfTrip}</span>
                        </div>
                      </td>

                      {/* Route & Duration */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate" title={trip.tripRoute}>
                          {trip.tripRoute}
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {trip.durationText || `${trip.numberOfDays} Day${trip.numberOfDays > 1 ? 's' : ''}`} • {trip.remarks || 'Holiday / Cab Tour'}
                        </div>
                      </td>

                      {/* Vehicle & Driver */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">{trip.vehicleNumber}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {trip.driverName} • <span className="text-slate-700 font-medium">{trip.vehicleType}</span>
                        </div>
                      </td>

                      {/* Distance (Odometer readings removed as requested for clean aesthetics) */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <div className="font-bold text-slate-900">{formatNumber(trip.totalKm)} KM</div>
                      </td>

                      {/* Total & Ledger Balance with Perfect Border Radius */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-slate-900">
                          {formatCurrency(trip.totalAmount, currency)}
                        </div>
                        
                        <div className="mt-1 flex flex-col items-end gap-1">
                          {isClosed ? (
                            <span className="inline-flex items-center text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                              <span>Settled</span>
                              {trip.settlementDate && (
                                <span className="ml-1 text-emerald-700 font-normal">
                                  ({trip.settlementDate})
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
                              <Clock className="w-3 h-3 mr-1 text-amber-600" />
                              <span>Due: {formatCurrency(trip.balanceAmount, currency)}</span>
                            </span>
                          )}

                          {trip.settlementAmount && trip.settlementAmount > 0 && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              Paid {formatCurrency(trip.settlementAmount, currency)} via {trip.settlementPaymentMode || 'UPI'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons: Decluttered & Elegant */}
                      <td className="py-3.5 px-4 text-right">
                        {activeViewTab === 'active' ? (
                          <div className="flex items-center justify-end space-x-1.5 relative">
                            {/* Primary Invoice View */}
                            <button
                              onClick={() => onSelectTrip(trip)}
                              title="View & Download Invoice"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50/90 hover:bg-blue-100 border border-blue-200/80 transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Invoice</span>
                            </button>

                            {/* Settle Button (Displayed only once, if payment is pending) */}
                            {!isClosed && (
                              <button
                                onClick={() => setSettlementTrip(trip)}
                                title="Record remaining payment"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200/80 transition-colors cursor-pointer"
                              >
                                <BadgeCheck className="w-3.5 h-3.5" />
                                <span>Settle</span>
                              </button>
                            )}

                            {/* Dropdown More Menu Button */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActionMenuTripId(isMenuOpen ? null : trip.id);
                                }}
                                title="More options"
                                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {/* Dropdown Card */}
                              {isMenuOpen && (
                                <div 
                                  ref={actionMenuRef}
                                  className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-left animate-in fade-in zoom-in-95 duration-100"
                                >
                                  <button
                                    onClick={() => {
                                      setActionMenuTripId(null);
                                      setGuestReceiptTrip(trip);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Guest Mobile View</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActionMenuTripId(null);
                                      setShareTripModal(trip);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Share2 className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Share & WhatsApp</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActionMenuTripId(null);
                                      onEditTrip(trip);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Edit Trip Details</span>
                                  </button>
                                  <div className="my-1 border-t border-slate-100"></div>
                                  <button
                                    onClick={() => {
                                      setActionMenuTripId(null);
                                      onDeleteTrip(trip.id);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Move to Archive</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => onSelectTrip(trip)}
                              title="View Archived Invoice"
                              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                            >
                              <FileText className="w-4 h-4 text-slate-800" />
                            </button>

                            <button
                              onClick={() => onRestoreTrip(trip.id)}
                              title="Restore Trip to Active List"
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>

                            <button
                              onClick={() => onPermanentDeleteTrip(trip.id)}
                              title="Delete Permanently"
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info matching Google Sheets format */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            Showing {filteredTrips.length} of {displayedSourceList.length} {activeViewTab === 'active' ? 'active trips' : 'archived records'}
          </span>
          <div className="flex items-center space-x-3 text-[11px]">
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="text-emerald-700 font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Export & Backup Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Settlement Modal */}
      <PaymentSettlementModal
        isOpen={Boolean(settlementTrip)}
        trip={settlementTrip}
        currency={currency}
        onClose={() => setSettlementTrip(null)}
        onSaveSettlement={(updatedTrip) => {
          onSaveSettlement(updatedTrip);
          setSettlementTrip(null);
        }}
      />

      {/* Data Backup Modal */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        trips={trips}
        archivedTrips={archivedTrips}
        companySettings={companySettings}
        onRestoreData={onRestoreData}
      />

      {/* Comprehensive Share Invoice with Guest Modal */}
      {shareTripModal && (
        <ShareInvoiceModal
          trip={shareTripModal}
          companySettings={companySettings}
          onClose={() => setShareTripModal(null)}
          onDownloadPdf={() => {
            onSelectTrip(shareTripModal);
            setShareTripModal(null);
          }}
          onDirectSharePdf={() => {
            onSelectTrip(shareTripModal);
            setShareTripModal(null);
          }}
          onPrint={() => {
            onSelectTrip(shareTripModal);
            setShareTripModal(null);
          }}
          onOpenGuestPortal={() => {
            setGuestReceiptTrip(shareTripModal);
            setShareTripModal(null);
          }}
        />
      )}

      {/* Guest Digital Receipt Modal */}
      {guestReceiptTrip && (
        <GuestReceiptModal
          trip={guestReceiptTrip}
          companySettings={companySettings}
          onClose={() => setGuestReceiptTrip(null)}
          onDownloadPdf={() => {
            onSelectTrip(guestReceiptTrip);
            setGuestReceiptTrip(null);
          }}
          onDirectSharePdf={() => {
            onSelectTrip(guestReceiptTrip);
            setGuestReceiptTrip(null);
          }}
          onPrint={() => {
            onSelectTrip(guestReceiptTrip);
            setGuestReceiptTrip(null);
          }}
        />
      )}

    </div>
  );
};
