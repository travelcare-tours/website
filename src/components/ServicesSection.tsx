import React, { useState } from 'react';
import {
  Car,
  Building2,
  Ship,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  Calendar,
  Users,
  MapPin,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  Tag,
  BadgePercent,
  Navigation,
} from 'lucide-react';
import { COMPANY_DETAILS } from '../data/travelData';
import { WhatsAppIcon } from './WhatsAppIcon';
import { handleImageFallback } from '../utils/imageFallback';
import { submitTripEnquiry } from '../services/leadService';
import { Toast } from './Toast';

interface ServiceItem {
  id: 'cab' | 'hotel' | 'houseboat';
  title: string;
  badge: string;
  badgeColor: string;
  tagline: string;
  image: string;
  imageAlt: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  description: string;
  features: string[];
  keyTags: string[];
  buttonText: string;
}

const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'cab',
    title: 'Kerala Cab & Chauffeur Services',
    badge: '24/7 Airport & Inter-City',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    tagline: 'Sanitized Private Fleet • Courteous Local Chauffeurs',
    image: 'https://www.skilcabs.com/public/uploads/airport-keyword/81fb8081d1703dfb341b4d8e27f8212d.webp',
    imageAlt: 'Private tourist cab service in Kerala',
    icon: Car,
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    iconColor: 'text-emerald-600',
    description:
      'Punctual, hassle-free private taxi rentals across Kerala. Travel with courteous, multi-lingual chauffeurs in well-maintained, air-conditioned sedans, SUVs, and Tempo Travellers.',
    features: [
      'Airport pickups & drops: Cochin (COK), Trivandrum (TRV) & Calicut (CCJ)',
      'Fleet options: Swift Dzire, Toyota Etios, Innova Crysta, Urbania & Tempo Traveller',
      'All-inclusive pricing: Fuel, driver allowance (bata), tolls & parking included',
      'Experienced local chauffeurs who double as friendly sightseeing guides',
    ],
    keyTags: ['Sedan & SUV', 'Innova Crysta', 'Tempo Traveller', 'Airport Taxi'],
    buttonText: 'Book Kerala Cab',
  },
  {
    id: 'hotel',
    title: 'Hotel & Luxury Resort Bookings',
    badge: 'Best Price Than Websites',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    tagline: 'Handpicked 3★, 4★, 5★ Resorts & Heritage Stays',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85',
    imageAlt: 'Luxury resort and plantation stay in Kerala',
    icon: Building2,
    iconBg: 'bg-amber-50 text-amber-600 border border-amber-200',
    iconColor: 'text-amber-600',
    description:
      'Enjoy guaranteed lower prices than shown on public travel websites! We work directly with verified mountain resorts, spice plantation stays, and beachside hotels to give you unbeatable tariff quotes.',
    features: [
      'Sample Benefit: Up to 15%–20% lower rates than public online booking websites',
      'Handpicked 3-Star comfort hotels, 4-Star mountain resorts & 5-Star luxury properties',
      'Specialty accommodations: Treehouses, spice plantation bungalows & heritage Tharavadus',
      'Verified hygiene standards, complimentary daily breakfast & instant voucher confirmation',
    ],
    keyTags: ['Munnar Tea Stays', 'Thekkady Jungle Resorts', 'Beachfront Stays', 'Treehouses'],
    buttonText: 'Enquire Hotel Rates',
  },
  {
    id: 'houseboat',
    title: 'Alleppey & Kumarakom Houseboats',
    badge: 'Authentic Backwaters Cruise',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    tagline: 'Deluxe, Premium & Luxury Air-Conditioned Cruises',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=85',
    imageAlt: 'Alleppey backwater kettuvallam houseboat cruise',
    icon: Ship,
    iconBg: 'bg-sky-50 text-sky-600 border border-sky-200',
    iconColor: 'text-sky-600',
    description:
      'Glide through serene backwater lagoons in a private kettuvallam houseboat. Complete with an onboard private chef preparing authentic Kerala delicacies, AC bedrooms, and open sundecks.',
    features: [
      'Private houseboats from 1-BHK (Honeymoon) to 6-BHK (Families & Corporate groups)',
      'Authentic Kerala cuisine onboard: Welcome drink, Karimeen fish fry, traditional lunch & tea snacks',
      'Choice of Day Cruise (11:00 AM – 5:00 PM) or Overnight Stay with AC bedrooms',
      'Fully licensed boats with certified captains, dedicated private chef & life safety gear',
    ],
    keyTags: ['1 to 6 BHK Private', 'Onboard Private Chef', 'Day & Overnight Cruises'],
    buttonText: 'Book Houseboat',
  },
];

interface ServicesSectionProps {
  onPlanTripClick?: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onPlanTripClick }) => {
  // Collapsible cards state
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({});

  // Prerequisite Floater Modal State
  const [activeServiceForModal, setActiveServiceForModal] = useState<ServiceItem | null>(null);

  // Common Form Fields
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Cab Specific Fields
  const [cabPickup, setCabPickup] = useState('');
  const [cabDropoff, setCabDropoff] = useState('');
  const [cabDate, setCabDate] = useState('');
  const [cabVehicle, setCabVehicle] = useState('Toyota Innova Crysta');
  const [cabTripType, setCabTripType] = useState('Airport Transfer / Inter-City');

  // Hotel Specific Fields
  const [hotelCity, setHotelCity] = useState('');
  const [hotelCheckIn, setHotelCheckIn] = useState('');
  const [hotelCheckOut, setHotelCheckOut] = useState('');
  const [hotelCategory, setHotelCategory] = useState('4-Star Premium Resort');
  const [hotelRooms, setHotelRooms] = useState('1 Room (2 Adults)');

  // Houseboat Specific Fields
  const [houseboatLocation, setHouseboatLocation] = useState('Alleppey (Alappuzha)');
  const [houseboatDate, setHouseboatDate] = useState('');
  const [houseboatCruiseType, setHouseboatCruiseType] = useState('Overnight Stay (12 PM - 9 AM)');
  const [houseboatBedrooms, setHouseboatBedrooms] = useState('1-BHK Private (Couple / Honeymoon)');
  const [houseboatGuests, setHouseboatGuests] = useState('2 Adults');

  const [toast, setToast] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    actionLabel?: string;
    actionUrl?: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const toggleExpand = (serviceId: string) => {
    setExpandedServices((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  const handleOpenModal = (service: ServiceItem) => {
    setActiveServiceForModal(service);
    setValidationError(null);
  };

  const handleCloseModal = () => {
    setActiveServiceForModal(null);
    setValidationError(null);
  };

  const handleSubmitPrerequisiteForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeServiceForModal) return;

    if (!guestName.trim()) {
      setValidationError('Please enter your Name so we can personalize the quote.');
      return;
    }
    const cleanPhone = guestPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Service-specific validation
    if (activeServiceForModal.id === 'cab') {
      if (!cabPickup.trim()) {
        setValidationError('Please specify the Pick-up Location (e.g. Cochin Airport COK).');
        return;
      }
      if (!cabDropoff.trim()) {
        setValidationError('Please specify the Drop-off Destination (e.g. Munnar).');
        return;
      }
      if (!cabDate) {
        setValidationError('Please select your Travel / Pickup Date using the calendar.');
        return;
      }
    } else if (activeServiceForModal.id === 'hotel') {
      if (!hotelCity.trim()) {
        setValidationError('Please enter your preferred Destination / City (e.g. Munnar).');
        return;
      }
      if (!hotelCheckIn) {
        setValidationError('Please select the Check-in Date.');
        return;
      }
    } else if (activeServiceForModal.id === 'houseboat') {
      if (!houseboatDate) {
        setValidationError('Please select your Houseboat Cruise Date.');
        return;
      }
    }

    setValidationError(null);
    setIsSubmitting(true);

    let formattedWhatsAppMsg = '';
    let enquiryLeadData: any = {};

    if (activeServiceForModal.id === 'cab') {
      formattedWhatsAppMsg = [
        `Hello Travel Care Tours! 🚗`,
        `I would like to book a private Cab in Kerala:`,
        ``,
        `👤 *Guest Name:* ${guestName.trim()}`,
        `📞 *Contact:* +91 ${cleanPhone}`,
        `📍 *Pick-up Location:* ${cabPickup.trim()}`,
        `🏁 *Drop-off Destination:* ${cabDropoff.trim()}`,
        `📅 *Travel Date:* ${cabDate}`,
        `🚘 *Preferred Vehicle:* ${cabVehicle}`,
        `🔄 *Service Type:* ${cabTripType}`,
        notes.trim() ? `📝 *Requirements:* ${notes.trim()}` : '',
        ``,
        `Please share vehicle availability, driver details, and the best all-inclusive price quote. Thank you!`,
      ]
        .filter(Boolean)
        .join('\n');

      enquiryLeadData = {
        guestName: guestName.trim(),
        phone: cleanPhone,
        travelMonth: cabDate,
        nights: 0,
        adults: 2,
        children: 0,
        destinations: `${cabPickup.trim()} to ${cabDropoff.trim()}`,
        hotelTier: 'N/A (Cab Booking)',
        vehicle: cabVehicle,
        inclusions: `Cab: ${cabTripType}`,
        specialNote: notes.trim(),
        packageTitle: 'Service: Kerala Cab Booking',
      };
    } else if (activeServiceForModal.id === 'hotel') {
      formattedWhatsAppMsg = [
        `Hello Travel Care Tours! 🏨`,
        `I am requesting Hotel / Resort Booking (Best Price Guarantee):`,
        ``,
        `👤 *Guest Name:* ${guestName.trim()}`,
        `📞 *Contact:* +91 ${cleanPhone}`,
        `📍 *Destination / City:* ${hotelCity.trim()}`,
        `📅 *Check-in Date:* ${hotelCheckIn}`,
        hotelCheckOut ? `📅 *Check-out Date:* ${hotelCheckOut}` : '',
        `⭐ *Category:* ${hotelCategory}`,
        `🛏️ *Rooms & Guests:* ${hotelRooms}`,
        notes.trim() ? `📝 *Requirements:* ${notes.trim()}` : '',
        ``,
        `Please share your recommended properties with rates better than public booking websites. Thank you!`,
      ]
        .filter(Boolean)
        .join('\n');

      enquiryLeadData = {
        guestName: guestName.trim(),
        phone: cleanPhone,
        travelMonth: hotelCheckIn,
        nights: 1,
        adults: 2,
        children: 0,
        destinations: hotelCity.trim(),
        hotelTier: hotelCategory,
        vehicle: 'N/A (Hotel Only)',
        inclusions: `Hotel: ${hotelRooms}`,
        specialNote: notes.trim(),
        packageTitle: 'Service: Hotel / Resort Booking',
      };
    } else {
      // Houseboat
      formattedWhatsAppMsg = [
        `Hello Travel Care Tours! 🛥️`,
        `I would like to book a Private Kerala Houseboat:`,
        ``,
        `👤 *Guest Name:* ${guestName.trim()}`,
        `📞 *Contact:* +91 ${cleanPhone}`,
        `📍 *Location:* ${houseboatLocation}`,
        `📅 *Cruise Date:* ${houseboatDate}`,
        `⛵ *Cruise Type:* ${houseboatCruiseType}`,
        `🛏️ *Bedrooms:* ${houseboatBedrooms}`,
        `👥 *Guests:* ${houseboatGuests}`,
        notes.trim() ? `📝 *Requirements:* ${notes.trim()}` : '',
        ``,
        `Please share available houseboats with onboard chef and best price quote. Thank you!`,
      ]
        .filter(Boolean)
        .join('\n');

      enquiryLeadData = {
        guestName: guestName.trim(),
        phone: cleanPhone,
        travelMonth: houseboatDate,
        nights: houseboatCruiseType.includes('Overnight') ? 1 : 0,
        adults: 2,
        children: 0,
        destinations: houseboatLocation,
        hotelTier: 'Houseboat Stay',
        vehicle: 'N/A (Houseboat Only)',
        inclusions: `${houseboatCruiseType} - ${houseboatBedrooms}`,
        specialNote: notes.trim(),
        packageTitle: 'Service: Houseboat Booking',
      };
    }

    // Log enquiry lead
    try {
      submitTripEnquiry(enquiryLeadData);
    } catch (err) {
      console.warn('Service lead save failed:', err);
    }

    const whatsappNumber = String(COMPANY_DETAILS.whatsappNumber).replace(/\D/g, '');
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedWhatsAppMsg)}`;
    window.open(url, '_blank');

    setIsSubmitting(false);
    handleCloseModal();

    setToast({
      isOpen: true,
      type: 'success',
      title: `${activeServiceForModal.title} Enquiry Created!`,
      message: `Thank you ${guestName.trim()}! We've forwarded your exact details to WhatsApp. Our team will share available options immediately.`,
      actionLabel: 'Open WhatsApp',
      actionUrl: url,
    });
  };

  return (
    <section id="services" className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-green/10 text-brand-green border border-brand-green/20">
            <Sparkles className="w-3.5 h-3.5 text-brand-green" />
            <span>Dedicated Travel Services</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-navy tracking-tight font-serif">
            Cab Services, Hotels &amp; Houseboat Bookings
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Need standalone travel bookings in Kerala? We provide sanitized tourist cabs with
            courteous local drivers, handpicked resorts at lower prices than public websites, and
            authentic Alleppey backwater houseboats.
          </p>
        </div>

        {/* 3 Core Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {SERVICES_DATA.map((service) => {
            const Icon = service.icon;
            const isExpanded = !!expandedServices[service.id];

            return (
              <div
                key={service.id}
                className="group flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Image Header with Badge */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={service.image}
                    alt={service.imageAlt}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => handleImageFallback(e, service.id)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-3.5 left-3.5">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-md backdrop-blur-xs border ${service.badgeColor}`}
                    >
                      {service.badge}
                    </span>
                  </div>

                  {/* Icon & Tagline */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md bg-white text-slate-800 shrink-0">
                      <Icon className={`w-5 h-5 ${service.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white/95 truncate">
                        {service.tagline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-lg sm:text-xl font-bold text-brand-navy group-hover:text-brand-green transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Quick Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {service.keyTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Collapsible Additional Info / Inclusions */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(service.id)}
                        className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer border border-slate-200/60"
                      >
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-brand-green" />
                          <span>{isExpanded ? 'Hide Inclusions' : 'More Info & Inclusions'}</span>
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2.5 p-3 rounded-xl bg-slate-50/90 border border-slate-200/70 space-y-2 text-xs text-slate-700 animate-fadeIn">
                          {service.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                              <span className="leading-snug">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Primary Floater Trigger Button */}
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(service)}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-navy hover:bg-brand-navy-light shadow-md shadow-brand-navy/20 hover:scale-[1.01] transition-all cursor-pointer group/btn"
                    >
                      <WhatsAppIcon variant="white" className="w-4 h-4 fill-white shrink-0" />
                      <span>{service.buttonText}</span>
                      <ArrowRight className="w-4 h-4 text-white/70 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-[11px] text-center text-slate-400 mt-1.5">
                      Fills prerequisite details first for accurate pricing
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Value Assurance Bar with Sample Price Advantage Note */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">100% Verified Fleet</p>
                <p className="text-[11px] text-slate-500">Sanitized &amp; GPS monitored</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">12/7 Guest Support</p>
                <p className="text-[11px] text-slate-500">Instant trip coordination</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <BadgePercent className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Best Price Guarantee</p>
                <p className="text-[11px] text-slate-500">Lower than published websites</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Token Advance Only</p>
                <p className="text-[11px] text-slate-500">Pay remainder on arrival</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Link to Full Tour Planner */}
        {onPlanTripClick && (
          <div className="mt-8 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Need cab, hotel, and houseboat combined together?{' '}
              <button
                type="button"
                onClick={onPlanTripClick}
                className="font-bold text-brand-green hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <span>Calculate an all-inclusive Kerala package here</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Prerequisite Enquiry Floater Modal */}
      {activeServiceForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg my-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Floater Header */}
            <div className="bg-brand-navy p-4 sm:p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <activeServiceForModal.icon className="w-5 h-5 text-brand-green" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base tracking-tight">
                    {activeServiceForModal.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-300">
                    Fill prerequisite details for an exact quote
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Floater Form */}
            <form onSubmit={handleSubmitPrerequisiteForm} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {validationError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {validationError}
                </div>
              )}

              {/* Guest Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    10-Digit Mobile *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                    />
                  </div>
                </div>
              </div>

              {/* SERVICE SPECIFIC PREREQUISITE INPUTS */}

              {/* 1. CAB FORM */}
              {activeServiceForModal.id === 'cab' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pick-up Location *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={cabPickup}
                        onChange={(e) => setCabPickup(e.target.value)}
                        placeholder="e.g. Cochin Airport (COK)"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Drop-off Destination *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={cabDropoff}
                        onChange={(e) => setCabDropoff(e.target.value)}
                        placeholder="e.g. Munnar / Alleppey / Kochi"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pick-up Date (Calendar) *</span>
                      </label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={cabDate}
                        onChange={(e) => setCabDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Vehicle Preference
                      </label>
                      <select
                        value={cabVehicle}
                        onChange={(e) => setCabVehicle(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 bg-white"
                      >
                        <option value="Toyota Innova Crysta">Toyota Innova Crysta (6 Guests)</option>
                        <option value="Sedan (Swift Dzire / Etios)">Sedan (Swift Dzire / Etios - 4 Guests)</option>
                        <option value="Tempo Traveller (12 to 26 Seater)">Tempo Traveller (12 to 26 Seater)</option>
                        <option value="Force Urbania Luxury">Force Urbania Luxury</option>
                        <option value="Recommend Best Vehicle">Recommend Best for my group</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cab Trip Type
                    </label>
                    <select
                      value={cabTripType}
                      onChange={(e) => setCabTripType(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 bg-white"
                    >
                      <option value="Airport Transfer Only (One-Way)">Airport Transfer Only (One-Way)</option>
                      <option value="Multi-Day Kerala Tour with Driver">Multi-Day Kerala Tour with Chauffeur</option>
                      <option value="Round Trip Inter-City">Round Trip Inter-City</option>
                      <option value="Local City Sightseeing">Local City Sightseeing</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 2. HOTEL FORM */}
              {activeServiceForModal.id === 'hotel' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800">
                    <strong>Best Price Guarantee:</strong> We negotiate direct hotel rates to provide lower prices than major public booking websites.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>Destination / City in Kerala *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={hotelCity}
                      onChange={(e) => setHotelCity(e.target.value)}
                      placeholder="e.g. Munnar, Thekkady, Kovalam, Wayanad"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>Check-in Date *</span>
                      </label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={hotelCheckIn}
                        onChange={(e) => setHotelCheckIn(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>Check-out Date</span>
                      </label>
                      <input
                        type="date"
                        min={hotelCheckIn || todayStr}
                        value={hotelCheckOut}
                        onChange={(e) => setHotelCheckOut(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Preferred Hotel Category
                      </label>
                      <select
                        value={hotelCategory}
                        onChange={(e) => setHotelCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 bg-white"
                      >
                        <option value="4-Star Premium Resort">4-Star Premium Resort</option>
                        <option value="3-Star Comfort Hotel / Homestay">3-Star Comfort Hotel</option>
                        <option value="5-Star Luxury Resort">5-Star Luxury Resort</option>
                        <option value="Treehouse / Plantation Villa">Treehouse / Plantation Villa</option>
                        <option value="Budget-Friendly Clean Stay">Budget-Friendly Clean Stay</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Rooms &amp; Guests
                      </label>
                      <input
                        type="text"
                        value={hotelRooms}
                        onChange={(e) => setHotelRooms(e.target.value)}
                        placeholder="e.g. 2 Rooms (4 Adults + 1 Child)"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. HOUSEBOAT FORM */}
              {activeServiceForModal.id === 'houseboat' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-600" />
                        <span>Cruise Location</span>
                      </label>
                      <select
                        value={houseboatLocation}
                        onChange={(e) => setHouseboatLocation(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 bg-white"
                      >
                        <option value="Alleppey (Alappuzha) - Punnamada">Alleppey (Alappuzha)</option>
                        <option value="Kumarakom (Vembanad Lake)">Kumarakom (Vembanad Lake)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-sky-600" />
                        <span>Cruise Date (Calendar) *</span>
                      </label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={houseboatDate}
                        onChange={(e) => setHouseboatDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Cruise Duration
                      </label>
                      <select
                        value={houseboatCruiseType}
                        onChange={(e) => setHouseboatCruiseType(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 bg-white"
                      >
                        <option value="Overnight Stay (12 PM - 9 AM next day)">Overnight Stay (12 PM to 9 AM)</option>
                        <option value="Day Cruise Only (11:00 AM - 5:00 PM)">Day Cruise Only (11 AM to 5 PM)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Number of Bedrooms
                      </label>
                      <select
                        value={houseboatBedrooms}
                        onChange={(e) => setHouseboatBedrooms(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 bg-white"
                      >
                        <option value="1-BHK Private (Couple / Honeymoon)">1-BHK Private (Honeymoon/Couple)</option>
                        <option value="2-BHK Private (Family 4-6)">2-BHK Private (Family)</option>
                        <option value="3-BHK Private (Family 6-8)">3-BHK Private (6-8 Guests)</option>
                        <option value="4-BHK to 6-BHK Large Boat">4-BHK to 6-BHK (Large Group)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Guests Count (Adults &amp; Children)
                    </label>
                    <input
                      type="text"
                      value={houseboatGuests}
                      onChange={(e) => setHouseboatGuests(e.target.value)}
                      placeholder="e.g. 4 Adults + 1 Child"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                    />
                  </div>
                </div>
              )}

              {/* Specific Notes & Special Requirements */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Notes / Preferences (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    activeServiceForModal.id === 'cab'
                      ? 'e.g. Flight arrives at 10:30 AM, need luggage space for 4 bags'
                      : activeServiceForModal.id === 'hotel'
                      ? 'e.g. Prefer valley/tea garden view balcony, bathtub'
                      : 'e.g. Pure vegetarian meals onboard, anniversary cake'
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-70 shadow-lg shadow-[#25D366]/25 hover:scale-[1.01] transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <WhatsAppIcon variant="white" className="w-4 h-4 fill-white shrink-0" />
                      <span>Get Instant WhatsApp Quote</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-500 mt-2">
                  No advance payment or commitment required for tariff consultation.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Interactive Toast Feedback */}
      <Toast
        isOpen={toast.isOpen}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        actionLabel={toast.actionLabel}
        actionUrl={toast.actionUrl}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </section>
  );
};
