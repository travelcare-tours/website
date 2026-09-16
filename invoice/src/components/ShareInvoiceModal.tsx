import React, { useState } from 'react';
import { TripRecord, CompanySettings } from '../types';
import { 
  formatCurrency, 
  generateWhatsAppMessage, 
  generateGuestShareUrl,
  generateUpiPaymentUrl 
} from '../utils/calculations';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Send, 
  Download, 
  QrCode, 
  Smartphone, 
  FileText, 
  CheckCircle2,
  Sparkles,
  Link,
  MessageCircle
} from 'lucide-react';

interface ShareInvoiceModalProps {
  trip: TripRecord;
  companySettings: CompanySettings;
  onClose: () => void;
  onDownloadPdf: () => void;
  onDirectSharePdf: () => void;
  onPrint: () => void;
  onOpenGuestPortal: () => void;
}

export const ShareInvoiceModal: React.FC<ShareInvoiceModalProps> = ({
  trip,
  companySettings,
  onClose,
  onDownloadPdf,
  onDirectSharePdf,
  onPrint,
  onOpenGuestPortal,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showQrExpanded, setShowQrExpanded] = useState(false);

  const currency = companySettings.currencySymbol || '₹';
  const guestLink = generateGuestShareUrl(trip);
  const fullWhatsAppText = generateWhatsAppMessage(trip, companySettings, true);

  // QR Code URL for the live guest link
  const linkQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(guestLink)}&margin=10`;

  // WhatsApp click handler
  const handleOpenWhatsApp = () => {
    const cleanPhone = trip.customerPhone ? trip.customerPhone.replace(/[^0-9]/g, '') : '';
    let targetPhone = cleanPhone;
    if (targetPhone.length === 10) {
      targetPhone = `91${targetPhone}`;
    }

    const encodedText = encodeURIComponent(fullWhatsAppText);
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
      console.error('Failed to copy link', e);
    }
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(fullWhatsAppText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (e) {
      console.error('Failed to copy text', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Share Invoice with Guest</h2>
              <p className="text-xs text-slate-400">Invoice {trip.billNo} • {trip.customerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-50">
          
          {/* Method 1: Live Guest Web Link (Most Reliable - Works on ANY Phone) */}
          <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">1</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center">
                    <span>Live Guest Web Link</span>
                    <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Recommended
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">Guest clicks link to view official invoice, download PDF & pay via UPI</p>
                </div>
              </div>
            </div>

            {/* Link Box */}
            <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
              <Link className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
              <input
                type="text"
                readOnly
                value={guestLink}
                className="w-full text-xs font-mono text-slate-700 bg-transparent border-none focus:outline-hidden truncate"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 flex items-center space-x-1 cursor-pointer ${
                  copiedLink 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Send on WhatsApp Button */}
              <button
                onClick={handleOpenWhatsApp}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer space-x-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send to WhatsApp {trip.customerPhone ? `(${trip.customerPhone})` : ''}</span>
              </button>

              {/* Test Guest View */}
              <button
                onClick={onOpenGuestPortal}
                className="inline-flex items-center justify-center px-3 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer space-x-1"
                title="Preview how guest will see it"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                <span>Preview Guest View</span>
              </button>
            </div>
          </div>

          {/* Method 2: Share PDF File Directly */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">2</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">PDF Documents</h3>
                <p className="text-xs text-slate-500">Send or download official A4 document with agency stamps</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={onDirectSharePdf}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-left transition-colors flex items-center space-x-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Share PDF File</span>
                  <span className="text-[10px] text-slate-500">Send file via WhatsApp / Apps</span>
                </div>
              </button>

              <button
                onClick={onDownloadPdf}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-left transition-colors flex items-center space-x-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Download PDF</span>
                  <span className="text-[10px] text-slate-500">Save crisp A4 to device</span>
                </div>
              </button>
            </div>
          </div>

          {/* Method 3: In-Person QR Code Scan */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">3</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">In-Person QR Code</h3>
                  <p className="text-xs text-slate-500">Guest scans this with their phone camera</p>
                </div>
              </div>
              <button
                onClick={() => setShowQrExpanded(!showQrExpanded)}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
              >
                {showQrExpanded ? 'Hide QR' : 'Show QR'}
              </button>
            </div>

            {showQrExpanded && (
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center sm:text-left animate-in fade-in duration-150">
                <img
                  src={linkQrCodeUrl}
                  alt="Invoice QR"
                  className="w-28 h-28 bg-white p-1.5 rounded-lg border border-slate-200 shadow-xs shrink-0"
                />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-900">Scan to Open Invoice on Mobile</p>
                  <p className="text-slate-500">Guest can point standard phone camera at this QR code to view the live bill without typing anything.</p>
                  <p className="text-slate-400 font-mono text-[10px]">Invoice: {trip.billNo}</p>
                </div>
              </div>
            )}
          </div>

          {/* Method 4: Copy Formatted Text Message */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">4</span>
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Copy Formatted Text Message</h3>
                <p className="text-[11px] text-slate-500">Full itemized breakdown text with route & total</p>
              </div>
            </div>
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">Total Due: <b>{formatCurrency(trip.balanceAmount, currency)}</b></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
