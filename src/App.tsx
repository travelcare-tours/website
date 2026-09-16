import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PackagesSection } from './components/PackagesSection';
import { DestinationsGrid } from './components/DestinationsGrid';
import { ServicesSection } from './components/ServicesSection';
import { TripCalculator } from './components/TripCalculator';
import { WhyUs } from './components/WhyUs';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { ItineraryModal } from './components/ItineraryModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { MobileActionDock } from './components/MobileActionDock';
import { NotFound } from './components/NotFound';
import { TourPackage } from './types';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });
  const [selectedPackage, setSelectedPackage] = useState<string>('Not decided yet');
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([
    'Munnar',
    'Thekkady',
    'Alleppey',
  ]);
  const [activeModalPackage, setActiveModalPackage] = useState<TourPackage | null>(null);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = (sectionId?: string) => {
    window.history.pushState({}, '', sectionId ? `/#${sectionId}` : '/');
    setCurrentPath('/');
    if (sectionId) {
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleDestination = (destName: string) => {
    setSelectedDestinations((prev) => {
      if (prev.includes(destName)) {
        return prev.filter((d) => d !== destName);
      } else {
        return [...prev, destName];
      }
    });
  };

  const handleSelectDestination = (destName: string) => {
    if (!selectedDestinations.includes(destName)) {
      setSelectedDestinations((prev) => [...prev, destName]);
    }
    if (currentPath !== '/' && currentPath !== '' && currentPath !== '/index.html') {
      handleNavigateHome('trip-planner');
    } else {
      scrollToSection('trip-planner');
    }
  };

  const handleSelectPackageForEnquiry = (pkgTitle: string) => {
    setSelectedPackage(pkgTitle);
    if (currentPath !== '/' && currentPath !== '' && currentPath !== '/index.html') {
      handleNavigateHome('trip-planner');
    } else {
      scrollToSection('trip-planner');
    }
  };

  // Determine if we should show the custom 404 page
  const isNotFound = currentPath !== '/' && currentPath !== '' && currentPath !== '/index.html';

  if (isNotFound) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
        <NotFound
          onNavigateHome={handleNavigateHome}
          onSelectDestination={handleSelectDestination}
        />
        <FloatingWhatsApp />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 pb-16 sm:pb-0">
      {/* Top Header */}
      <Header
        onPlanTripClick={() => scrollToSection('trip-planner')}
        onNavigateHome={handleNavigateHome}
      />

      {/* Main Sections */}
      <main className="flex-1">
        {/* 1. Hero with Scenic Kerala Background Slideshow */}
        <Hero
          onPlanTripClick={() => scrollToSection('trip-planner')}
          onExplorePackagesClick={() => scrollToSection('packages')}
        />

        {/* 2. Tour Packages Grid with Filters */}
        <PackagesSection
          onViewItinerary={(pkg) => setActiveModalPackage(pkg)}
          onSelectPackageForEnquiry={handleSelectPackageForEnquiry}
          onCustomTripClick={() => scrollToSection('trip-planner')}
        />

        {/* 3. All Kerala Destinations Showcase */}
        <DestinationsGrid
          onSelectDestination={handleSelectDestination}
          selectedDestinations={selectedDestinations}
        />

        {/* 4. Standalone Services: Cab Services, Hotel & Houseboat Booking */}
        <ServicesSection onPlanTripClick={() => scrollToSection('trip-planner')} />

        {/* 5. Interactive Instant Trip Planner & WhatsApp Quote */}
        <TripCalculator
          selectedDests={selectedDestinations}
          onToggleDest={handleToggleDestination}
          selectedPackageTitle={selectedPackage}
        />

        {/* 5. Why Choose Travel Care Tours */}
        <WhyUs />

        {/* 6. Frequently Asked Questions */}
        <FaqSection />
      </main>

      {/* Minimalist Brand Footer */}
      <Footer
        onNavigate={navigateTo}
        onNavigateSection={(sectionId) => scrollToSection(sectionId)}
      />

      {/* Day-by-Day Itinerary Modal */}
      <ItineraryModal
        pkg={activeModalPackage}
        onClose={() => setActiveModalPackage(null)}
        onBookNow={handleSelectPackageForEnquiry}
      />

      {/* Floating WhatsApp Quick Connect Button for Tablets & Desktop */}
      <FloatingWhatsApp />

      {/* Mobile Sticky Action Dock (Call, Plan Trip, WhatsApp) */}
      <MobileActionDock onPlanTripClick={() => scrollToSection('trip-planner')} />
    </div>
  );
}
