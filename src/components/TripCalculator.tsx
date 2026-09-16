import React, { useState } from 'react';
import {
  Calculator,
  Check,
  MapPin,
  Users,
  Calendar,
  Building,
  Car,
  Sparkles,
  User,
  Phone,
  CalendarDays,
  FileText,
  AlertCircle,
  Plus,
  X,
  CheckCircle2,
  Copy,
  Mail,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { DESTINATIONS, COMPANY_DETAILS } from '../data/travelData';
import { WhatsAppIcon } from './WhatsAppIcon';
import { submitTripEnquiry } from '../services/leadService';
import { Toast } from './Toast';

interface TripCalculatorProps {
  selectedDests: string[];
  onToggleDest: (name: string) => void;
  selectedPackageTitle?: string;
}

export const TripCalculator: React.FC<TripCalculatorProps> = ({
  selectedDests,
  onToggleDest,
  selectedPackageTitle,
}) => {
  const [nights, setNights] = useState<number>(5);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [hotelTier, setHotelTier] = useState<string>('Deluxe 4-Star');
  const [vehicle, setVehicle] = useState<string>('Sedan');
  const [houseboat, setHouseboat] = useState<boolean>(true);
  const [spiceTour, setSpiceTour] = useState<boolean>(true);
  const [jeepSafari, setJeepSafari] = useState<boolean>(false);

  // Custom places added by the guest
  const [customPlaces, setCustomPlaces] = useState<string[]>([]);
  const [newPlaceInput, setNewPlaceInput] = useState<string>('');

  // Guest Information (Required for personal proposal)
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [travelMonth, setTravelMonth] = useState<string>('');
  const [specialNote, setSpecialNote] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Submission & Feedback State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState<string>('');
  const [lastMessageText, setLastMessageText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
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

  const formatTravelDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(dt.getTime())) {
          return dt.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        }
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleAdultsChange = (val: number) => {
    const num = Math.max(1, val);
    setAdults(num);
    if (num + children > 4 && vehicle === 'Sedan') {
      setVehicle('SUV');
    }
    if (num + children > 7) {
      setVehicle('Traveller 12 Seat');
    }
  };

  const handleChildrenChange = (val: number) => {
    const count = Math.max(0, Math.min(8, val));
    setChildren(count);
    setChildAges((prev) => {
      if (count > prev.length) {
        // Default newly added child to 5 years
        const diff = count - prev.length;
        return [...prev, ...Array(diff).fill(5)];
      } else {
        return prev.slice(0, count);
      }
    });
    if (adults + count > 4 && vehicle === 'Sedan') {
      setVehicle('SUV');
    }
    if (adults + count > 7) {
      setVehicle('Traveller 12 Seat');
    }
  };

  const handleChildAgeChange = (index: number, age: number) => {
    setChildAges((prev) => {
      const copy = [...prev];
      copy[index] = age;
      return copy;
    });
  };

  const handleAddPlace = () => {
    const trimmed = newPlaceInput.trim();
    if (!trimmed) return;
    if (customPlaces.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      setNewPlaceInput('');
      return;
    }
    if (selectedDests.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      setNewPlaceInput('');
      return;
    }
    setCustomPlaces((prev) => [...prev, trimmed]);
    setNewPlaceInput('');
  };

  const handleRemovePlace = (placeToRemove: string) => {
    setCustomPlaces((prev) => prev.filter((p) => p !== placeToRemove));
  };

  const buildMessageText = (phoneOverride?: string): string => {
    const cleanedPhone = (phoneOverride || guestPhone).replace(/\D/g, '');
    const allPlaces = [...selectedDests, ...customPlaces];
    const destList = allPlaces.length > 0 ? allPlaces.join(', ') : 'Munnar, Thekkady, Alleppey';
    const extras: string[] = [];
    if (houseboat) extras.push('Private Houseboat Stay');
    if (spiceTour) extras.push('Spice Plantation Tour');
    if (jeepSafari) extras.push('Off-road Jeep Safari');

    const emoji = {
      wave: String.fromCodePoint(0x1F44B),
      person: String.fromCodePoint(0x1F464),
      phone: String.fromCodePoint(0x1F4F1),
      calendar: String.fromCodePoint(0x1F4C5),
      palm: String.fromCodePoint(0x1F334),
      family: String.fromCodePoint(0x1F468, 0x200D, 0x1F469, 0x200D, 0x1F467),
      target: String.fromCodePoint(0x1F3AF),
      location: String.fromCodePoint(0x1F4CD),
      hotel: String.fromCodePoint(0x1F3E8),
      car: String.fromCodePoint(0x1F697),
      sparkle: String.fromCodePoint(0x2728),
      note: String.fromCodePoint(0x1F4DD),
      email: String.fromCodePoint(0x1F4E9),
      pray: String.fromCodePoint(0x1F64F),
    };

    const childAgesFormatted =
      children > 0 && childAges.length > 0
        ? ` (Ages: ${childAges.slice(0, children).map((age, i) => `Child ${i + 1}: ${age === 0 ? '<1 yr' : `${age} yrs`}`).join(', ')})`
        : '';

    const formattedDate = formatTravelDate(travelMonth);

    return [
      `Hello Travel Care Tours! ${emoji.wave}`,
      'I calculated a custom Kerala holiday plan for you:',
      '',
      `${emoji.person} Guest Name: ${guestName.trim()}`,
      `${emoji.phone} WhatsApp / Phone: ${cleanedPhone}`,
      formattedDate
        ? `${emoji.calendar} Travel Date: ${formattedDate}`
        : '',
      `${emoji.palm} Duration: ${nights} ${nights === 1 ? 'Night' : 'Nights'} / ${nights + 1} Days`,
      `${emoji.family} Guests: ${adults} Adult(s)${children > 0 ? `, ${children} Child(ren)${childAgesFormatted}` : ''}`,
      selectedPackageTitle && selectedPackageTitle !== 'Not decided yet'
        ? `${emoji.target} Package Theme: ${selectedPackageTitle}`
        : '',
      `${emoji.location} Selected Destinations: ${destList}`,
      `${emoji.hotel} Resort Category: ${hotelTier}`,
      `${emoji.car} Private Transport: ${vehicle}`,
      extras.length > 0
        ? `${emoji.sparkle} Inclusions / Activities: ${extras.join(', ')}`
        : '',
      specialNote.trim()
        ? `${emoji.note} Special Notes: ${specialNote.trim()}`
        : '',
      '',
      `${emoji.email} Please send me the day-wise itinerary proposal and best price quote.`,
      `Thank you! ${emoji.pray}`,
    ].filter(Boolean).join('\n');
  };

  const handleSendWhatsApp = async () => {
    if (!guestName.trim()) {
      setValidationError('Please provide your Name so we can personalize your itinerary.');
      return;
    }
    const cleanedPhone = guestPhone.replace(/\D/g, '');
    if (!cleanedPhone) {
      setValidationError('Please provide your 10-digit mobile number to receive the proposal.');
      return;
    }
    if (cleanedPhone.length !== 10) {
      setValidationError('Please enter a valid 10-digit mobile number without country code (e.g. 9876543210).');
      return;
    }
    setValidationError(null);
    setIsSubmitting(true);

    const allPlaces = [...selectedDests, ...customPlaces];
    const destList = allPlaces.length > 0 ? allPlaces.join(', ') : 'Munnar, Thekkady, Alleppey';
    const extras: string[] = [];
    if (houseboat) extras.push('Private Houseboat Stay');
    if (spiceTour) extras.push('Spice Plantation Tour');
    if (jeepSafari) extras.push('Off-road Jeep Safari');

    const msg = buildMessageText(cleanedPhone);
    setLastMessageText(msg);

    // Automatically sync enquiry with Google Sheets (and local storage backup)
    try {
      submitTripEnquiry({
        guestName: guestName.trim(),
        phone: cleanedPhone,
        travelMonth: formatTravelDate(travelMonth) || travelMonth.trim(),
        nights,
        adults,
        children,
        childAges: children > 0 ? childAges.slice(0, children).map((a, i) => `Child ${i + 1}: ${a === 0 ? '<1 yr' : `${a} yrs`}`).join(', ') : undefined,
        destinations: destList,
        hotelTier,
        vehicle,
        inclusions: extras.join(', ') || 'Standard Package',
        specialNote: specialNote.trim(),
        packageTitle: selectedPackageTitle !== 'Not decided yet' ? selectedPackageTitle : undefined,
      });
    } catch (err) {
      console.warn('Enquiry logging error:', err);
    }

    const whatsappNumber = String(COMPANY_DETAILS.whatsappNumber).replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(msg);
    const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    setLastWhatsAppUrl(url);

    // Launch WhatsApp
    window.open(url, '_blank');

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Trigger instant Toast notification
    setToast({
      isOpen: true,
      type: 'success',
      title: 'Enquiry Registered Successfully!',
      message: `Your customized Kerala holiday proposal for ${guestName.trim()} has been generated. Opening WhatsApp with our tour team...`,
      actionLabel: 'Open WhatsApp',
      actionUrl: url,
    });
  };

  const handleCopyQuote = async () => {
    try {
      const textToCopy = lastMessageText || buildMessageText();
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setToast({
        isOpen: true,
        type: 'info',
        title: 'Quotation Copied to Clipboard!',
        message: 'You can paste your complete Kerala itinerary proposal into any chat or email.',
      });
      setTimeout(() => setIsCopied(false), 3500);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const handleSendEmail = () => {
    const textToSend = lastMessageText || buildMessageText();
    const subject = encodeURIComponent(`Kerala Tour Package Proposal - ${guestName.trim() || 'Custom Plan'}`);
    const body = encodeURIComponent(textToSend);
    window.open(`mailto:${COMPANY_DETAILS.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const allSelectedCount = selectedDests.length + customPlaces.length;

  return (
    <section id="trip-planner" className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            <span>INSTANT TRIP PLANNER</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-brand-navy">
            Design Your Ideal Kerala Holiday
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Customize destinations, duration, resort category, vehicle, and your contact details to instantly receive a personalized itinerary on WhatsApp.
          </p>
        </div>

        {/* Planner Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Options Controls */}
            <div className="lg:col-span-8 space-y-8">
              {/* Destinations selector + Custom Places Input */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-brand-green shrink-0" />
                  <span>Choose Kerala Destinations</span>
                </label>

                {/* Major Kerala Destination Badges */}
                <div className="flex flex-wrap gap-2">
                  {DESTINATIONS.map((d) => {
                    const isPicked = selectedDests.includes(d.name);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => onToggleDest(d.name)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                          isPicked
                            ? 'bg-brand-navy text-white shadow-md shadow-brand-navy/25 scale-[1.02]'
                            : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-brand-navy border border-slate-200/80'
                        }`}
                      >
                        {isPicked ? <Check className="w-3.5 h-3.5 text-brand-green-soft stroke-[2.5]" /> : null}
                        <span>{d.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Space to Add Custom Places / Offbeat Stops */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Add More Places or Offbeat Stops:
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPlaceInput}
                      onChange={(e) => setNewPlaceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPlace();
                        }
                      }}
                      placeholder="Type a town, beach, or attraction..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-brand-green focus:ring-1 focus:ring-brand-green"
                    />
                    <button
                      type="button"
                      onClick={handleAddPlace}
                      className="px-4 py-2.5 rounded-xl bg-brand-navy hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-brand-green-soft" />
                      <span>Add Place</span>
                    </button>
                  </div>

                  {customPlaces.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1.5">
                      {customPlaces.map((place) => (
                        <span
                          key={place}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 text-slate-900 border border-emerald-300 text-xs font-semibold shadow-2xs"
                        >
                          <span>{place}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePlace(place)}
                            className="text-emerald-700 hover:text-rose-600 font-bold ml-0.5 p-0.5 rounded-full hover:bg-emerald-100 transition-colors cursor-pointer"
                            aria-label={`Remove ${place}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Relocated: Places included count & example hint at the bottom */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-2 text-xs">
                    <span className="text-brand-green font-semibold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-brand-green" />
                      <span>{allSelectedCount} place{allSelectedCount === 1 ? '' : 's'} included</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      e.g. Kumarakom, Jatayu Rock, Marari, Bekal
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Duration & Guest count */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 pt-4 border-t border-slate-100">
                <div className="md:col-span-4 lg:col-span-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-green" />
                    <span>Duration: {nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value))}
                    className="w-full accent-brand-green cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-semibold">
                    <span>1 Night</span>
                    <span className="text-brand-green font-bold">{nights}N / {nights + 1}D</span>
                    <span>14 Nights</span>
                  </div>
                </div>

                <div className="md:col-span-3 lg:col-span-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-brand-green" />
                    <span>Adults</span>
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-slate-50 min-h-[44px]">
                    <button
                      type="button"
                      onClick={() => handleAdultsChange(adults - 1)}
                      className="w-12 h-11 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:bg-slate-300 font-bold text-lg cursor-pointer select-none"
                      aria-label="Decrease adults"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-sm font-bold text-slate-800">
                      {adults}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdultsChange(adults + 1)}
                      className="w-12 h-11 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:bg-slate-300 font-bold text-lg cursor-pointer select-none"
                      aria-label="Increase adults"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="md:col-span-5 lg:col-span-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-brand-green" />
                    <span>Children (&lt;12 yrs)</span>
                  </label>
                  {/* Desktop: In the same row as the stepper! Mobile: new row with increased width */}
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-slate-50 min-h-[44px] w-full md:w-[120px] shrink-0">
                      <button
                        type="button"
                        onClick={() => handleChildrenChange(children - 1)}
                        className="w-12 h-11 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:bg-slate-300 font-bold text-lg cursor-pointer select-none"
                        aria-label="Decrease children"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center text-sm font-bold text-slate-800">
                        {children}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleChildrenChange(children + 1)}
                        className="w-12 h-11 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:bg-slate-300 font-bold text-lg cursor-pointer select-none"
                        aria-label="Increase children"
                      >
                        +
                      </button>
                    </div>

                    {/* Child Age Dropdowns: In the same row for desktop, and as a wide new row for mobile */}
                    {children > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-2.5 w-full">
                        {Array.from({ length: children }).map((_, idx) => (
                          <div key={idx} className="w-full md:w-auto md:min-w-[150px] lg:min-w-[160px] flex-1">
                            <select
                              value={childAges[idx] ?? 5}
                              onChange={(e) => handleChildAgeChange(idx, Number(e.target.value))}
                              className="w-full h-11 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:border-brand-green focus:bg-white focus:ring-1 focus:ring-brand-green cursor-pointer shadow-2xs"
                              aria-label={`Age for child ${idx + 1}`}
                            >
                              <option value={0}>Child {idx + 1}: &lt;1 yr</option>
                              <option value={1}>Child {idx + 1}: 1 yr</option>
                              <option value={2}>Child {idx + 1}: 2 yrs</option>
                              <option value={3}>Child {idx + 1}: 3 yrs</option>
                              <option value={4}>Child {idx + 1}: 4 yrs</option>
                              <option value={5}>Child {idx + 1}: 5 yrs</option>
                              <option value={6}>Child {idx + 1}: 6 yrs</option>
                              <option value={7}>Child {idx + 1}: 7 yrs</option>
                              <option value={8}>Child {idx + 1}: 8 yrs</option>
                              <option value={9}>Child {idx + 1}: 9 yrs</option>
                              <option value={10}>Child {idx + 1}: 10 yrs</option>
                              <option value={11}>Child {idx + 1}: 11 yrs</option>
                              <option value={12}>Child {idx + 1}: 12 yrs</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Resort Tier & Vehicle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4 text-brand-green shrink-0" />
                    <span>Resort / Hotel Category</span>
                  </label>
                  <select
                    value={hotelTier}
                    onChange={(e) => setHotelTier(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:border-brand-green focus:ring-1 focus:ring-brand-green"
                  >
                    <option value="Comfort 3-Star">Comfort 3-Star (Clean, cozy & central)</option>
                    <option value="Deluxe 4-Star">Deluxe 4-Star (Valley/pool views & breakfast)</option>
                    <option value="Luxury 5-Star & Heritage">Luxury 5-Star & Heritage (Premium luxury)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-2">
                    <Car className="w-4 h-4 text-brand-green shrink-0" />
                    <span>Dedicated Private Vehicle</span>
                  </label>
                  <select
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:border-brand-green focus:ring-1 focus:ring-brand-green"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Traveller 12 Seat">Traveller 12 Seat</option>
                  </select>
                </div>
              </div>

              {/* 4. Experiences Add-ons */}
              <div className="pt-4 border-t border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-green shrink-0" />
                  <span>Signature Experiences to Include</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    houseboat ? 'bg-emerald-50 border-brand-green text-emerald-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={houseboat}
                      onChange={(e) => setHouseboat(e.target.checked)}
                      className="accent-brand-green w-4 h-4 rounded-sm"
                    />
                    <span className="text-xs">Alleppey Houseboat Stay</span>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    spiceTour ? 'bg-emerald-50 border-brand-green text-emerald-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={spiceTour}
                      onChange={(e) => setSpiceTour(e.target.checked)}
                      className="accent-brand-green w-4 h-4 rounded-sm"
                    />
                    <span className="text-xs">Thekkady Spice Walk</span>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    jeepSafari ? 'bg-emerald-50 border-brand-green text-emerald-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={jeepSafari}
                      onChange={(e) => setJeepSafari(e.target.checked)}
                      className="accent-brand-green w-4 h-4 rounded-sm"
                    />
                    <span className="text-xs">Vagamon 4x4 Jeep Safari</span>
                  </label>
                </div>
              </div>

              {/* Required Guest Information */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-green shrink-0" />
                  <span>Your Contact Information (Required for Itinerary)</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={guestName}
                        onChange={(e) => {
                          setGuestName(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                          validationError && !guestName.trim()
                            ? 'border-rose-400 bg-rose-50/40 focus:ring-rose-400'
                            : 'border-slate-200 bg-white focus:border-brand-green focus:ring-brand-green'
                        }`}
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      10-Digit Mobile / WhatsApp Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        placeholder="10-digit number (e.g. 9876543210)"
                        value={guestPhone}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setGuestPhone(digitsOnly);
                          if (validationError) setValidationError(null);
                        }}
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                          validationError && (!guestPhone.trim() || guestPhone.replace(/\D/g, '').length !== 10)
                            ? 'border-rose-400 bg-rose-50/40 focus:ring-rose-400'
                            : 'border-slate-200 bg-white focus:border-brand-green focus:ring-brand-green'
                        }`}
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Enter 10 digits without country code or leading 0
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Travel Date (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={travelMonth}
                        onChange={(e) => setTravelMonth(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-brand-green focus:ring-brand-green text-slate-800"
                      />
                      <CalendarDays className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Special Requests / Airport Pickup (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Cochin Airport pickup, veg food"
                        value={specialNote}
                        onChange={(e) => setSpecialNote(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-brand-green focus:ring-brand-green"
                      />
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {validationError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Summary Box */}
            <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Trip Summary</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-green text-white">
                    Custom Plan
                  </span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {guestName.trim() && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500">Guest:</span>
                      <span className="font-bold text-slate-900 truncate max-w-[170px]">{guestName.trim()}</span>
                    </div>
                  )}
                  {guestPhone.trim() && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500">Phone:</span>
                      <span className="font-bold text-slate-900">{guestPhone.trim()}</span>
                    </div>
                  )}
                  {travelMonth && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500">Travel Date:</span>
                      <span className="font-bold text-slate-900">{formatTravelDate(travelMonth)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-bold text-slate-900">{nights} {nights === 1 ? 'Night' : 'Nights'} / {nights + 1} Days</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Guests:</span>
                    <span className="font-bold text-slate-900 text-right">
                      {adults} Adults {children > 0 ? `+ ${children} Kids` : ''}
                      {children > 0 && childAges.length > 0 && (
                        <span className="block text-[11px] font-normal text-slate-500">
                          (Ages: {childAges.slice(0, children).map((a) => (a === 0 ? '<1y' : `${a}y`)).join(', ')})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Destinations:</span>
                    <span className="font-bold text-slate-900 text-right max-w-[180px] truncate" title={[...selectedDests, ...customPlaces].join(', ')}>
                      {[...selectedDests, ...customPlaces].length > 0
                        ? [...selectedDests, ...customPlaces].join(', ')
                        : 'Popular Highlights'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Resort Tier:</span>
                    <span className="font-bold text-slate-900">{hotelTier}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Vehicle:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[170px]" title={vehicle}>{vehicle}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Submission Feedback */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                {isSubmitted ? (
                  <div className="space-y-3 animate-fadeIn">
                    {/* Confirmation Badge Card */}
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
                        <span>Enquiry Logged Successfully!</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-emerald-700 leading-relaxed">
                        Personalized proposal generated for <strong>{guestName.trim()}</strong>. If WhatsApp did not open automatically, tap below:
                      </p>
                    </div>

                    {/* Direct WhatsApp Re-open CTA */}
                    <a
                      href={lastWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] shadow-lg shadow-[#25D366]/25 hover:scale-[1.01] transition-all cursor-pointer text-center"
                    >
                      <WhatsAppIcon variant="white" className="w-5 h-5 fill-white shrink-0" />
                      <span>Open WhatsApp Chat</span>
                    </a>

                    {/* Quick Secondary Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleCopyQuote}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy Quote</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleSendEmail}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>Email Quote</span>
                      </button>
                    </div>

                    {/* Reset / Recalculate */}
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Edit details or calculate another</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSendWhatsApp}
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-75 shadow-lg shadow-[#25D366]/25 hover:scale-[1.01] transition-all cursor-pointer whitespace-nowrap"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 text-white animate-spin shrink-0" />
                          <span>Generating Custom Quote...</span>
                        </>
                      ) : (
                        <>
                          <WhatsAppIcon variant="white" className="w-5 h-5 fill-white shrink-0" />
                          <span className="truncate">Get WhatsApp Quote</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-slate-500">
                      No payment required. Custom itinerary quote sent to your WhatsApp in minutes.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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
