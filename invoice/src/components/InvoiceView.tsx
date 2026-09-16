import React, { useRef, useState } from 'react';
import { TripRecord, CompanySettings } from '../types';
import { formatCurrency, formatNumber, generateWhatsAppMessage, generateUpiPaymentUrl } from '../utils/calculations';
import { TravelCareLogo } from './TravelCareLogo';
import { ShareInvoiceModal } from './ShareInvoiceModal';
import { generateInvoicePdf, generateInvoiceImage } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';
import { 
  Printer, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Edit3, 
  ArrowLeft, 
  Car, 
  Phone, 
  Mail, 
  Globe,
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  FileCheck, 
  ExternalLink,
  Image as ImageIcon,
  Eye,
  Smartphone,
  Send,
  HelpCircle,
  FileText,
  CreditCard,
  Sparkles,
  AlertCircle,
  Link,
  MessageCircle
} from 'lucide-react';

interface InvoiceViewProps {
  trip: TripRecord;
  companySettings: CompanySettings;
  onEditTrip: (trip: TripRecord) => void;
  onBackToNewTrip: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
  trip,
  companySettings,
  onEditTrip,
  onBackToNewTrip,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isSharingPdf, setIsSharingPdf] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showShareHelpModal, setShowShareHelpModal] = useState(false);
  const [shareSuccessNotice, setShareSuccessNotice] = useState<string | null>(null);

  const currency = companySettings.currencySymbol || '₹';
  const isPaid = trip.balanceAmount <= 0;
  const upiUrl = generateUpiPaymentUrl(companySettings, trip);
  const qrCodeImgUrl = upiUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}&margin=10`
    : '';

  // Core helper: generates jsPDF object with optimal resolution and A4 fit
  const createPdfDocument = async () => {
    return generateInvoicePdf(trip, companySettings);
  };

  // 1. DIRECT PDF SHARE (Native Web Share with File - triggers WhatsApp directly with PDF attached)
  const handleDirectSharePdf = async () => {
    try {
      setIsSharingPdf(true);
      const { filename, blob } = await createPdfDocument();
      const pdfFile = new File([blob], filename, { type: 'application/pdf' });

      // Check if Web Share API with files is supported by current browser
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: `Trip Invoice - ${trip.billNo}`,
          text: `Trip Invoice ${trip.billNo} for ${trip.customerName} | ${companySettings.companyName}`,
        });
        setShareSuccessNotice('PDF shared successfully!');
        setTimeout(() => setShareSuccessNotice(null), 3500);
      } else {
        // Fallback for browsers that don't support file sharing (e.g. desktop Chrome)
        // Automatically download the PDF and offer WhatsApp Web share
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setShowShareHelpModal(true);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing PDF:', err);
        setShowShareHelpModal(true);
      }
    } finally {
      setIsSharingPdf(false);
    }
  };

  // 2. DOWNLOAD PDF FILE
  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    try {
      setIsExportingPdf(true);
      const { pdf, filename } = await createPdfDocument();
      pdf.save(filename);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
      setShareSuccessNotice('PDF downloaded successfully!');
      setTimeout(() => setShareSuccessNotice(null), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print(); // Fallback to browser print
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 3. OPEN / PREVIEW PDF IN NEW BROWSER TAB
  const handlePreviewPdfInNewTab = async () => {
    try {
      setIsExportingPdf(true);
      const { blob } = await createPdfDocument();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Error previewing PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 4. DOWNLOAD PNG IMAGE
  const handleDownloadImage = async () => {
    try {
      setIsExportingPdf(true);
      const { dataUrl, filename } = await generateInvoiceImage(trip, companySettings);
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      setShareSuccessNotice('Image receipt downloaded!');
      setTimeout(() => setShareSuccessNotice(null), 3000);
    } catch (err) {
      console.error('Error exporting image:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 5. DIRECT VECTOR PRINT
  const handlePrint = () => {
    window.print();
  };

  // 6. COPY TEXT SUMMARY
  const handleCopyText = async () => {
    const message = generateWhatsAppMessage(trip, companySettings);
    try {
      await navigator.clipboard.writeText(message);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Toast Notification */}
      {shareSuccessNotice && (
        <div className="no-print fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{shareSuccessNotice}</span>
        </div>
      )}

      {/* Top Action Toolbar (Hidden in print) */}
      <div className="no-print mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Invoice status info */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToNewTrip}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
            title="Back to Trip Form"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {trip.billNo}
              </span>
            </div>
            <p className="text-xs text-slate-500">{trip.customerName} • {trip.tripRoute}</p>
          </div>
        </div>

        {/* Right: Primary Actions - Streamlined Share & Download Flow */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* SHARE TO WHATSAPP / SHARE DIGITAL INVOICE (Primary Emerald CTA) */}
          <button
            id="btn-share-hub"
            onClick={() => setShowShareModal(true)}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-sm transition-all cursor-pointer gap-1.5"
            title="Share Digital Invoice to WhatsApp Number"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Share & WhatsApp</span>
          </button>

          {/* DOWNLOAD PDF (Primary Slate / Document Export CTA) */}
          <button
            id="btn-download-pdf"
            disabled={isExportingPdf}
            onClick={handleDownloadPdf}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] shadow-xs transition-all cursor-pointer disabled:opacity-50 gap-1.5"
            title="Download official PDF to device"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>{isExportingPdf ? 'Exporting...' : 'Download PDF'}</span>
          </button>

          {/* EDIT TRIP (Amber / Modification) */}
          <button
            id="btn-edit-trip"
            onClick={() => onEditTrip(trip)}
            className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer gap-1"
            title="Edit trip details and recalculate"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
            <span>Edit</span>
          </button>

          {/* COPY TEXT SUMMARY (Slate / Quick Clipboard) */}
          <button
            id="btn-copy-summary"
            onClick={handleCopyText}
            className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer gap-1"
            title={copiedText ? "Copied!" : "Copy Text Summary"}
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>

        </div>
      </div>

      {/* Guest Viewing & Sharing Info Banner */}
      <div className="no-print mb-4 bg-linear-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">Digital Guest Invoice Experience:</span>
            <span className="text-slate-600 text-[11px]">
              Share the instant digital invoice directly to client's <b>WhatsApp number</b> with online view, UPI payment, & download.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer inline-flex items-center space-x-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Share to WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Document View Canvas Area */}
      <div className="canvas-container bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] p-2 sm:p-6 rounded-xl border border-slate-200">
        
        {/* Printable Invoice Sheet */}
        <div 
          ref={invoiceRef}
          id="invoice-document"
          className="invoice-paper max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-lg p-5 sm:p-8 text-slate-900 relative overflow-hidden"
        >
          {/* Company Watermark Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
            <div className="w-[420px] sm:w-[500px] pointer-events-none">
              <TravelCareLogo watermark customLogoUrl={companySettings.logoUrl} />
            </div>
          </div>

          {/* Invoice Header */}
          <div className="relative z-10 border-b-2 border-slate-900 pb-4 mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-2">
                {/* Official Logo Banner */}
                <div className="flex items-center">
                  <TravelCareLogo
                    size="lg"
                    showText={true}
                    customLogoUrl={companySettings.logoUrl}
                    className="h-14 sm:h-18 w-auto max-w-[280px] sm:max-w-[340px]"
                  />
                </div>
                
                <div className="text-xs text-slate-600 space-y-0.5">
                  <p className="font-medium text-slate-500">{companySettings.tagline}</p>
                  <p className="flex items-center"><MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" /> {companySettings.address}</p>
                  <p className="flex flex-wrap items-center gap-x-2">
                    <span className="flex items-center"><Phone className="w-3 h-3 mr-1 text-slate-400 shrink-0" /> {companySettings.phone}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center"><Mail className="w-3 h-3 mr-1 text-slate-400 shrink-0" /> {companySettings.email || 'travelcare598@gmail.com'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center"><Globe className="w-3 h-3 mr-1 text-slate-400 shrink-0" /> {companySettings.website || 'travelcaretours.in'}</span>
                  </p>
                  {companySettings.gstNo && (
                    <p className="font-mono text-slate-500">GSTIN / Reg No: {companySettings.gstNo}</p>
                  )}
                </div>
              </div>

              {/* Bill Meta */}
              <div className="text-left sm:text-right sm:self-end mt-1 sm:mt-0">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">TRIP BILL / TAX INVOICE</span>
                <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-0.5">{trip.billNo}</div>
                <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                  {trip.pickupDate && (
                    <div><b>Pickup:</b> {trip.pickupDate} {trip.pickupTime ? `at ${trip.pickupTime}` : ''}</div>
                  )}
                  {trip.dropoffDate && (
                    <div><b>Drop-off:</b> {trip.dropoffDate} {trip.dropoffTime ? `at ${trip.dropoffTime}` : ''}</div>
                  )}
                  <div><b>Duration:</b> <span className="font-semibold text-blue-700">{trip.durationText || `${trip.numberOfDays} Day(s)`}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Driver / Vehicle Meta Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Customer Details */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Billed To (Customer)</span>
              <div className="font-bold text-xs sm:text-sm text-slate-900">{trip.customerName}</div>
              {trip.customerPhone && (
                <div className="text-xs text-slate-600 flex items-center mt-0.5">
                  <Phone className="w-3 h-3 mr-1 text-slate-400" />
                  <span>{trip.customerPhone}</span>
                </div>
              )}
              <div className="text-xs text-slate-700 mt-1 font-medium truncate" title={trip.tripRoute}>
                <b>Trip Route:</b> {trip.tripRoute}
              </div>
            </div>

            {/* Vehicle & Driver Details */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Vehicle & Driver Profile</span>
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{trip.vehicleNumber}</span>
                  <span className="ml-2 text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    {trip.vehicleType}
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-600 mt-1">
                <b>Driver Name:</b> {trip.driverName} {trip.driverPhone ? `(${trip.driverPhone})` : ''}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                <b>Tariff:</b> {currency}{trip.dailyPackageRate}/day • {currency}{trip.ratePerKm}/extra KM
              </div>
            </div>
          </div>

          {/* Odometer & Mileage Table */}
          <div className="mb-4">
            <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">Distance & Odometer Breakdown</h2>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Starting KM</th>
                    <th className="py-2 px-3">Closing KM</th>
                    <th className="py-2 px-3 text-center">Total Distance</th>
                    <th className="py-2 px-3 text-center">Included Package KM</th>
                    <th className="py-2 px-3 text-right">Billable Extra KM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                  <tr className="bg-white">
                    <td className="py-2 px-3 font-semibold">{formatNumber(trip.startingKm)} KM</td>
                    <td className="py-2 px-3 font-semibold">{formatNumber(trip.closingKm)} KM</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-900">
                      {formatNumber(trip.totalKm)} KM
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600">{formatNumber(trip.includedKm)} KM</td>
                    <td className="py-2 px-3 text-right font-bold text-blue-700">
                      {formatNumber(trip.additionalKm)} KM
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Itemized Billing & Fare Table */}
          <div className="mb-4">
            <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">Itemized Fare Calculation</h2>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-white font-semibold">
                  <tr>
                    <th className="py-2 px-3">Particulars / Description</th>
                    <th className="py-2 px-2 text-center">Unit / Days</th>
                    <th className="py-2 px-2 text-right">Rate ({currency})</th>
                    <th className="py-2 px-3 text-right">Amount ({currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {/* 1. Vehicle Hire */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-medium">
                      Vehicle Hire Charges ({trip.vehicleType} - {trip.vehicleNumber})
                    </td>
                    <td className="py-2 px-2 text-center font-mono">{trip.numberOfDays} Day(s)</td>
                    <td className="py-2 px-2 text-right font-mono">{formatNumber(trip.dailyPackageRate)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">
                      {formatCurrency(trip.vehicleHire, currency)}
                    </td>
                  </tr>

                  {/* 2. Extra Kilometers */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-medium">
                      Additional Distance ({formatNumber(trip.additionalKm)} KM beyond {formatNumber(trip.includedKm)} included KM)
                    </td>
                    <td className="py-2 px-2 text-center font-mono">{formatNumber(trip.additionalKm)} KM</td>
                    <td className="py-2 px-2 text-right font-mono">{formatNumber(trip.ratePerKm)}/KM</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">
                      {formatCurrency(trip.additionalKmAmount, currency)}
                    </td>
                  </tr>

                  {/* 3. Driver Bata */}
                  {Boolean(trip.driverBata) && (
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium">Driver Bata / Outstation Daily Allowance</td>
                      <td className="py-2 px-2 text-center font-mono">{trip.numberOfDays} Day(s)</td>
                      <td className="py-2 px-2 text-right font-mono">-</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">
                        {formatCurrency(trip.driverBata, currency)}
                      </td>
                    </tr>
                  )}

                  {/* 4. Toll / Parking / Permit */}
                  {Boolean(trip.tollParkingPermit) && (
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium">Toll Gate, Parking & Interstate Permits</td>
                      <td className="py-2 px-2 text-center font-mono">-</td>
                      <td className="py-2 px-2 text-right font-mono">-</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">
                        {formatCurrency(trip.tollParkingPermit, currency)}
                      </td>
                    </tr>
                  )}

                  {/* 5. Other Charges */}
                  {Boolean(trip.otherCharges) && (
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium">Other Miscellaneous Trip Charges</td>
                      <td className="py-2 px-2 text-center font-mono">-</td>
                      <td className="py-2 px-2 text-right font-mono">-</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">
                        {formatCurrency(trip.otherCharges, currency)}
                      </td>
                    </tr>
                  )}

                  {/* 6. Adjustment */}
                  {Boolean(trip.adjustment) && (
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium">Round off / Special Adjustment</td>
                      <td className="py-2 px-2 text-center font-mono">-</td>
                      <td className="py-2 px-2 text-right font-mono">-</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">
                        {formatCurrency(trip.adjustment, currency)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary & UPI QR Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start mb-4">
            
            {/* Left Column: Remarks & UPI Payment QR */}
            <div className="md:col-span-7 space-y-3">
              {trip.remarks && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-0.5">Remarks / Trip Notes:</span>
                  <p>{trip.remarks}</p>
                </div>
              )}

              {/* Instant UPI Payment Link */}
              {!isPaid && upiUrl && (
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-800">
                    <span className="font-bold text-slate-900 block text-xs">Pending Balance ({formatCurrency(trip.balanceAmount, currency)})</span>
                    <p className="text-slate-500 text-[11px]">Instant redirection to UPI App</p>
                  </div>
                  <a
                    href={upiUrl}
                    id="btn-invoice-pay-upi"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay with UPI</span>
                  </a>
                </div>
              )}

              {/* Settlement info if settled */}
              {(trip.status === 'closed' || trip.status === 'settled' || (trip.settlementDate && isPaid)) && (
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Trip Settled & Closed:</span>
                    <span className="ml-1 text-[11px]">
                      Remaining balance settled {trip.settlementDate ? `on ${trip.settlementDate}` : ''} ({trip.settlementPaymentMode || 'Paid in Full'}).
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Calculations Grand Totals */}
            <div className="md:col-span-5 bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Gross Total Amount</span>
                <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                  {formatCurrency(trip.totalAmount, currency)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Advance Paid ({trip.paymentMode})</span>
                <span className="font-mono font-bold text-emerald-700">
                  - {formatCurrency(trip.advanceReceived, currency)}
                </span>
              </div>

              {trip.settlementAmount && trip.settlementAmount > 0 && (
                <div className="flex justify-between items-center text-slate-600">
                  <span>Settlement Paid ({trip.settlementPaymentMode || 'Final'})</span>
                  <span className="font-mono font-bold text-emerald-700">
                    - {formatCurrency(trip.settlementAmount, currency)}
                  </span>
                </div>
              )}

              <div className="pt-1.5 border-t-2 border-slate-900 flex justify-between items-center font-bold text-slate-900 text-sm">
                <span>BALANCE DUE</span>
                <span className={`font-mono text-sm sm:text-base font-bold ${isPaid ? 'text-emerald-700' : 'text-blue-600'}`}>
                  {formatCurrency(Math.max(0, trip.balanceAmount), currency)}
                </span>
              </div>
            </div>

          </div>

          {/* Terms & Conditions */}
          <div className="border-t border-slate-200 pt-2.5 mb-3 text-[9.5px] text-slate-500 space-y-0.5">
            <span className="font-bold uppercase tracking-wider text-slate-700 block">Terms & Conditions:</span>
            {companySettings.termsAndConditions.map((term, index) => (
              <p key={index}>• {term}</p>
            ))}
          </div>

          {/* Footer Note */}
          <div className="text-center text-[9.5px] text-slate-400 border-t border-slate-100 pt-2">
            This is a computer generated invoice for {companySettings.companyName}.
          </div>

        </div>

      </div>

      {/* Comprehensive Share Invoice Modal */}
      {showShareModal && (
        <ShareInvoiceModal
          trip={trip}
          companySettings={companySettings}
          onClose={() => setShowShareModal(false)}
          onDownloadPdf={handleDownloadPdf}
          onDirectSharePdf={handleDirectSharePdf}
          onPrint={handlePrint}
        />
      )}

      {/* Share Helper / Fallback Modal (If native file sharing isn't supported on desktop) */}
      {showShareHelpModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">PDF Ready for WhatsApp</h3>
                <p className="text-xs text-slate-500">Your PDF invoice has been generated & downloaded</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <p className="font-medium text-slate-800">
                📁 <b>Invoice File Downloaded:</b> <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">Invoice_{trip.billNo}.pdf</code>
              </p>
              <p className="text-slate-600">
                On desktop browsers, you can easily attach this downloaded PDF to any WhatsApp chat, or open WhatsApp Web below:
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  const message = generateWhatsAppMessage(trip, companySettings);
                  window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
                  setShowShareHelpModal(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Open WhatsApp Web</span>
              </button>

              <button
                onClick={handlePreviewPdfInNewTab}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View PDF in Browser</span>
              </button>

              <button
                onClick={() => setShowShareHelpModal(false)}
                className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
