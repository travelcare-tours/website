import React, { useState } from 'react';
import { TripRecord, CompanySettings } from '../types';
import { 
  formatCurrency, 
  formatNumber, 
  generateUpiPaymentUrl, 
  generateWhatsAppMessage, 
  generateGuestShareUrl 
} from '../utils/calculations';
import { TravelCareLogo } from './TravelCareLogo';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Car, 
  User, 
  Phone, 
  Mail,
  Globe,
  MapPin, 
  Download, 
  Printer, 
  Share2, 
  QrCode, 
  ExternalLink,
  ShieldCheck,
  Calendar,
  CreditCard,
  Building2,
  Navigation,
  MessageCircle,
  Copy,
  Check
} from 'lucide-react';

interface GuestReceiptModalProps {
  trip: TripRecord;
  companySettings: CompanySettings;
  onClose: () => void;
  onDownloadPdf: () => void;
  onDirectSharePdf: () => void;
  onPrint?: () => void;
}

export const GuestReceiptModal: React.FC<GuestReceiptModalProps> = ({
  trip,
  companySettings,
  onClose,
  onDownloadPdf,
  onDirectSharePdf,
  onPrint,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const currency = companySettings.currencySymbol || '₹';
  const isPaid = trip.balanceAmount <= 0;
  const upiUrl = generateUpiPaymentUrl(companySettings, trip);
  const guestLink = generateGuestShareUrl(trip);
  const qrCodeImgUrl = upiUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}&margin=10`
    : '';

  // WhatsApp share handler
  const handleShareWhatsApp = () => {
    const message = generateWhatsAppMessage(trip, companySettings, true);
    const cleanPhone = trip.customerPhone ? trip.customerPhone.replace(/[^0-9]/g, '') : '';
    let targetPhone = cleanPhone;
    if (targetPhone.length === 10) {
      targetPhone = `91${targetPhone}`;
    }

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = targetPhone 
      ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

    window.open(whatsappUrl, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(guestLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">Digital Guest Invoice</h2>
              <p className="text-[11px] text-slate-400">Mobile-friendly live invoice summary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
          
          {/* Main Digital Receipt Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
            
            {/* Header / Brand */}
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="flex justify-center mb-3">
                <TravelCareLogo
                  size="lg"
                  showText={true}
                  customLogoUrl={companySettings.logoUrl}
                  className="h-16 sm:h-20 w-auto max-w-[300px] sm:max-w-[380px] object-contain"
                />
              </div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">{companySettings.companyName}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{companySettings.tagline}</p>
              
              {/* Contact Channels: Phone, Email, Website - cleanly spaced without trailing dots */}
              <div className="flex flex-wrap justify-center items-center gap-x-4 sm:gap-x-5 gap-y-1.5 text-xs text-slate-600 mt-2 font-medium">
                <a 
                  href={`tel:${companySettings.phone}`} 
                  className="hover:text-blue-600 inline-flex items-center transition-colors"
                  title={`Call ${companySettings.phone}`}
                >
                  <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                  <span>{companySettings.phone}</span>
                </a>
                <a 
                  href={`mailto:${companySettings.email || 'travelcare598@gmail.com'}`} 
                  className="hover:text-blue-600 inline-flex items-center transition-colors"
                  title={`Email ${companySettings.email || 'travelcare598@gmail.com'}`}
                >
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                  <span>{companySettings.email || 'travelcare598@gmail.com'}</span>
                </a>
                <a 
                  href={companySettings.website ? (companySettings.website.startsWith('http') ? companySettings.website : `https://${companySettings.website}`) : 'https://travelcaretours.in'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-600 inline-flex items-center transition-colors"
                  title="Official Website"
                >
                  <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                  <span>{companySettings.website ? companySettings.website.replace(/^https?:\/\//, '') : 'travelcaretours.in'}</span>
                </a>
              </div>

              {/* Address */}
              <div className="flex items-center justify-center text-xs text-slate-500 mt-1.5 font-normal px-2 text-center">
                <span className="inline-flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                  {companySettings.address}
                </span>
              </div>
            </div>

            {/* Status & Bill No Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Invoice Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{trip.billNo}</span>
              </div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                  isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  {isPaid ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Paid in Full
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                      Payment Due: {formatCurrency(trip.balanceAmount, currency)}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Trip Itinerary / Route */}
            <div className="bg-blue-50/60 rounded-xl p-3.5 border border-blue-100 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2">
                  <Navigation className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">Trip Route</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{trip.tripRoute}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">Duration</span>
                  <span className="text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                    {trip.durationText || `${trip.numberOfDays} Day(s)`}
                  </span>
                </div>
              </div>

              {/* Timings */}
              {(trip.pickupDate || trip.dropoffDate) && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200/50 text-[11px]">
                  <div>
                    <span className="text-slate-500 block font-medium">Pickup:</span>
                    <span className="font-semibold text-slate-800">
                      {trip.pickupDate} {trip.pickupTime ? `at ${trip.pickupTime}` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Drop-off:</span>
                    <span className="font-semibold text-slate-800">
                      {trip.dropoffDate} {trip.dropoffTime ? `at ${trip.dropoffTime}` : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Guest & Driver Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Guest */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Guest Information</span>
                  <p className="font-bold text-slate-900 text-sm truncate">{trip.customerName}</p>
                  {trip.customerPhone ? (
                    <p className="text-slate-600 mt-0.5 font-medium flex items-center text-xs">
                      <Phone className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                      <span>{trip.customerPhone}</span>
                    </p>
                  ) : (
                    <p className="text-slate-400 text-xs italic mt-0.5">Guest passenger</p>
                  )}
                </div>
                {trip.customerPhone && (
                  <a
                    href={`tel:${trip.customerPhone}`}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-md shadow-blue-600/20 border-2 border-blue-500/80 transition-all shrink-0 cursor-pointer group"
                    title={`Call Guest (${trip.customerPhone})`}
                    aria-label="Call Guest"
                  >
                    <Phone className="w-4 h-4 transition-transform group-hover:scale-110" />
                  </a>
                )}
              </div>

              {/* Driver & Vehicle */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Driver & Vehicle</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm truncate">{trip.driverName}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 shrink-0">
                      {trip.vehicleType}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-slate-700 font-semibold mt-0.5">{trip.vehicleNumber}</p>
                </div>
                {trip.driverPhone && (
                  <a
                    href={`tel:${trip.driverPhone}`}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 border-2 border-emerald-500/80 transition-all shrink-0 cursor-pointer group"
                    title={`Call Driver (${trip.driverPhone})`}
                    aria-label="Call Driver"
                  >
                    <Phone className="w-4 h-4 transition-transform group-hover:scale-110" />
                  </a>
                )}
              </div>
            </div>

            {/* Distance / Odometer Details */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Distance Reading</span>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-white p-2 rounded border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 font-sans block">Starting</span>
                  <span className="font-bold text-slate-800">{formatNumber(trip.startingKm)} KM</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 font-sans block">Closing</span>
                  <span className="font-bold text-slate-800">{formatNumber(trip.closingKm)} KM</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 font-sans block">Total Driven</span>
                  <span className="font-bold text-blue-700">{formatNumber(trip.totalKm)} KM</span>
                </div>
              </div>
              {trip.additionalKm > 0 && (
                <p className="text-[11px] text-slate-600 mt-2 text-center font-medium">
                  Included: {formatNumber(trip.includedKm)} KM • Billable Extra: <span className="font-bold text-blue-700">{formatNumber(trip.additionalKm)} KM</span> (@ {currency}{trip.ratePerKm}/KM)
                </p>
              )}
            </div>

            {/* Fare Summary Breakdown */}
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <div className="bg-slate-100 px-3 py-2 font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                Fare Breakdown
              </div>
              <div className="divide-y divide-slate-100 p-3 space-y-2">
                <div className="flex justify-between text-slate-700">
                  <span>Vehicle Hire ({trip.numberOfDays} Days)</span>
                  <span className="font-mono font-semibold">{formatCurrency(trip.vehicleHire, currency)}</span>
                </div>

                {trip.additionalKmAmount > 0 && (
                  <div className="flex justify-between text-slate-700 pt-1.5">
                    <span>Extra KM Charges ({formatNumber(trip.additionalKm)} KM)</span>
                    <span className="font-mono font-semibold">{formatCurrency(trip.additionalKmAmount, currency)}</span>
                  </div>
                )}

                {Boolean(trip.driverBata) && (
                  <div className="flex justify-between text-slate-700 pt-1.5">
                    <span>Driver Allowance / Bata</span>
                    <span className="font-mono font-semibold">{formatCurrency(trip.driverBata, currency)}</span>
                  </div>
                )}

                {Boolean(trip.tollParkingPermit) && (
                  <div className="flex justify-between text-slate-700 pt-1.5">
                    <span>Toll, Parking & Permits</span>
                    <span className="font-mono font-semibold">{formatCurrency(trip.tollParkingPermit, currency)}</span>
                  </div>
                )}

                {Boolean(trip.otherCharges) && (
                  <div className="flex justify-between text-slate-700 pt-1.5">
                    <span>Other Charges</span>
                    <span className="font-mono font-semibold">{formatCurrency(trip.otherCharges, currency)}</span>
                  </div>
                )}

                {Boolean(trip.adjustment) && (
                  <div className="flex justify-between text-slate-700 pt-1.5">
                    <span>Adjustment / Discount</span>
                    <span className="font-mono font-semibold">{formatCurrency(trip.adjustment, currency)}</span>
                  </div>
                )}

                <div className="pt-2 border-t-2 border-slate-900 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Amount</span>
                  <span className="font-mono">{formatCurrency(trip.totalAmount, currency)}</span>
                </div>

                <div className="flex justify-between text-slate-600 text-xs">
                  <span>Advance Received ({trip.paymentMode})</span>
                  <span className="font-mono text-emerald-700 font-semibold">- {formatCurrency(trip.advanceReceived, currency)}</span>
                </div>

                {trip.settlementAmount && trip.settlementAmount > 0 && (
                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>Settlement Paid ({trip.settlementPaymentMode || 'Settled'})</span>
                    <span className="font-mono text-emerald-700 font-semibold">- {formatCurrency(trip.settlementAmount, currency)}</span>
                  </div>
                )}

                <div className={`pt-2 border-t border-slate-200 flex justify-between font-bold text-sm sm:text-base ${
                  isPaid ? 'text-emerald-700' : 'text-blue-700'
                }`}>
                  <span>{isPaid ? 'PAID IN FULL' : 'BALANCE DUE'}</span>
                  <span className="font-mono">{formatCurrency(Math.max(0, trip.balanceAmount), currency)}</span>
                </div>
              </div>
            </div>

            {/* Instant UPI Payment Box for Guest if Pending */}
            {!isPaid && companySettings.upiId && (
              <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-4 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-blue-300" />
                    <span className="font-bold text-sm">Instant UPI Payment</span>
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
                    {formatCurrency(trip.balanceAmount, currency)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-xs">
                  {qrCodeImgUrl && (
                    <img 
                      src={qrCodeImgUrl} 
                      alt="UPI QR Code" 
                      className="w-24 h-24 bg-white p-1.5 rounded-lg shrink-0 shadow-xs" 
                    />
                  )}
                  <div className="text-center sm:text-left text-xs space-y-1">
                    <p className="font-bold text-white">Scan with Google Pay, PhonePe, Paytm, or BHIM</p>
                    <p className="text-blue-200 font-mono text-[11px]">UPI ID: {companySettings.upiId}</p>
                    <p className="text-[10px] text-blue-300">Account: {companySettings.upiName || companySettings.companyName}</p>
                    
                    {/* Direct UPI App link on mobile devices */}
                    <a
                      href={upiUrl}
                      className="inline-flex items-center px-3 py-1.5 mt-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5 mr-1" />
                      Pay via UPI App
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Note / Terms */}
            <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
              Verified digital invoice issued by {companySettings.companyName}.
            </div>

          </div>

        </div>

        {/* Modal Action Footer: Optimized for Share & Download */}
        <div className="bg-white border-t border-slate-200 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close View
            </button>
            <button
              onClick={handleCopyLink}
              title="Copy online invoice link"
              className="px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* 1. Primary: Share to WhatsApp */}
            <button
              id="btn-guest-modal-whatsapp"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer"
              title="Share digital invoice to WhatsApp"
            >
              <MessageCircle className="w-4 h-4 mr-1.5" />
              <span>Share to WhatsApp</span>
            </button>

            {/* 2. Download PDF */}
            <button
              id="btn-guest-modal-download"
              onClick={onDownloadPdf}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
              title="Download official PDF copy"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
