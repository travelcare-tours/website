import React, { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/travelData';
import { WhatsAppIcon } from './WhatsAppIcon';

interface HeaderProps {
  onPlanTripClick?: () => void;
  onNavigateHome?: (sectionId?: string) => void;
  onOpenFullscreenIntro?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onPlanTripClick, 
  onNavigateHome,
  onOpenFullscreenIntro 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const baseUrl = (import.meta.env.BASE_URL || './').replace(/\/$/, '');
  const horizontalLogoSrc = `${baseUrl}/assets/TC_logo_horizontal.png`;
  const whiteLogoSrc = `${baseUrl}/assets/TC_logo_footer.png`;

  useEffect(() => {
    const handleScroll = () => {
      // Trigger floating nav when user scrolls past 80px
      const scrolled = window.scrollY > 80;
      setIsScrolled(scrolled);
      if (!scrolled) {
        setMobileMenuOpen(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (onNavigateHome) {
      onNavigateHome(sectionId);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-500">
      <div
        className={`mx-auto transition-all duration-500 ease-out pointer-events-auto ${
          isScrolled
            ? `mt-3 sm:mt-4 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2.5rem)] max-w-5xl bg-white/95 backdrop-blur-md border border-solid border-slate-200/80 shadow-lg shadow-slate-900/10 ${
                mobileMenuOpen
                  ? 'rounded-[20px] sm:rounded-[28px]'
                  : 'rounded-[18px] sm:rounded-[40px]'
              } px-4 sm:px-6 py-2 sm:py-2`
            : 'mt-0 w-full max-w-7xl bg-transparent border-transparent shadow-none px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo with Smooth Cross-Fade Transition */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, 'home')}
            className="flex items-center group focus:outline-hidden py-1"
            aria-label="Travel Care Tours Home"
          >
            <div
              className={`relative transition-all duration-500 flex items-center ${
                isScrolled
                  ? 'w-[140px] sm:w-[160px] h-[44px] sm:h-[48px]'
                  : 'w-[180px] sm:w-[220px] h-[58px] sm:h-[70px]'
              }`}
            >
              {/* Clean White Logo (Visible at Hero / Top state) */}
              <img
                src={whiteLogoSrc}
                alt="Travel Care Tours"
                className={`absolute inset-0 w-full h-full sm:w-[220px] sm:h-[70px] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-all duration-500 ease-in-out ${
                  isScrolled
                    ? 'opacity-0 scale-95 pointer-events-none'
                    : 'opacity-100 scale-100'
                }`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('assets/TC_logo_footer.png')) {
                    target.src = `${baseUrl}/assets/TC_logo_footer.png`;
                  }
                }}
              />

              {/* Colorful Horizontal Logo (Comes alive in Floating Nav) */}
              <img
                src={horizontalLogoSrc}
                alt="Travel Care Tours"
                className={`absolute inset-0 w-full h-full object-contain transition-all duration-500 ease-in-out ${
                  isScrolled
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95 pointer-events-none'
                }`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('assets/TC_logo_horizontal.png')) {
                    target.src = `${baseUrl}/assets/TC_logo_horizontal.png`;
                  }
                }}
              />
            </div>
          </a>

          {/* Nav Links */}
          <nav
            className={`hidden md:flex items-center gap-5 lg:gap-7 text-[14px] font-medium transition-all duration-500 ${
              isScrolled
                ? 'opacity-100 translate-y-0 text-slate-700 pointer-events-auto'
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, 'home')}
              className="hidden lg:inline-block hover:text-brand-green transition-colors py-1"
            >
              Home
            </a>
            <a
              href="#packages"
              onClick={(e) => handleNavClick(e, 'packages')}
              className="hover:text-brand-green transition-colors py-1 font-medium"
            >
              Packages
            </a>
            <a
              href="#services"
              onClick={(e) => handleNavClick(e, 'services')}
              className="hover:text-brand-green transition-colors py-1 font-medium"
            >
              Cab Services
            </a>
            <a
              href="#destinations"
              onClick={(e) => handleNavClick(e, 'destinations')}
              className="hover:text-brand-green transition-colors py-1 font-medium"
            >
              Destinations
            </a>
            <a
              href="#trip-planner"
              onClick={(e) => handleNavClick(e, 'trip-planner')}
              className="hidden lg:inline-block hover:text-brand-green transition-colors py-1 font-semibold text-brand-navy"
            >
              Trip Planner
            </a>
            <a
              href="#why-us"
              onClick={(e) => handleNavClick(e, 'why-us')}
              className="hidden lg:inline-block hover:text-brand-green transition-colors py-1"
            >
              Why Us
            </a>
            <a
              href="#faqs"
              onClick={(e) => handleNavClick(e, 'faqs')}
              className="hidden lg:inline-block hover:text-brand-green transition-colors py-1"
            >
              FAQs
            </a>
            {onOpenFullscreenIntro && (
              <button
                type="button"
                onClick={onOpenFullscreenIntro}
                className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-brand-green hover:bg-brand-green hover:text-white transition-all border border-emerald-200 cursor-pointer"
              >
                <span>Brand Story</span>
              </button>
            )}
          </nav>

          {/* Right actions (Plan Trip & Menu toggle for Tablet/Mobile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Plan Trip Action */}
            <div
              className={`hidden sm:flex items-center transition-all duration-500 ${
                isScrolled
                  ? 'opacity-100 scale-100 pointer-events-auto'
                  : 'opacity-0 scale-95 pointer-events-none w-0 overflow-hidden'
              }`}
            >
              {onPlanTripClick && (
                <button
                  onClick={onPlanTripClick}
                  className="w-[105px] sm:w-[110px] h-[36px] sm:h-[38px] flex items-center justify-center rounded-full text-[13px] font-bold border-2 border-brand-green text-brand-green bg-transparent hover:bg-brand-green hover:text-white shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                >
                  Plan Trip
                </button>
              )}
            </div>

            {/* Menu toggle button for Mobile & Tablet (hidden on desktop lg) */}
            <div
              className={`flex lg:hidden items-center transition-all duration-500 ${
                isScrolled
                  ? 'opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none'
              }`}
            >
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full text-slate-700 hover:text-brand-navy hover:bg-slate-100 transition-colors cursor-pointer"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Dropdown Menu for Mobile & Tablet */}
        {isScrolled && mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 pb-2 border-t border-slate-200/80 space-y-1">
            <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-800">
              <a
                href="#home"
                onClick={(e) => handleNavClick(e, 'home')}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-brand-green transition-colors"
              >
                Home
              </a>
              {/* Only show Packages & Destinations in dropdown on mobile where they aren't on the bar */}
              <a
                href="#packages"
                onClick={(e) => handleNavClick(e, 'packages')}
                className="md:hidden px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-brand-green transition-colors"
              >
                Tour Packages
              </a>
              <a
                href="#services"
                onClick={(e) => handleNavClick(e, 'services')}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-brand-green transition-colors"
              >
                Cab, Hotel &amp; Houseboat Services
              </a>
              <a
                href="#destinations"
                onClick={(e) => handleNavClick(e, 'destinations')}
                className="md:hidden px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-brand-green transition-colors"
              >
                Kerala Destinations
              </a>
              <a
                href="#trip-planner"
                onClick={(e) => handleNavClick(e, 'trip-planner')}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-brand-green transition-colors"
              >
                Trip Planner
              </a>
              <a
                href="#why-us"
                onClick={(e) => handleNavClick(e, 'why-us')}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-brand-green transition-colors"
              >
                Why Travel Care
              </a>
              <a
                href="#faqs"
                onClick={(e) => handleNavClick(e, 'faqs')}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-brand-green transition-colors"
              >
                FAQs
              </a>
              {onOpenFullscreenIntro && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenFullscreenIntro();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-emerald-700 bg-emerald-50/90 hover:bg-emerald-100 font-semibold text-xs transition-colors flex items-center justify-between"
                >
                  <span>Watch Brand Intro Video</span>
                  <span className="text-[10px] bg-emerald-200/80 px-1.5 py-0.5 rounded text-emerald-900 font-bold">▶ PLAY</span>
                </button>
              )}
              {/* Contact Helpline & WhatsApp */}
              <div className="pt-2.5 mt-2 border-t border-slate-100 space-y-2">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Direct Helpline &amp; WhatsApp
                </p>
                <div className="grid grid-cols-2 gap-2 px-2">
                  <a
                    href={`tel:${COMPANY_DETAILS.phone.replace(/\s+/g, '')}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-brand-green" />
                    <span>Call Desk</span>
                  </a>
                  <a
                    href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-colors"
                  >
                    <WhatsAppIcon variant="white" className="w-3.5 h-3.5 fill-white shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                </div>
                <div className="px-3 text-[11px] text-slate-500 flex justify-between">
                  <span>{COMPANY_DETAILS.phone}</span>
                  <span>{COMPANY_DETAILS.phoneSecondary}</span>
                </div>
              </div>

              {/* On mobile, also provide a Plan Trip button inside dropdown */}
              <div className="sm:hidden pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onPlanTripClick?.();
                  }}
                  className="w-full py-2.5 rounded-xl text-center text-sm font-bold border-2 border-brand-green text-brand-green bg-transparent hover:bg-brand-green hover:text-white transition-colors"
                >
                  Plan Trip
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
