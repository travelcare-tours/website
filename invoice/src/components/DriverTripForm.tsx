import React, { useState, useEffect, useMemo } from 'react';
import { TripRecord, CompanySettings } from '../types';
import { calculateTripTotals, calculateTripDuration, formatCurrency, formatNumber, generateWhatsAppMessage } from '../utils/calculations';
import { vehiclePresets, commonRoutes } from '../data/initialData';
import { 
  Car, 
  User, 
  MapPin, 
  Gauge, 
  IndianRupee, 
  Calendar, 
  CreditCard, 
  FileText, 
  Sparkles, 
  Share2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowRight,
  Phone,
  ShieldCheck,
  RefreshCw,
  Moon,
  Zap,
  Navigation
} from 'lucide-react';

interface DriverTripFormProps {
  initialTrip?: TripRecord | null;
  onSaveTrip: (trip: TripRecord, navigateToInvoice?: boolean) => void;
  companySettings: CompanySettings;
  existingTrips?: TripRecord[];
  nextBillNo: string;
}

// Popular Kerala holiday tour circuits
const KERALA_TOUR_PRESETS = [
  { name: 'Cochin ⇄ Munnar Hill Station', days: 3, estKm: 320, route: 'Cochin - Neriamangalam - Valara - Munnar' },
  { name: 'Munnar ⇄ Thekkady (Periyar)', days: 2, estKm: 180, route: 'Munnar - Poopara - Anakkara - Thekkady' },
  { name: 'Cochin ⇄ Alleppey Backwaters', days: 2, estKm: 160, route: 'Cochin - Mararikulam - Alleppey Punnamada' },
  { name: 'Cochin City ⇄ Athirappilly Falls', days: 1, estKm: 150, route: 'Cochin - Chalakudy - Athirappilly - Vazhachal' },
  { name: 'Cochin ⇄ Kovalam & Varkala', days: 4, estKm: 460, route: 'Cochin - Kollam - Varkala - Trivandrum - Kovalam' },
  { name: 'Calicut ⇄ Wayanad Highlands', days: 3, estKm: 280, route: 'Calicut - Thamarassery Churam - Vythiri - Kalpetta' },
  { name: '7-Day Kerala Classic Circuit', days: 7, estKm: 920, route: 'Cochin - Munnar - Thekkady - Alleppey - Cochin Airport' }
];

export const DriverTripForm: React.FC<DriverTripFormProps> = ({
  initialTrip,
  onSaveTrip,
  companySettings,
  existingTrips = [],
  nextBillNo
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Smart Recent Memory extracted from existing trips
  const recentCustomers = useMemo(() => {
    const map = new Map<string, string>();
    existingTrips.forEach(t => {
      if (t.customerName && t.customerName.trim().length > 1 && !map.has(t.customerName.trim())) {
        map.set(t.customerName.trim(), t.customerPhone || '');
      }
    });
    return Array.from(map.entries()).map(([name, phone]) => ({ name, phone }));
  }, [existingTrips]);

  const recentVehicles = useMemo(() => {
    const map = new Map<string, { type: string; driver: string; phone: string }>();
    existingTrips.forEach(t => {
      if (t.vehicleNumber && t.vehicleNumber.trim().length > 2 && !map.has(t.vehicleNumber.trim())) {
        map.set(t.vehicleNumber.trim(), {
          type: t.vehicleType || 'Sedan',
          driver: t.driverName || '',
          phone: t.driverPhone || ''
        });
      }
    });
    return Array.from(map.entries()).map(([number, data]) => ({ number, ...data }));
  }, [existingTrips]);

  const [formData, setFormData] = useState<Partial<TripRecord>>({
    billNo: nextBillNo,
    timestamp: new Date().toLocaleString('en-US', { hour12: false }),
    emailAddress: companySettings.email || 'hashimhassan2@gmail.com',
    dateOfTrip: todayStr,
    pickupDate: todayStr,
    pickupTime: '08:00',
    dropoffDate: todayStr,
    dropoffTime: '20:00',
    customerName: '',
    customerPhone: '',
    numberOfDays: 1,
    durationText: '1 Day (12.0 hrs)',
    vehicleNumber: 'KL',
    vehicleType: 'Sedan',
    driverName: '',
    driverPhone: '',
    tripRoute: '',
    startingKm: 0,
    closingKm: 0,
    ratePerKm: 16,
    includedKm: 100,
    dailyPackageRate: 1200,
    driverBata: 1000,
    tollParkingPermit: 0,
    otherCharges: 0,
    advanceReceived: 0,
    paymentMode: 'Cash',
    remarks: '',
    adjustment: 0,
  });

  useEffect(() => {
    if (initialTrip) {
      const pDate = initialTrip.pickupDate || initialTrip.dateOfTrip || todayStr;
      const pTime = initialTrip.pickupTime || '08:00';
      const dDate = initialTrip.dropoffDate || pDate;
      const dTime = initialTrip.dropoffTime || '20:00';
      const duration = calculateTripDuration(pDate, pTime, dDate, dTime);

      setFormData({
        ...initialTrip,
        pickupDate: pDate,
        pickupTime: pTime,
        dropoffDate: dDate,
        dropoffTime: dTime,
        numberOfDays: initialTrip.numberOfDays || duration.days,
        durationText: initialTrip.durationText || duration.durationText,
      });
    } else {
      const duration = calculateTripDuration(todayStr, '08:00', todayStr, '20:00');
      setFormData(prev => ({
        ...prev,
        billNo: nextBillNo,
        timestamp: new Date().toLocaleString('en-US', { hour12: false }),
        dateOfTrip: todayStr,
        pickupDate: todayStr,
        pickupTime: '08:00',
        dropoffDate: todayStr,
        dropoffTime: '20:00',
        numberOfDays: duration.days,
        durationText: duration.durationText,
      }));
    }
  }, [initialTrip, nextBillNo]);

  // Live computed values
  const calculations = calculateTripTotals(formData);

  // Live duration calculation info
  const durationInfo = calculateTripDuration(
    formData.pickupDate || todayStr,
    formData.pickupTime || '08:00',
    formData.dropoffDate || formData.pickupDate || todayStr,
    formData.dropoffTime || '20:00'
  );

  const handleChange = (field: keyof TripRecord, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateTimeChange = (field: 'pickupDate' | 'pickupTime' | 'dropoffDate' | 'dropoffTime', value: string) => {
    setFormData(prev => {
      const pDate = field === 'pickupDate' ? value : (prev.pickupDate || todayStr);
      const pTime = field === 'pickupTime' ? value : (prev.pickupTime || '08:00');
      const dDate = field === 'dropoffDate' ? value : (prev.dropoffDate || pDate);
      const dTime = field === 'dropoffTime' ? value : (prev.dropoffTime || '20:00');

      const duration = calculateTripDuration(pDate, pTime, dDate, dTime);
      const preset = vehiclePresets.find(v => v.type === prev.vehicleType);
      const baseIncludedPerDay = preset ? preset.defaultIncludedKm : 100;
      const baseDailyBata = 1000;

      return {
        ...prev,
        [field]: value,
        dateOfTrip: pDate,
        numberOfDays: duration.days,
        durationText: duration.durationText,
        extraNightAdded: duration.extraNightAdded,
        includedKm: baseIncludedPerDay * duration.days,
        driverBata: baseDailyBata * duration.days + (duration.nights > 0 ? 300 * duration.nights : 0),
      };
    });
  };

  const handleVehicleTypeChange = (type: string) => {
    const preset = vehiclePresets.find(v => v.type === type);
    const currentDays = durationInfo.days || formData.numberOfDays || 1;
    if (preset) {
      setFormData(prev => ({
        ...prev,
        vehicleType: type,
        ratePerKm: preset.defaultRatePerKm,
        dailyPackageRate: preset.defaultDailyRate,
        includedKm: preset.defaultIncludedKm * currentDays,
      }));
    } else {
      handleChange('vehicleType', type);
    }
  };

  const handleSubmit = (e: React.FormEvent, preview: boolean = true) => {
    e.preventDefault();

    const pDate = formData.pickupDate || formData.dateOfTrip || todayStr;
    const pTime = formData.pickupTime || '08:00';
    const dDate = formData.dropoffDate || pDate;
    const dTime = formData.dropoffTime || '20:00';
    const duration = calculateTripDuration(pDate, pTime, dDate, dTime);

    const fullTrip: TripRecord = {
      id: formData.id || `trip-${Date.now()}`,
      timestamp: formData.timestamp || new Date().toLocaleString('en-US', { hour12: false }),
      emailAddress: formData.emailAddress || companySettings.email,
      dateOfTrip: pDate,
      pickupDate: pDate,
      pickupTime: pTime,
      dropoffDate: dDate,
      dropoffTime: dTime,
      durationText: duration.durationText,
      extraNightAdded: duration.extraNightAdded,
      customerName: formData.customerName?.trim() || 'Valued Customer',
      customerPhone: formData.customerPhone?.trim() || '',
      numberOfDays: duration.days,
      vehicleNumber: formData.vehicleNumber?.trim().toUpperCase() || 'KL39N1510',
      vehicleType: formData.vehicleType || 'Sedan',
      driverName: formData.driverName?.trim() || 'Driver',
      driverPhone: formData.driverPhone?.trim() || '',
      tripRoute: formData.tripRoute?.trim() || 'Local / Outstation Trip',
      startingKm: Number(formData.startingKm) || 0,
      closingKm: Number(formData.closingKm) || 0,
      ratePerKm: Number(formData.ratePerKm) || 0,
      includedKm: Number(formData.includedKm) || 0,
      dailyPackageRate: Number(formData.dailyPackageRate) || 0,
      driverBata: Number(formData.driverBata) || 0,
      tollParkingPermit: Number(formData.tollParkingPermit) || 0,
      otherCharges: Number(formData.otherCharges) || 0,
      advanceReceived: Number(formData.advanceReceived) || 0,
      paymentMode: (formData.paymentMode as any) || 'Cash',
      remarks: formData.remarks?.trim() || '',
      billNo: formData.billNo || nextBillNo,
      adjustment: Number(formData.adjustment) || 0,
      ...calculations,
      documentMergeStatus: 'Generated in App'
    };

    onSaveTrip(fullTrip, preview);
  };

  const handleSaveAndWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const pDate = formData.pickupDate || formData.dateOfTrip || todayStr;
    const pTime = formData.pickupTime || '08:00';
    const dDate = formData.dropoffDate || pDate;
    const dTime = formData.dropoffTime || '20:00';
    const duration = calculateTripDuration(pDate, pTime, dDate, dTime);

    const fullTrip: TripRecord = {
      id: formData.id || `trip-${Date.now()}`,
      timestamp: formData.timestamp || new Date().toLocaleString('en-US', { hour12: false }),
      emailAddress: formData.emailAddress || companySettings.email,
      dateOfTrip: pDate,
      pickupDate: pDate,
      pickupTime: pTime,
      dropoffDate: dDate,
      dropoffTime: dTime,
      durationText: duration.durationText,
      extraNightAdded: duration.extraNightAdded,
      customerName: formData.customerName?.trim() || 'Valued Customer',
      customerPhone: formData.customerPhone?.trim() || '',
      numberOfDays: duration.days,
      vehicleNumber: formData.vehicleNumber?.trim().toUpperCase() || 'KL39N1510',
      vehicleType: formData.vehicleType || 'Sedan',
      driverName: formData.driverName?.trim() || 'Driver',
      driverPhone: formData.driverPhone?.trim() || '',
      tripRoute: formData.tripRoute?.trim() || 'Local / Outstation Trip',
      startingKm: Number(formData.startingKm) || 0,
      closingKm: Number(formData.closingKm) || 0,
      ratePerKm: Number(formData.ratePerKm) || 0,
      includedKm: Number(formData.includedKm) || 0,
      dailyPackageRate: Number(formData.dailyPackageRate) || 0,
      driverBata: Number(formData.driverBata) || 0,
      tollParkingPermit: Number(formData.tollParkingPermit) || 0,
      otherCharges: Number(formData.otherCharges) || 0,
      advanceReceived: Number(formData.advanceReceived) || 0,
      paymentMode: (formData.paymentMode as any) || 'Cash',
      remarks: formData.remarks?.trim() || '',
      billNo: formData.billNo || nextBillNo,
      adjustment: Number(formData.adjustment) || 0,
      ...calculations,
      documentMergeStatus: 'Generated in App'
    };

    onSaveTrip(fullTrip, true);

    const msg = generateWhatsAppMessage(fullTrip, companySettings);
    const cleanPhone = (fullTrip.customerPhone || '').replace(/[^0-9]/g, '');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const loadQuickSample = (sampleType: 'munnar' | 'couple' | 'airport') => {
    if (sampleType === 'munnar') {
      const pDate = todayStr;
      const dDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
      const duration = calculateTripDuration(pDate, '07:00', dDate, '21:30');

      setFormData({
        billNo: nextBillNo,
        timestamp: new Date().toLocaleString('en-US', { hour12: false }),
        emailAddress: companySettings.email,
        dateOfTrip: pDate,
        pickupDate: pDate,
        pickupTime: '07:00',
        dropoffDate: dDate,
        dropoffTime: '21:30',
        numberOfDays: duration.days,
        durationText: duration.durationText,
        extraNightAdded: duration.extraNightAdded,
        customerName: 'Rahul & Family',
        customerPhone: '+91 98470 12345',
        vehicleNumber: 'KL39N1510',
        vehicleType: 'SUV',
        driverName: 'Suresh Kumar',
        driverPhone: '+91 94471 88990',
        tripRoute: 'Cochin - Munnar - Thekkady - Cochin',
        startingKm: 45200,
        closingKm: 45880,
        ratePerKm: 18,
        includedKm: 400,
        dailyPackageRate: 1800,
        driverBata: 2400,
        tollParkingPermit: 450,
        otherCharges: 0,
        advanceReceived: 5000,
        paymentMode: 'UPI',
        remarks: 'Hill station family tour, good trip',
        adjustment: 0,
      });
    } else if (sampleType === 'airport') {
      const pDate = todayStr;
      const duration = calculateTripDuration(pDate, '09:00', pDate, '18:00');

      setFormData({
        billNo: nextBillNo,
        timestamp: new Date().toLocaleString('en-US', { hour12: false }),
        emailAddress: companySettings.email,
        dateOfTrip: pDate,
        pickupDate: pDate,
        pickupTime: '09:00',
        dropoffDate: pDate,
        dropoffTime: '18:00',
        numberOfDays: 1,
        durationText: '1 Day (Local / Airport)',
        extraNightAdded: false,
        customerName: 'Anoop & Family',
        customerPhone: '+91 98470 11223',
        vehicleNumber: 'KL41P5412',
        vehicleType: 'Innova Crysta',
        driverName: 'Sujith Kumar',
        driverPhone: '+91 98470 54321',
        tripRoute: 'Kochi Airport (COK) -> Fort Kochi Sightseeing -> Hotel Drop',
        startingKm: 84200,
        closingKm: 84330,
        ratePerKm: 20,
        includedKm: 100,
        dailyPackageRate: 2600,
        driverBata: 600,
        tollParkingPermit: 250,
        otherCharges: 0,
        advanceReceived: 1000,
        paymentMode: 'UPI',
        remarks: 'Airport pickup & heritage transfer',
        adjustment: 0,
      });
    } else {
      const pDate = todayStr;
      const dDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
      const duration = calculateTripDuration(pDate, '08:00', dDate, '20:00');

      setFormData({
        billNo: nextBillNo,
        timestamp: new Date().toLocaleString('en-US', { hour12: false }),
        emailAddress: companySettings.email,
        dateOfTrip: pDate,
        pickupDate: pDate,
        pickupTime: '08:00',
        dropoffDate: dDate,
        dropoffTime: '20:00',
        numberOfDays: duration.days,
        durationText: duration.durationText,
        extraNightAdded: duration.extraNightAdded,
        customerName: 'Priya & Vikram (Honeymoon)',
        customerPhone: '+91 98950 44332',
        vehicleNumber: 'KL41K1069',
        vehicleType: 'Sedan',
        driverName: 'Amal Raj',
        driverPhone: '+91 94471 22334',
        tripRoute: 'Munnar - Alleppey Houseboat - Kochi Airport',
        startingKm: 162100,
        closingKm: 162620,
        ratePerKm: 16,
        includedKm: 300,
        dailyPackageRate: 1400,
        driverBata: 1800,
        tollParkingPermit: 350,
        otherCharges: 0,
        advanceReceived: 4000,
        paymentMode: 'Cash',
        remarks: 'Houseboat drop + sightseeing included',
        adjustment: 0,
      });
    }
  };

  const currency = companySettings.currencySymbol || '₹';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Top Banner & Quick Presets */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-blue-50 text-blue-800 font-mono text-xs font-bold border border-blue-200">
              {formData.billNo || nextBillNo}
            </span>
            <h1 style={{ fontFamily: 'DM Sans, sans-serif' }} className="text-base sm:text-lg font-bold text-slate-900">
              {initialTrip ? 'Edit Trip & Invoice' : 'Trip Entry Details'}
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            Fill in trip details and odometer readings to generate an instant customer tax invoice.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Fill:</span>
          <button
            type="button"
            onClick={() => loadQuickSample('munnar')}
            className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600" />
            4-Day Munnar (SUV)
          </button>
          <button
            type="button"
            onClick={() => loadQuickSample('couple')}
            className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            3-Day Alleppey (Sedan)
          </button>
          <button
            type="button"
            onClick={() => loadQuickSample('airport')}
            className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
            1-Day Airport (Innova)
          </button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, true)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          
          {/* Main Form Fields (8 Cols on Desktop) */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            
            {/* Step 1: Customer & Journey Timing */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span style={{ fontFamily: 'DM Sans, sans-serif' }}>1. Customer & Journey Timing (Auto-Duration)</span>
                <span className="text-[11px] font-medium text-slate-400 normal-case">Dates & Schedule</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Customer Name with Smart Memory */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Customer Name *
                    </label>
                    {recentCustomers.length > 0 && (
                      <span className="text-[10px] text-blue-600 font-medium flex items-center">
                        <Zap className="w-3 h-3 mr-0.5 text-blue-500" />
                        {recentCustomers.length} saved
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    id="input-customer-name"
                    list="customer-names-list"
                    placeholder="e.g. Sarah Henderson / Mr. & Mrs. Sharma"
                    value={formData.customerName || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChange('customerName', val);
                      const match = recentCustomers.find(c => c.name.toLowerCase() === val.trim().toLowerCase());
                      if (match && match.phone && !formData.customerPhone) {
                        handleChange('customerPhone', match.phone);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
                  />
                  <datalist id="customer-names-list">
                    {recentCustomers.map((c, idx) => (
                      <option key={idx} value={c.name}>
                        {c.phone ? `Phone: ${c.phone}` : ''}
                      </option>
                    ))}
                  </datalist>
                </div>

                {/* Customer Phone / WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Phone / WhatsApp</span>
                    <span className="text-[10px] text-blue-600 font-medium normal-case">Direct Share Ready</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      id="input-customer-phone"
                      placeholder="e.g. +91 91435 43444"
                      value={formData.customerPhone || ''}
                      onChange={(e) => handleChange('customerPhone', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Pickup and Drop-off Timings Grid */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-3">
                  Trip Schedule & Timing
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pickup Date & Time */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-600">
                      Pickup Date & Time *
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="col-span-3 relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="date"
                          required
                          id="input-pickup-date"
                          value={formData.pickupDate || todayStr}
                          onChange={(e) => handleDateTimeChange('pickupDate', e.target.value)}
                          className="w-full pl-8 pr-2 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                        />
                      </div>
                      <div className="col-span-2 relative">
                        <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
                        <input
                          type="time"
                          required
                          id="input-pickup-time"
                          value={formData.pickupTime || '08:00'}
                          onChange={(e) => handleDateTimeChange('pickupTime', e.target.value)}
                          className="w-full pl-7 pr-2 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Drop-off Date & Time */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-600">
                      Drop-off Date & Time *
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="col-span-3 relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="date"
                          required
                          id="input-dropoff-date"
                          value={formData.dropoffDate || formData.pickupDate || todayStr}
                          onChange={(e) => handleDateTimeChange('dropoffDate', e.target.value)}
                          className="w-full pl-8 pr-2 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                        />
                      </div>
                      <div className="col-span-2 relative">
                        <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
                        <input
                          type="time"
                          required
                          id="input-dropoff-time"
                          value={formData.dropoffTime || '20:00'}
                          onChange={(e) => handleDateTimeChange('dropoffTime', e.target.value)}
                          className="w-full pl-7 pr-2 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Auto-Calculated Duration Banner */}
                <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 font-medium">Calculated Duration:</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                      {durationInfo.durationText}
                    </span>
                    <span className="text-[10px] text-slate-400">({durationInfo.totalHours} hrs)</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {durationInfo.nights > 0 && (
                      <span className="inline-flex items-center text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                        <Moon className="w-3 h-3 mr-1" />
                        {durationInfo.nights} Night Halt{durationInfo.nights > 1 ? 's' : ''}
                      </span>
                    )}
                    {durationInfo.hasLateNightDrop && (
                      <span className="inline-flex items-center text-[10px] font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Late Night Drop (Post 10 PM)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Trip Route */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Trip / Route Description *
                </label>
                <input
                  type="text"
                  required
                  id="input-trip-route"
                  placeholder="e.g. Munnar - Thekkady - Alleppey - Kochi"
                  value={formData.tripRoute || ''}
                  onChange={(e) => handleChange('tripRoute', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium mb-2.5"
                />

                {/* Popular Kerala Tour Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Quick Circuit Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {KERALA_TOUR_PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          handleChange('tripRoute', preset.route);
                          const start = formData.startingKm || 0;
                          handleChange('closingKm', start + preset.estKm);
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-blue-50/70 hover:bg-blue-100 text-blue-800 font-medium transition-colors cursor-pointer border border-blue-200/60 flex items-center gap-1"
                        title={`Apply ${preset.route} (~${preset.estKm} KM)`}
                      >
                        <Navigation className="w-3 h-3 text-blue-600" />
                        <span>{preset.name}</span>
                        <span className="text-[10px] text-blue-600 font-mono font-semibold">({preset.estKm}km)</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Vehicle & Driver Details */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <h2 style={{ fontFamily: 'DM Sans, sans-serif' }} className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Vehicle & Driver Profile
                </h2>
                {recentVehicles.length > 0 && (
                  <span className="text-[10px] text-blue-600 font-medium flex items-center">
                    <Zap className="w-3 h-3 mr-0.5 text-blue-500" />
                    {recentVehicles.length} fleet vehicles
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vehicle Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Vehicle Type *
                  </label>
                  <select
                    id="select-vehicle-type"
                    value={formData.vehicleType || 'Sedan'}
                    onChange={(e) => handleVehicleTypeChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
                  >
                    {vehiclePresets.map((vp) => (
                      <option key={vp.type} value={vp.type}>
                        {vp.type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehicle Number with Fleet Memory */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Vehicle Reg. Number *
                  </label>
                  <input
                    type="text"
                    required
                    id="input-vehicle-number"
                    list="vehicle-numbers-list"
                    placeholder="e.g. KL39N1510"
                    value={formData.vehicleNumber || ''}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      handleChange('vehicleNumber', val);
                      const match = recentVehicles.find(v => v.number.toLowerCase() === val.trim().toLowerCase());
                      if (match) {
                        if (match.type) handleVehicleTypeChange(match.type);
                        if (match.driver && !formData.driverName) handleChange('driverName', match.driver);
                        if (match.phone && !formData.driverPhone) handleChange('driverPhone', match.phone);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono font-bold tracking-wider uppercase"
                  />
                  <datalist id="vehicle-numbers-list">
                    {recentVehicles.map((v, idx) => (
                      <option key={idx} value={v.number}>
                        {v.type} • {v.driver}
                      </option>
                    ))}
                  </datalist>
                </div>

                {/* Driver Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Driver's Name *
                  </label>
                  <input
                    type="text"
                    required
                    id="input-driver-name"
                    placeholder="e.g. Suresh Kumar"
                    value={formData.driverName || ''}
                    onChange={(e) => handleChange('driverName', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
                  />
                </div>

                {/* Driver Contact */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Driver Phone / ID
                  </label>
                  <input
                    type="tel"
                    id="input-driver-phone"
                    placeholder="e.g. +91 94471 00000"
                    value={formData.driverPhone || ''}
                    onChange={(e) => handleChange('driverPhone', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Distance & Odometer Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-100">
                <h2 style={{ fontFamily: 'DM Sans, sans-serif' }} className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. Distance & Odometer Breakdown
                </h2>

                {/* Calculated Total KM Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Total:</span>
                  <span className="text-xs font-bold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {formatNumber(calculations.totalKm)} KM
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Starting KM */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Starting KM *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    id="input-starting-km"
                    value={formData.startingKm || ''}
                    onChange={(e) => handleChange('startingKm', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono font-semibold"
                  />
                </div>

                {/* Closing KM */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Closing KM *
                    </label>
                    {/* Quick Add KM shortcuts */}
                    <div className="flex items-center space-x-1">
                      {[50, 100, 250].map(addKm => (
                        <button
                          key={addKm}
                          type="button"
                          onClick={() => {
                            const start = formData.startingKm || 0;
                            handleChange('closingKm', (formData.closingKm && formData.closingKm > start ? formData.closingKm : start) + addKm);
                          }}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                          title={`Add +${addKm} KM to starting odometer`}
                        >
                          +{addKm}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    required
                    id="input-closing-km"
                    value={formData.closingKm || ''}
                    onChange={(e) => handleChange('closingKm', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono font-semibold"
                  />
                </div>

                {/* Included KM in Package */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Included KM
                  </label>
                  <input
                    type="number"
                    min="0"
                    id="input-included-km"
                    value={formData.includedKm ?? ''}
                    onChange={(e) => handleChange('includedKm', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono"
                  />
                </div>

                {/* Rate per Extra KM */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Rate per Extra KM ({currency}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    id="input-rate-per-km"
                    value={formData.ratePerKm || ''}
                    onChange={(e) => handleChange('ratePerKm', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono font-bold text-blue-700"
                  />
                </div>
              </div>

              {/* Real-time Distance Math Summary */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Package Included:</span>
                  <span className="font-semibold text-slate-800">{formatNumber(formData.includedKm || 0)} KM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Billable Extra KM:</span>
                  <span className={`font-bold font-mono px-2 py-0.5 rounded ${calculations.additionalKm > 0 ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-200 text-slate-700'}`}>
                    {formatNumber(calculations.additionalKm)} KM
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Extra KM Charges:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatCurrency(calculations.additionalKmAmount, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 4: Fare, Allowances & Other Charges */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
              <h2 style={{ fontFamily: 'DM Sans, sans-serif' }} className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                4. Tariffs, Allowances & Pass-Through Costs
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Daily / Package Rate */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Daily Rate ({currency})</span>
                    <span className="text-[10px] text-slate-400 normal-case">Hire / Day</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    id="input-daily-rate"
                    value={formData.dailyPackageRate ?? ''}
                    onChange={(e) => handleChange('dailyPackageRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono font-medium"
                  />
                </div>

                {/* Driver Bata */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Driver Bata / Allowance ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    id="input-driver-bata"
                    value={formData.driverBata ?? ''}
                    onChange={(e) => handleChange('driverBata', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono font-medium"
                  />
                </div>

                {/* Toll, Parking, Permit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Tolls / Parking / Permits ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    id="input-toll-parking"
                    value={formData.tollParkingPermit ?? ''}
                    onChange={(e) => handleChange('tollParkingPermit', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono font-medium"
                  />
                </div>

                {/* Other Charges */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Other Trip Charges ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    id="input-other-charges"
                    value={formData.otherCharges ?? ''}
                    onChange={(e) => handleChange('otherCharges', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono font-medium"
                  />
                </div>

                {/* Adjustment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Adjustment (+ / -)</span>
                    <span className="text-[10px] text-slate-400 normal-case">Round off</span>
                  </label>
                  <input
                    type="number"
                    id="input-adjustment"
                    placeholder="0"
                    value={formData.adjustment ?? ''}
                    onChange={(e) => handleChange('adjustment', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono font-medium"
                  />
                </div>

                {/* Advance Received */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 text-blue-900 font-bold">
                    Advance Received ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    id="input-advance-received"
                    value={formData.advanceReceived ?? ''}
                    onChange={(e) => handleChange('advanceReceived', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-blue-50/40 border border-blue-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono font-bold text-blue-900"
                  />
                </div>
              </div>

              {/* Payment Mode & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Advance Payment Mode
                  </label>
                  <select
                    id="select-payment-mode"
                    value={formData.paymentMode || 'Cash'}
                    onChange={(e) => handleChange('paymentMode', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Bank Transfer">Net Banking / Transfer</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Trip Remarks / Customer Notes
                  </label>
                  <input
                    type="text"
                    id="input-remarks"
                    placeholder="e.g. Standard tour package, Houseboat drop, Sightseeing included"
                    value={formData.remarks || ''}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar: Real-time Invoice Summary & Action Buttons (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Calculation Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm sticky top-20">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <span style={{ fontFamily: 'DM Sans, sans-serif' }} className="uppercase tracking-wider text-xs">Summary Breakdown</span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold border border-slate-200">
                    {formData.billNo || nextBillNo}
                  </span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">LIVE</span>
              </div>

              {/* Itemized list */}
              <div className="space-y-2 text-xs pb-4 mb-4 border-b border-slate-100">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Vehicle Hire ({durationInfo.durationText})</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatCurrency(calculations.vehicleHire, currency)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center space-x-1">
                    <span>Extra Distance ({formatNumber(calculations.additionalKm)} km)</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatCurrency(calculations.additionalKmAmount, currency)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Driver Bata / Allowance</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatCurrency(formData.driverBata || 0, currency)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Tolls, Parking & Permits</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatCurrency(formData.tollParkingPermit || 0, currency)}
                  </span>
                </div>

                {Boolean(formData.otherCharges) && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Other Charges</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatCurrency(formData.otherCharges || 0, currency)}
                    </span>
                  </div>
                )}

                {Boolean(formData.adjustment) && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Adjustment</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatCurrency(formData.adjustment || 0, currency)}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-center font-bold text-slate-900 text-sm">
                  <span>Gross Total</span>
                  <span className="font-mono">
                    {formatCurrency(calculations.totalAmount, currency)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Less: Advance Paid ({formData.paymentMode})</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    - {formatCurrency(formData.advanceReceived || 0, currency)}
                  </span>
                </div>
              </div>

              {/* Prominent Balance Due Banner */}
              <div className="p-4 rounded-lg mb-5 bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  {calculations.balanceAmount <= 0 ? 'Payment Status' : 'Total Due from Customer'}
                </span>
                <div className="text-2xl font-black font-mono tracking-tight text-blue-600">
                  {formatCurrency(Math.max(0, calculations.balanceAmount), currency)}
                </div>
                <div className="mt-1 flex items-center justify-center space-x-1 text-xs font-semibold">
                  {calculations.balanceAmount <= 0 ? (
                    <span className="text-emerald-700 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Paid in Full
                    </span>
                  ) : (
                    <span className="text-amber-800 flex items-center">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />
                      Payable upon trip drop
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="space-y-2.5">
                <button
                  type="submit"
                  id="btn-preview-invoice"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Sync & Preview Invoice</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  id="btn-save-and-whatsapp"
                  onClick={handleSaveAndWhatsApp}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-sm shadow-emerald-500/10"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Save & Share via WhatsApp</span>
                </button>

                <button
                  type="button"
                  id="btn-save-trip-quick"
                  onClick={(e) => handleSubmit(e, false)}
                  className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save Record Only (No Preview)</span>
                </button>
              </div>

              {/* Assurance info */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Travel Care Trip Billing</span>
              </div>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
};
