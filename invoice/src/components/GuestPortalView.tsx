import React, { useRef, useState } from 'react';
import { TripRecord, CompanySettings } from '../types';
import { formatCurrency, formatNumber, generateUpiPaymentUrl, generateWhatsAppMessage } from '../utils/calculations';
import { TravelCareLogo } from './TravelCareLogo';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Clock, 
  Phone, 
  MapPin, 
  Download, 
  Printer, 
  CreditCard, 
  Navigation, 
  ShieldCheck, 
  ArrowLeft,
  Calendar,
  Sparkles,
  ExternalLink,
  Car,
  FileCheck,
  Check,
  MessageCircle
} from 'lucide-react';

interface GuestPortalViewProps {
  trip: TripRecord;
  companySettings: CompanySettings;
  onExitGuestMode?: () => void;
}

export const GuestPortalView: React.FC<GuestPortalViewProps> = ({
  trip,
  companySettings,
  onExitGuestMode,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const currency = companySettings.currencySymbol || '₹';
  const isPaid = trip.balanceAmount <= 0;
  const upiUrl = generateUpiPaymentUrl(companySettings, trip);
  const qrCodeImgUrl = upiUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}&margin=10`
    : '';

  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return;
    try {
      setIsExportingPdf(true);
      const element = receiptRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      const renderHeight = Math.min(imgHeight, pdfHeight);

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, renderHeight, undefined, 'FAST');
      pdf.save(`Invoice_${trip.billNo}.pdf`);

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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-6 px-3 sm:px-6 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full space-y-4">
        
        {/* Top Floating Guest Bar */}
        <div className="no-print flex items-center justify-between bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-3 shadow-lg backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Official Trip Invoice</span>
              <span className="text-[11px] text-slate-400">Issued by {companySettings.companyName}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Share invoice on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Download PDF bill"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 mr-1" />
                  <span>{isExportingPdf ? 'Exporting...' : 'PDF Bill'}</span>
                </>
              )}
            </button>

            {onExitGuestMode && (
              <button
                onClick={onExitGuestMode}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-1 transition-colors cursor-pointer ml-1"
                title="Go to staff / admin portal"
              >
                Admin
              </button>
            )}
          </div>
        </div>

        {/* Printable White Receipt Document */}
        <div 
          ref={receiptRef}
          id="guest-invoice-card"
          className="bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-5 overflow-hidden"
        >
          {/* Header Brand */}
          <div className="text-center pb-4 border-b border-slate-200">
            <div className="flex justify-center mb-2">
              <TravelCareLogo
                size="md"
                showText={true}
                customLogoUrl={companySettings.logoUrl}
                className="h-12 sm:h-14 w-auto max-w-[260px]"
              />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">{companySettings.companyName}</h1>
            <p className="text-xs text-slate-500 font-medium">{companySettings.tagline}</p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-2 font-medium">
              <a href={`tel:${companySettings.phone}`} className="hover:text-blue-600 inline-flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {companySettings.phone}
              </a>
              <span>•</span>
              <span className="inline-flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
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
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Billed To (Guest)</span>
              <p className="font-bold text-slate-900 text-sm">{trip.customerName}</p>
              {trip.customerPhone && (
                <p className="text-slate-600 mt-0.5 flex items-center font-medium">
                  <Phone className="w-3 h-3 mr-1 text-slate-400" />
                  {trip.customerPhone}
                </p>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Vehicle & Driver</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{trip.driverName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    {trip.vehicleType}
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-700 font-semibold mt-0.5">{trip.vehicleNumber}</p>
              </div>
              {trip.driverPhone && (
                <a
                  href={`tel:${trip.driverPhone}`}
                  className="mt-2 inline-flex items-center justify-center px-2.5 py-1 rounded bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 text-[11px] font-bold transition-colors"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Call Driver ({trip.driverPhone})
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
          {!isPaid && companySettings.upiId && (
            <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-blue-300" />
                  <span className="font-bold text-sm sm:text-base">Instant UPI Payment</span>
                </div>
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {formatCurrency(trip.balanceAmount, currency)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/10 p-3.5 rounded-xl backdrop-blur-xs">
                {qrCodeImgUrl && (
                  <img 
                    src={qrCodeImgUrl} 
                    alt="UPI QR Code" 
                    className="w-28 h-28 bg-white p-1.5 rounded-xl shrink-0 shadow-md" 
                  />
                )}
                <div className="text-center sm:text-left text-xs space-y-1.5 flex-1">
                  <p className="font-bold text-white text-sm">Scan to Pay via Any UPI App</p>
                  <p className="text-blue-200">Supports Google Pay, PhonePe, Paytm, and BHIM</p>
                  <p className="font-mono text-xs text-blue-300 font-semibold">UPI ID: {companySettings.upiId}</p>
                  
                  {/* Direct UPI Mobile Link */}
                  <a
                    href={upiUrl}
                    className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    <CreditCard className="w-4 h-4 mr-1.5" />
                    Pay with UPI App
                  </a>
                </div>
              </div>
            </div>
          )}

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
