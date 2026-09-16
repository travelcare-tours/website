import React from 'react';
import { Phone, Mail, MapPin, Clock, ArrowUp } from 'lucide-react';
import { COMPANY_DETAILS, TOUR_PACKAGES } from '../data/travelData';
import { WhatsAppIcon } from './WhatsAppIcon';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onNavigateSection }) => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el && onNavigateSection) {
      e.preventDefault();
      onNavigateSection(sectionId);
    }
  };

  return (
    <footer className="bg-brand-navy-dark text-slate-300 pt-12 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: Brand Info & Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10">
          {/* Col 1: Brand Info & Trust Badges */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-block">
              <img
                src={`${(import.meta.env.BASE_URL || './').replace(/\/$/, '')}/assets/TC_logo_footer.png`}
                alt="Travel Care Tours"
                className="h-20 sm:h-24 md:h-26 w-auto max-h-32 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const step = Number(target.dataset.fallbackStep || '0');
                  if (step === 0) {
                    target.dataset.fallbackStep = '1';
                    target.src = './TC_logo_footer.png';
                  } else if (step === 1) {
                    target.dataset.fallbackStep = '2';
                    target.src = 'TC_logo_footer.png';
                  } else if (step === 2) {
                    target.dataset.fallbackStep = '3';
                    target.src = 'assets/TC_logo_footer.png';
                  }
                }}
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your Journey, Our Care. Licensed destination travel specialists crafting personalized Kerala holidays, backwater houseboats, and private chauffeur journeys across God's Own Country.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-3 space-y-3 text-xs sm:text-sm">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">
              Quick Links
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#packages" onClick={(e) => handleLinkClick(e, 'packages')} className="hover:text-brand-green-soft transition-colors">
                  Tour Packages
                </a>
              </li>
              <li>
                <a href="#destinations" onClick={(e) => handleLinkClick(e, 'destinations')} className="hover:text-brand-green-soft transition-colors">
                  Kerala Destinations
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => handleLinkClick(e, 'services')} className="hover:text-brand-green-soft transition-colors">
                  Cab, Hotel &amp; Houseboat Services
                </a>
              </li>
              <li>
                <a href="#trip-planner" onClick={(e) => handleLinkClick(e, 'trip-planner')} className="hover:text-brand-green-soft transition-colors">
                  Instant Trip Planner
                </a>
              </li>
              <li>
                <a href="#why-us" onClick={(e) => handleLinkClick(e, 'why-us')} className="hover:text-brand-green-soft transition-colors">
                  Why Travel Care
                </a>
              </li>
              <li>
                <a href="#faqs" onClick={(e) => handleLinkClick(e, 'faqs')} className="hover:text-brand-green-soft transition-colors">
                  FAQs &amp; Tips
                </a>
              </li>
              <li>
                <a
                  href="/404"
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate('/404');
                    }
                  }}
                  className="hover:text-brand-green-soft transition-colors inline-flex items-center gap-1 text-slate-500 hover:text-slate-300"
                >
                  <span>404 Error Page</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Packages */}
          <div className="lg:col-span-4 space-y-3 text-xs sm:text-sm">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">
              Popular Packages
            </h4>
            <ul className="space-y-2 text-slate-400">
              {TOUR_PACKAGES.slice(0, 4).map((pkg) => (
                <li key={pkg.id}>
                  <a
                    href="#packages"
                    className="hover:text-brand-green-soft transition-colors flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{pkg.title}</span>
                    <span className="text-[11px] text-slate-500 shrink-0 font-medium">{pkg.nights}N / {pkg.nights + 1}D</span>
                  </a>
                </li>
              ))}
              <li className="pt-1">
                <a href="#trip-planner" className="text-brand-green-soft font-semibold hover:underline text-xs">
                  + Custom Tailor-Made Itinerary →
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 1x3 Contact Information Grid (Single Row, 3 Columns on Tablet & Desktop) */}
        <div className="pt-8 pb-8 border-t border-slate-800/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {/* Column 1: Registered Office Address */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-brand-green-soft shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white">Registered Office</h5>
                    <p className="text-[11px] text-slate-400">{COMPANY_DETAILS.location}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {COMPANY_DETAILS.address}
                </p>
              </div>
            </div>

            {/* Column 2: Phone & WhatsApp Support */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-brand-green-soft shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white">Call &amp; WhatsApp Support</h5>
                    <p className="text-[11px] text-emerald-400 font-medium">Instant Trip Quotes</p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1 text-xs">
                  {/* Primary Call & WhatsApp */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <a
                      href={`tel:${COMPANY_DETAILS.phone.replace(/\s+/g, '')}`}
                      className="text-white hover:text-brand-green-soft font-bold text-sm sm:text-base tracking-tight transition-colors"
                    >
                      {COMPANY_DETAILS.phone}
                    </a>
                    <a
                      href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all text-xs font-bold shrink-0"
                      title="Chat on WhatsApp"
                    >
                      <WhatsAppIcon variant="green" className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Booking Desk */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <a
                      href={`tel:${COMPANY_DETAILS.phoneSecondary.replace(/\s+/g, '')}`}
                      className="text-slate-300 hover:text-white font-medium transition-colors"
                    >
                      {COMPANY_DETAILS.phoneSecondary}
                    </a>
                    <span className="text-[10px] font-semibold text-slate-300 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      Booking Desk
                    </span>
                  </div>

                  {/* Support Helpline */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <a
                      href={`tel:${COMPANY_DETAILS.phoneAlt.replace(/\s+/g, '')}`}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {COMPANY_DETAILS.phoneAlt}
                    </a>
                    <span className="text-[10px] text-slate-500">
                      Helpline
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-4 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-white/5 mt-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Quick assistance for all bookings</span>
              </div>
            </div>

            {/* Column 3: Email & Operational Hours */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-brand-green-soft shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white">Email &amp; Inquiries</h5>
                    <p className="text-[11px] text-slate-400">Custom Itineraries</p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1 text-xs">
                  <div>
                    <p className="text-[11px] text-slate-400">Official Guest Inquiries:</p>
                    <a
                      href={`mailto:${COMPANY_DETAILS.email}`}
                      className="text-white hover:text-brand-green-soft font-bold text-sm transition-colors break-all"
                    >
                      {COMPANY_DETAILS.email}
                    </a>
                  </div>

                  <div className="pt-1 flex items-start gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-brand-green-soft shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-200 font-semibold">Daily 8:00 AM – 8:00 PM</span>
                      <p className="text-[11px] text-slate-400">12/7 Active Guest Travel Support</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-white/5 mt-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Replies usually within 15–30 minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {currentYear} Travel Care Tours Pvt Ltd. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <span>Ground Flr, Mannath Bld, Thrikkakara, Ernakulam</span>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              aria-label="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span className="text-[11px]">Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

