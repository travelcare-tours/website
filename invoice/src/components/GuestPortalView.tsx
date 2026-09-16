import React, { useRef, useState } from 'react';
import { TripRecord, CompanySettings } from '../types';
import { formatCurrency, formatNumber, generateUpiPaymentUrl, generateWhatsAppMessage } from '../utils/calculations';
import { TravelCareLogo } from './TravelCareLogo';
import { generateInvoicePdf } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail,
  Globe,
  MapPin, 
  Download, 
  Printer, 
  CreditCard, 
  Navigation, 
  ArrowLeft,
  Calendar,
  Sparkles,
  ExternalLink,
  Car,
  FileCheck,
  Check
} from 'lucide-react';

interface GuestPortalViewProps {
  trip: TripRecord;
  companySettings: CompanySettings;
  onExitGuestMode?: () => void;
}

export const GuestPortalView: React.FC<GuestPortalViewProps> = ({
  trip,
  companySettings,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const currency = companySettings.currencySymbol || '₹';
  const isPaid = trip.balanceAmount <= 0;
  const upiUrl = generateUpiPaymentUrl(companySettings, trip);

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      const { pdf, filename } = await generateInvoicePdf(trip, companySettings);
      pdf.save(filename);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (e) {
      console.error('PDF download error:', e);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-6 px-3 sm:px-6 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full space-y-4">

        {/* Printable White Receipt Document */}
        <div 
          ref={receiptRef}
          id="guest-invoice-card"
          className="bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-5 overflow-hidden"
        >
          {/* Header Brand */}
          <div className="text-center pb-4 border-b border-slate-200">
            <div className="flex justify-center mb-3">
              <TravelCareLogo
                size="lg"
                showText={true}
                customLogoUrl={companySettings.logoUrl}
                className="h-16 sm:h-20 md:h-24 w-auto max-w-[320px] sm:max-w-[400px] object-contain"
              />
            </div>
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight">{companySettings.companyName}</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">{companySettings.tagline}</p>
            
            {/* Contact Channels: Phone, Email, Website - cleanly spaced without trailing dots */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-5 gap-y-1.5 text-xs text-slate-600 mt-2.5 font-medium">
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

            {companySettings.gstNo && (
              <p className="text-[11px] text-slate-400 font-mono mt-1">GSTIN: {companySettings.gstNo}</p>
            )}
          </div>

          {/* Invoice ID & Status Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Invoice Number</span>
              <span className="font-mono font-bold text-slate-900 text-base">{trip.billNo}</span>
            </div>
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}>
                {isPaid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                    Paid in Full
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-1.5 text-amber-600" />
                    Balance Due: {formatCurrency(trip.balanceAmount, currency)}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Trip Itinerary / Schedule */}
          <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-100 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start space-x-2">
                <Navigation className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">Route</span>
                  <p className="text-sm sm:text-base font-bold text-slate-900">{trip.tripRoute}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">Duration</span>
                <span className="text-xs font-bold text-blue-700 bg-white px-2.5 py-0.5 rounded border border-blue-200">
                  {trip.durationText || `${trip.numberOfDays} Day(s)`}
                </span>
              </div>
            </div>

            {(trip.pickupDate || trip.dropoffDate) && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200/60 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Pickup:</span>
                  <span className="font-semibold text-slate-800">
                    {trip.pickupDate} {trip.pickupTime ? `at ${trip.pickupTime}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Drop-off:</span>
                  <span className="font-semibold text-slate-800">
                    {trip.dropoffDate} {trip.dropoffTime ? `at ${trip.dropoffTime}` : ''}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Guest & Driver Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Billed To (Guest)</span>
                <p className="font-bold text-slate-900 text-sm truncate">{trip.customerName}</p>
                {trip.customerPhone ? (
                  <p className="text-slate-600 mt-0.5 flex items-center font-medium">
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
                  className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-md shadow-blue-600/20 border-2 border-blue-500/80 transition-all shrink-0 cursor-pointer group"
                  title={`Call Guest (${trip.customerPhone})`}
                  aria-label="Call Guest"
                >
                  <Phone className="w-4 h-4 transition-transform group-hover:scale-110" />
                </a>
              )}
            </div>

            <div className="p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Vehicle & Driver</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm truncate">{trip.driverName}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 shrink-0">
                    {trip.vehicleType}
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-700 font-semibold mt-0.5">{trip.vehicleNumber}</p>
              </div>
              {trip.driverPhone && (
                <a
                  href={`tel:${trip.driverPhone}`}
                  className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 border-2 border-emerald-500/80 transition-all shrink-0 cursor-pointer group"
                  title={`Call Driver (${trip.driverPhone})`}
                  aria-label="Call Driver"
                >
                  <Phone className="w-4 h-4 transition-transform group-hover:scale-110" />
                </a>
              )}
            </div>
          </div>

          {/* Distance Table */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">Distance Breakdown</span>
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-sans block">Starting</span>
                <span className="font-bold text-slate-800">{formatNumber(trip.startingKm)} KM</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-sans block">Closing</span>
                <span className="font-bold text-slate-800">{formatNumber(trip.closingKm)} KM</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-sans block">Total Distance</span>
                <span className="font-bold text-blue-700">{formatNumber(trip.totalKm)} KM</span>
              </div>
            </div>
            {trip.additionalKm > 0 && (
              <p className="text-[11px] text-slate-600 mt-2 text-center font-medium">
                Included: {formatNumber(trip.includedKm)} KM • Extra: <span className="font-bold text-blue-700">{formatNumber(trip.additionalKm)} KM</span> (@ {currency}{trip.ratePerKm}/KM)
              </p>
            )}
          </div>

          {/* Itemized Fare Breakdown */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-900 text-white px-3.5 py-2 font-bold uppercase tracking-wider text-[10px]">
              Itemized Fare Calculation
            </div>
            <div className="divide-y divide-slate-100 p-3.5 space-y-2">
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
                <span>Advance Paid ({trip.paymentMode})</span>
                <span className="font-mono text-emerald-700 font-semibold">- {formatCurrency(trip.advanceReceived, currency)}</span>
              </div>

              {trip.settlementAmount && trip.settlementAmount > 0 && (
                <div className="flex justify-between text-slate-600 text-xs">
                  <span>Settlement Paid ({trip.settlementPaymentMode || 'Settled'})</span>
                  <span className="font-mono text-emerald-700 font-semibold">- {formatCurrency(trip.settlementAmount, currency)}</span>
                </div>
              )}

              <div className={`pt-2.5 border-t border-slate-200 flex justify-between font-bold text-base ${
                isPaid ? 'text-emerald-700' : 'text-blue-700'
              }`}>
                <span>{isPaid ? 'PAID IN FULL' : 'BALANCE DUE'}</span>
                <span className="font-mono">{formatCurrency(Math.max(0, trip.balanceAmount), currency)}</span>
              </div>
            </div>
          </div>

          {/* Instant UPI Payment Box */}
          {!isPaid && upiUrl && (
            <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-blue-300" />
                  <span className="font-bold text-sm sm:text-base">Instant UPI Payment</span>
                </div>
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {formatCurrency(trip.balanceAmount, currency)}
                </span>
              </div>

              {/* Single Direct Button / Badge to redirect into UPI App */}
              <a
                href={upiUrl}
                id="btn-guest-upi-pay"
                className="flex items-center justify-center w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay with UPI App</span>
              </a>
            </div>
          )}

          {/* Action Row: Download PDF Copy */}
          <div className="no-print pt-1 flex justify-center">
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer gap-2 border border-slate-200"
              title="Download PDF Bill"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">PDF Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>{isExportingPdf ? 'Exporting PDF...' : 'Download PDF Bill'}</span>
                </>
              )}
            </button>
          </div>

          {/* Footer Terms */}
          <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-400 text-center">
            <p>Thank you for choosing {companySettings.companyName}! Have a safe and pleasant journey.</p>
          </div>

        </div>

        {/* Bottom Support Contacts */}
        <div className="no-print text-center text-xs text-slate-400 py-3 space-y-1">
          <p>Need assistance with this invoice? Contact support at <a href={`tel:${companySettings.phone}`} className="text-blue-400 font-bold underline">{companySettings.phone}</a></p>
          <p className="text-[11px] text-slate-500">© {new Date().getFullYear()} {companySettings.companyName}. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
};
