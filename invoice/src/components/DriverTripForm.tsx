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
  Navigation,
  Plus,
  X,
  BookmarkPlus,
  Check
} from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';

interface DriverTripFormProps {
  initialTrip?: TripRecord | null;
  onSaveTrip: (trip: TripRecord, navigateToInvoice?: boolean) => void;
  companySettings: CompanySettings;
  existingTrips?: TripRecord[];
  nextBillNo: string;
}

export const DriverTripForm: React.FC<DriverTripFormProps> = ({
  initialTrip,
  onSaveTrip,
  companySettings,
  existingTrips = [],
  nextBillNo
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // User-entered and learned custom circuits
  const [customCircuits, setCustomCircuits] = useState<Array<{ id: string; route: string; estKm?: number; count: number; lastUsed?: string }>>(() => {
    try {
      const saved = localStorage.getItem('tc_user_circuits_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load custom circuits', e);
    }
    return [];
  });

  const [hiddenCircuits, setHiddenCircuits] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tc_hidden_circuits_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load hidden circuits', e);
    }
    return [];
  });

  const [showAddPreset, setShowAddPreset] = useState<boolean>(false);
  const [newPresetRoute, setNewPresetRoute] = useState<string>('');
  const [newPresetKm, setNewPresetKm] = useState<string>('');
  const [savedPresetFeedback, setSavedPresetFeedback] = useState<boolean>(false);

  // Persist custom circuits & hidden circuits to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tc_user_circuits_v1', JSON.stringify(customCircuits));
    } catch (e) {
      console.error('Failed to save custom circuits', e);
    }
  }, [customCircuits]);

  useEffect(() => {
    try {
      localStorage.setItem('tc_hidden_circuits_v1', JSON.stringify(hiddenCircuits));
    } catch (e) {
      console.error('Failed to save hidden circuits', e);
    }
  }, [hiddenCircuits]);

  // Compute common circuit presets dynamically from entered trips and custom saved entries
  const commonCircuitPresets = useMemo(() => {
    const routeMap = new Map<string, { route: string; count: number; totalKm: number; kmCount: number; lastUsed: string; isCustom: boolean }>();
    const hiddenSet = new Set(hiddenCircuits.map(h => h.trim().toLowerCase()));

    const normalize = (r: string) => r.trim().toLowerCase().replace(/\s+/g, ' ');

    // 1. Process trips entered by user (existingTrips)
    existingTrips.forEach(t => {
      const raw = t.tripRoute?.trim();
      if (!raw || raw.length < 3) return;
      const key = normalize(raw);
      if (key === 'local / outstation trip' || hiddenSet.has(key)) return;

      const tripKm = (t.closingKm && t.startingKm && t.closingKm > t.startingKm)
        ? t.closingKm - t.startingKm
        : (t.totalKm || 0);

      const existing = routeMap.get(key);
      if (existing) {
        existing.count += 1;
        if (tripKm > 0) {
          existing.totalKm += tripKm;
          existing.kmCount += 1;
        }
        if (t.dateOfTrip && t.dateOfTrip > existing.lastUsed) {
          existing.lastUsed = t.dateOfTrip;
        }
      } else {
        routeMap.set(key, {
          route: raw,
          count: 1,
          totalKm: tripKm > 0 ? tripKm : 0,
          kmCount: tripKm > 0 ? 1 : 0,
          lastUsed: t.dateOfTrip || t.timestamp || '',
          isCustom: false
        });
      }
    });

    // 2. Process user entered / saved presets
    customCircuits.forEach(c => {
      const raw = c.route?.trim();
      if (!raw || raw.length < 3) return;
      const key = normalize(raw);
      if (hiddenSet.has(key)) return;

      const existing = routeMap.get(key);
      if (existing) {
        existing.count += (c.count || 1);
        if (c.estKm && c.estKm > 0) {
          existing.totalKm += c.estKm;
          existing.kmCount += 1;
        }
        existing.isCustom = true;
      } else {
        routeMap.set(key, {
          route: raw,
          count: c.count || 1,
          totalKm: (c.estKm && c.estKm > 0) ? c.estKm : 0,
          kmCount: (c.estKm && c.estKm > 0) ? 1 : 0,
          lastUsed: c.lastUsed || '',
          isCustom: true
        });
      }
    });

    const list = Array.from(routeMap.values()).map(item => ({
      route: item.route,
      count: item.count,
      avgKm: item.kmCount > 0 ? Math.round(item.totalKm / item.kmCount) : undefined,
      lastUsed: item.lastUsed,
      isCustom: item.isCustom
    }));

    // Rank: most common (frequent) trips first, then most recently used
    list.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.lastUsed.localeCompare(a.lastUsed);
    });

    return list;
  }, [existingTrips, customCircuits, hiddenCircuits]);

  const handleSaveCurrentRouteAsPreset = () => {
    const route = formData.tripRoute?.trim();
    if (!route || route.length < 3) return;

    const estKm = (formData.closingKm && formData.startingKm && formData.closingKm > formData.startingKm)
      ? formData.closingKm - formData.startingKm
      : undefined;

    const norm = route.toLowerCase();
    setHiddenCircuits(prev => prev.filter(h => h.trim().toLowerCase() !== norm));

    setCustomCircuits(prev => {
      const existing = prev.find(p => p.route.trim().toLowerCase() === norm);
      if (existing) {
        return prev.map(p => p.route.trim().toLowerCase() === norm ? {
          ...p,
          count: p.count + 1,
          estKm: estKm || p.estKm,
          lastUsed: new Date().toISOString()
        } : p);
      }
      return [
        {
          id: `circuit-${Date.now()}`,
          route,
          estKm,
          count: 1,
          lastUsed: new Date().toISOString()
        },
        ...prev
      ];
    });

    setSavedPresetFeedback(true);
    setTimeout(() => setSavedPresetFeedback(false), 2200);
  };

  const handleAddNewCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    const route = newPresetRoute.trim();
    if (!route || route.length < 2) return;

    const km = parseFloat(newPresetKm) || undefined;
    const norm = route.toLowerCase();
    setHiddenCircuits(prev => prev.filter(h => h.trim().toLowerCase() !== norm));

    setCustomCircuits(prev => {
      const existing = prev.find(p => p.route.trim().toLowerCase() === norm);
      if (existing) {
        return prev.map(p => p.route.trim().toLowerCase() === norm ? {
          ...p,
          estKm: km || p.estKm,
          lastUsed: new Date().toISOString()
        } : p);
      }
      return [
        {
          id: `circuit-${Date.now()}`,
          route,
          estKm: km,
          count: 1,
          lastUsed: new Date().toISOString()
        },
        ...prev
      ];
    });

    setNewPresetRoute('');
    setNewPresetKm('');
    setShowAddPreset(false);
  };

  const handleDeletePreset = (routeToDelete: string) => {
    const norm = routeToDelete.trim().toLowerCase();
    setHiddenCircuits(prev => [...prev.filter(h => h.trim().toLowerCase() !== norm), routeToDelete.trim()]);
    setCustomCircuits(prev => prev.filter(p => p.route.trim().toLowerCase() !== norm));
  };

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

  const learnTripRoute = (routeStr?: string, startKm?: number, closeKm?: number, calcTotalKm?: number) => {
    const raw = routeStr?.trim();
    if (!raw || raw.length < 3 || raw.toLowerCase() === 'local / outstation trip') return;
    const tripKm = (closeKm && startKm && closeKm > startKm)
      ? closeKm - startKm
      : (calcTotalKm || 0);

    const norm = raw.toLowerCase();
    setHiddenCircuits(prev => prev.filter(h => h.trim().toLowerCase() !== norm));
    setCustomCircuits(prev => {
      const existing = prev.find(p => p.route.trim().toLowerCase() === norm);
      if (existing) {
        return prev.map(p => p.route.trim().toLowerCase() === norm ? {
          ...p,
          count: (p.count || 1) + 1,
          estKm: tripKm > 0 ? tripKm : p.estKm,
          lastUsed: new Date().toISOString()
        } : p);
      }
      return [
        {
          id: `circuit-${Date.now()}`,
          route: raw,
          estKm: tripKm > 0 ? tripKm : undefined,
          count: 1,
          lastUsed: new Date().toISOString()
        },
        ...prev
      ];
    });
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

    learnTripRoute(fullTrip.tripRoute, fullTrip.startingKm, fullTrip.closingKm, fullTrip.totalKm);
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

    learnTripRoute(fullTrip.tripRoute, fullTrip.startingKm, fullTrip.closingKm, fullTrip.totalKm);
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Trip / Route Description *
                  </label>
                  <div className="flex items-center gap-2">
                    {savedPresetFeedback && (
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 animate-pulse">
                        <Check className="w-3 h-3" />
                        Preset saved!
                      </span>
                    )}
                    {formData.tripRoute && formData.tripRoute.trim().length > 3 && !savedPresetFeedback && (
                      <button
                        type="button"
                        onClick={handleSaveCurrentRouteAsPreset}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        title="Save this route to your circuit presets"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Save as Preset</span>
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  required
                  id="input-trip-route"
                  placeholder="e.g. Munnar - Thekkady - Alleppey - Kochi"
                  value={formData.tripRoute || ''}
                  onChange={(e) => handleChange('tripRoute', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium mb-2.5"
                />

                {/* Common Circuit Presets (learned from user entered trips) */}
                {commonCircuitPresets.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-blue-600" />
                        <span>Common Circuit Presets:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddPreset(!showAddPreset)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 cursor-pointer"
                        title="Add a custom circuit preset"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Circuit</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {commonCircuitPresets.map((preset, i) => (
                        <div
                          key={i}
                          className="group inline-flex items-center rounded-md bg-blue-50/80 hover:bg-blue-100 text-blue-900 border border-blue-200/70 transition-colors shadow-2xs overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              handleChange('tripRoute', preset.route);
                              if (preset.avgKm && preset.avgKm > 0) {
                                const start = formData.startingKm || 0;
                                handleChange('closingKm', start + preset.avgKm);
                              }
                            }}
                            className="text-[11px] px-2.5 py-1 font-medium cursor-pointer flex items-center gap-1.5 text-left"
                            title={`Apply ${preset.route}${preset.avgKm ? ` (~${preset.avgKm} KM)` : ''}`}
                          >
                            <Navigation className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>{preset.route}</span>
                            {preset.avgKm && (
                              <span className="text-[10px] text-blue-700/80 font-mono font-semibold">
                                ~{preset.avgKm}km
                              </span>
                            )}
                            {preset.count > 1 && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-blue-200/80 text-blue-800 font-semibold">
                                {preset.count}x
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePreset(preset.route);
                            }}
                            className="px-1.5 py-1 text-blue-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove this circuit preset"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">
                      Circuit presets will appear here automatically from your entered trips.
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddPreset(!showAddPreset)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add First Preset</span>
                    </button>
                  </div>
                )}

                {/* Inline Add Preset Form */}
                {showAddPreset && (
                  <div className="mt-2.5 p-3 bg-blue-50/60 rounded-lg border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-blue-600" />
                        Add New Circuit Preset
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddPreset(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Circuit route, e.g. Cochin - Munnar - Thekkady"
                          value={newPresetRoute}
                          onChange={(e) => setNewPresetRoute(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Est. KM (optional)"
                          value={newPresetKm}
                          onChange={(e) => setNewPresetKm(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddPreset(false)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddNewCustomPreset}
                        disabled={!newPresetRoute.trim()}
                        className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Save Preset
                      </button>
                    </div>
                  </div>
                )}
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
                  <CustomDropdown
                    id="select-vehicle-type"
                    value={formData.vehicleType || 'Sedan'}
                    onChange={(val) => handleVehicleTypeChange(String(val))}
                    options={vehiclePresets.map((vp) => ({
                      value: vp.type,
                      label: vp.type,
                      sublabel: `₹${vp.defaultRatePerKm}/km • ₹${vp.defaultDailyRate}/day`,
                    }))}
                  />
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
                  <div className="text-[10px] text-slate-400 mt-1.5 min-h-[22px] flex items-center">
                    Start odometer reading
                  </div>
                </div>

                {/* Closing KM */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Closing KM *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    id="input-closing-km"
                    value={formData.closingKm || ''}
                    onChange={(e) => handleChange('closingKm', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono font-semibold"
                  />
                  {/* Quick Add KM shortcuts placed cleanly below input to preserve mobile alignment */}
                  <div className="flex items-center gap-1 mt-1.5 min-h-[22px]">
                    <span className="text-[10px] text-slate-400 font-medium mr-0.5">Quick add:</span>
                    {[50, 100, 250].map(addKm => (
                      <button
                        key={addKm}
                        type="button"
                        onClick={() => {
                          const start = formData.startingKm || 0;
                          handleChange('closingKm', (formData.closingKm && formData.closingKm > start ? formData.closingKm : start) + addKm);
                        }}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 transition-colors cursor-pointer active:scale-95"
                        title={`Add +${addKm} KM to odometer`}
                      >
                        +{addKm}
                      </button>
                    ))}
                  </div>
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
                  <div className="text-[10px] text-slate-400 mt-1.5 min-h-[22px] flex items-center">
                    Package allowance
                  </div>
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
                  <div className="text-[10px] text-slate-400 mt-1.5 min-h-[22px] flex items-center">
                    Beyond package limit
                  </div>
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
                  <CustomDropdown
                    id="select-payment-mode"
                    value={formData.paymentMode || 'Cash'}
                    onChange={(val) => handleChange('paymentMode', String(val))}
                    options={[
                      { value: 'Cash', label: 'Cash', sublabel: 'Cash collected by driver' },
                      { value: 'UPI', label: 'UPI', sublabel: 'GPay / PhonePe / Paytm' },
                      { value: 'Card', label: 'Card', sublabel: 'Credit / Debit Card' },
                      { value: 'Bank Transfer', label: 'Bank Transfer', sublabel: 'Direct NEFT / IMPS' },
                    ]}
                  />
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
