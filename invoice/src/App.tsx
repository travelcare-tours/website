import React, { useState, useEffect } from 'react';
import { TripRecord, CompanySettings, ViewMode } from './types';
import { sampleTrips, defaultCompanySettings } from './data/initialData';
import { generateNextBillNo, convertTripsToCsv, decodeTripFromUrl } from './utils/calculations';
import { Navbar } from './components/Navbar';
import { DriverTripForm } from './components/DriverTripForm';
import { InvoiceView } from './components/InvoiceView';
import { TripHistory } from './components/TripHistory';
import { AnalyticsView } from './components/AnalyticsView';
import { CompanySettingsModal } from './components/CompanySettingsModal';
import { GuestPortalView } from './components/GuestPortalView';
import { PinLockScreen } from './components/PinLockScreen';
import { StaffWorkspaceHub } from './components/StaffWorkspaceHub';

export default function App() {
  // Staff Authentication PIN (2030) State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('tc_staff_pin_authorized') === 'true' ||
        sessionStorage.getItem('tc_staff_pin_authorized') === 'true'
      );
    } catch {
      return false;
    }
  });

  // Active Staff Workspace Module ('hub' chooser vs 'invoice' system)
  const [activeModule, setActiveModule] = useState<'hub' | 'invoice'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('module') === 'invoice' || 
        params.get('view') === 'invoice' ||
        params.get('app') === 'invoice' ||
        params.has('b') || 
        params.has('bill') || 
        params.has('d')
      ) {
        return 'invoice';
      }
    } catch {}
    return 'hub';
  });

  // Local storage loaded state
  const [trips, setTrips] = useState<TripRecord[]>(() => {
    try {
      const saved = localStorage.getItem('tc_invoices_trips');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load trips from local storage', e);
    }
    return sampleTrips;
  });

  const [archivedTrips, setArchivedTrips] = useState<TripRecord[]>(() => {
    try {
      const saved = localStorage.getItem('tc_invoices_archived_trips');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load archived trips from local storage', e);
    }
    return [];
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem('tc_company_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it was previous placeholder/dev email, update to new official company email
        if (parsed.email === 'hashimhassan2@gmail.com') {
          parsed.email = 'travelcare598@gmail.com';
        }
        // Update to accurate address from website footer if old or default
        if (!parsed.address || parsed.address.includes('Nedumbassery') || parsed.address.includes('Airport Road')) {
          parsed.address = 'Ground Flr, Mannath Bld, 36/267. Seaport-Airport Rd, Thrikkakara Ernakulam, Kerala';
        }
        // Update phone to 91435 43444 if old or default
        if (!parsed.phone || parsed.phone.includes('98470')) {
          parsed.phone = '+91 91435 43444';
        }
        if (!parsed.website) {
          parsed.website = 'travelcaretours.in';
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load company settings from local storage', e);
    }
    return defaultCompanySettings;
  });

  const [currentView, setCurrentView] = useState<ViewMode>('create');
  const [selectedTrip, setSelectedTrip] = useState<TripRecord | null>(trips[0] || null);
  const [editingTrip, setEditingTrip] = useState<TripRecord | null>(null);
  const [guestPortalTrip, setGuestPortalTrip] = useState<TripRecord | null>(null);

  // Check URL query params on startup for direct Guest Invoice Links (?b=... or ?d=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const encodedData = params.get('d') || params.get('data');
      const invoiceNo = params.get('b') || params.get('bill') || params.get('invoice');

      if (encodedData) {
        const decoded = decodeTripFromUrl(encodedData);
        if (decoded) {
          setGuestPortalTrip(decoded);
          setSelectedTrip(decoded);
          return;
        }
      }

      if (invoiceNo) {
        const match = trips.find(t => t.billNo.toLowerCase() === invoiceNo.toLowerCase());
        if (match) {
          setGuestPortalTrip(match);
          setSelectedTrip(match);
        }
      }
    } catch (e) {
      console.error('Error parsing guest link params', e);
    }
  }, [trips]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('tc_invoices_trips', JSON.stringify(trips));
    } catch (e) {
      console.error('Failed to save trips to local storage', e);
    }
  }, [trips]);

  useEffect(() => {
    try {
      localStorage.setItem('tc_invoices_archived_trips', JSON.stringify(archivedTrips));
    } catch (e) {
      console.error('Failed to save archived trips to local storage', e);
    }
  }, [archivedTrips]);

  useEffect(() => {
    try {
      localStorage.setItem('tc_company_settings', JSON.stringify(companySettings));
    } catch (e) {
      console.error('Failed to save settings to local storage', e);
    }
  }, [companySettings]);

  // Next bill number calculation
  const nextBillNo = generateNextBillNo(trips, companySettings.invoicePrefix || 'TC-');

  // Handle Save Trip
  const handleSaveTrip = (savedTrip: TripRecord, navigateToInvoice: boolean = true) => {
    setTrips((prevTrips) => {
      const index = prevTrips.findIndex((t) => t.id === savedTrip.id || t.billNo === savedTrip.billNo);
      if (index >= 0) {
        const updated = [...prevTrips];
        updated[index] = savedTrip;
        return updated;
      } else {
        return [savedTrip, ...prevTrips];
      }
    });

    setSelectedTrip(savedTrip);
    setEditingTrip(null);

    // If Google Sheet webhook is connected, sync silently (optional)
    if (companySettings.googleSheetWebhookUrl) {
      fetch(companySettings.googleSheetWebhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_trip', trip: savedTrip }),
      }).catch(err => console.error('Silent webhook sync error', err));
    }

    if (navigateToInvoice) {
      setCurrentView('invoice');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle Edit Trip
  const handleEditTrip = (trip: TripRecord) => {
    setEditingTrip(trip);
    setCurrentView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Delete Trip (Safely Moves to Archive)
  const handleDeleteTrip = (tripId: string) => {
    const tripToArchive = trips.find(t => t.id === tripId);
    if (!tripToArchive) return;

    if (confirm(`Move bill "${tripToArchive.billNo}" (${tripToArchive.customerName}) to Archive? You can restore it anytime from the Archive section.`)) {
      const archivedRecord: TripRecord = {
        ...tripToArchive,
        archivedAt: new Date().toISOString(),
      };

      setArchivedTrips(prev => [archivedRecord, ...prev]);
      setTrips(prev => prev.filter(t => t.id !== tripId));

      if (selectedTrip?.id === tripId) {
        setSelectedTrip(null);
      }
    }
  };

  // Handle Restore Trip from Archive
  const handleRestoreTrip = (tripId: string) => {
    const tripToRestore = archivedTrips.find(t => t.id === tripId);
    if (!tripToRestore) return;

    setTrips(prev => [tripToRestore, ...prev]);
    setArchivedTrips(prev => prev.filter(t => t.id !== tripId));
  };

  // Handle Permanent Delete from Archive
  const handlePermanentDeleteTrip = (tripId: string) => {
    if (confirm('Permanently delete this invoice from the Archive? This action cannot be undone.')) {
      setArchivedTrips(prev => prev.filter(t => t.id !== tripId));
      if (selectedTrip?.id === tripId) {
        setSelectedTrip(null);
      }
    }
  };

  // Handle Payment Settlement / Ledger Balancing
  const handleSaveSettlement = (updatedTrip: TripRecord) => {
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
    if (selectedTrip?.id === updatedTrip.id) {
      setSelectedTrip(updatedTrip);
    }

    // If Google Sheet webhook is connected, sync the settlement update (optional)
    if (companySettings.googleSheetWebhookUrl) {
      fetch(companySettings.googleSheetWebhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_trip', trip: updatedTrip }),
      }).catch(err => console.error('Silent webhook sync error on settlement', err));
    }
  };

  // Handle Full Data Restore
  const handleRestoreFullData = (
    active: TripRecord[], 
    archived: TripRecord[], 
    newSettings?: CompanySettings
  ) => {
    if (active.length > 0) setTrips(active);
    if (archived.length > 0) setArchivedTrips(archived);
    if (newSettings) setCompanySettings(newSettings);
    if (active.length > 0) setSelectedTrip(active[0]);
  };

  // Handle Select Trip for View
  const handleSelectTrip = (trip: TripRecord) => {
    setSelectedTrip(trip);
    setCurrentView('invoice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle New Trip Form Click
  const handleNewTrip = () => {
    setEditingTrip(null);
    setCurrentView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Import CSV Trips
  const handleImportTrips = (newTrips: TripRecord[]) => {
    setTrips((prev) => [...newTrips, ...prev]);
  };

  // Handle CSV Export
  const handleExportCsv = () => {
    const csvContent = convertTripsToCsv(trips);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TC_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Staff PIN Unlock
  const handleUnlock = (remember: boolean) => {
    try {
      sessionStorage.setItem('tc_staff_pin_authorized', 'true');
      if (remember) {
        localStorage.setItem('tc_staff_pin_authorized', 'true');
      } else {
        localStorage.removeItem('tc_staff_pin_authorized');
      }
    } catch (e) {
      console.error('Storage error saving auth state', e);
    }
    setIsAuthenticated(true);
    setActiveModule('hub');
  };

  // Handle Staff PIN Lock / Logout
  const handleLock = () => {
    try {
      localStorage.removeItem('tc_staff_pin_authorized');
      sessionStorage.removeItem('tc_staff_pin_authorized');
    } catch (e) {
      console.error('Storage error clearing auth state', e);
    }
    setIsAuthenticated(false);
    setActiveModule('hub');
  };

  // If opened via a direct Guest Share URL or user clicked preview guest mode
  if (guestPortalTrip) {
    return (
      <GuestPortalView
        trip={guestPortalTrip}
        companySettings={companySettings}
        onExitGuestMode={() => {
          setGuestPortalTrip(null);
          // Clear query params from browser URL cleanly without reload
          if (window.history && window.history.replaceState) {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }}
      />
    );
  }

  // Gate staff dashboard with PIN 2030 Lock Screen
  if (!isAuthenticated) {
    return (
      <PinLockScreen
        onUnlock={handleUnlock}
        companyName={companySettings.companyName}
      />
    );
  }

  // Staff Chooser Landing Page: 2 Minimal Cards (Invoice & Billing, Itinerary Planner)
  if (activeModule === 'hub') {
    return (
      <StaffWorkspaceHub
        onOpenInvoice={() => {
          setActiveModule('invoice');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLock={handleLock}
        companyName={companySettings.companyName}
        totalTripsCount={trips.length}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          if (view === 'create' && currentView !== 'create') {
            setEditingTrip(null);
          }
          setCurrentView(view);
        }}
        selectedTrip={selectedTrip}
        totalTripsCount={trips.length}
        onExportCsv={handleExportCsv}
        onLock={handleLock}
        onReturnToHub={() => {
          setActiveModule('hub');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Areas */}
      <main className="flex-1 pb-6">
        {currentView === 'create' && (
          <DriverTripForm
            initialTrip={editingTrip}
            onSaveTrip={handleSaveTrip}
            companySettings={companySettings}
            existingTrips={trips}
            nextBillNo={editingTrip?.billNo || nextBillNo}
          />
        )}

        {currentView === 'invoice' && selectedTrip && (
          <InvoiceView
            trip={selectedTrip}
            companySettings={companySettings}
            onEditTrip={handleEditTrip}
            onBackToNewTrip={handleNewTrip}
          />
        )}

        {currentView === 'history' && (
          <TripHistory
            trips={trips}
            archivedTrips={archivedTrips}
            companySettings={companySettings}
            onSelectTrip={handleSelectTrip}
            onEditTrip={handleEditTrip}
            onDeleteTrip={handleDeleteTrip}
            onRestoreTrip={handleRestoreTrip}
            onPermanentDeleteTrip={handlePermanentDeleteTrip}
            onSaveSettlement={handleSaveSettlement}
            onSaveSettings={(newSettings) => setCompanySettings(newSettings)}
            onNewTrip={handleNewTrip}
            onImportTrips={handleImportTrips}
            onRestoreData={handleRestoreFullData}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsView
            trips={trips}
            companySettings={companySettings}
            onSelectTrip={handleSelectTrip}
          />
        )}

        {currentView === 'settings' && (
          <CompanySettingsModal
            settings={companySettings}
            onSaveSettings={(newSettings) => {
              setCompanySettings(newSettings);
              setCurrentView('create');
            }}
            onClose={() => setCurrentView('create')}
          />
        )}
      </main>

      {/* Professional Polish Status Footer */}
      <footer className="no-print bg-white border-t border-slate-200 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-2.5 text-xs text-slate-500 shadow-xs">
        <div className="flex items-center gap-2 font-medium text-slate-600">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span>Auto-save: <span className="text-emerald-700 font-semibold">Active (Local & State)</span></span>
        </div>

        <div className="flex items-center gap-2.5 text-slate-500">
          <span className="font-medium">© {new Date().getFullYear()} {companySettings.companyName}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400">DriveBill Pro System</span>
        </div>
      </footer>
    </div>
  );
}
