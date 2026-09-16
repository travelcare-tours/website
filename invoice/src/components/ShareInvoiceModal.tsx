import React, { useState } from 'react';
import { TripRecord, CompanySettings } from '../types';
import { 
  formatCurrency, 
  formatNumber,
  generateWhatsAppMessage, 
  generateGuestShareUrl 
} from '../utils/calculations';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  QrCode, 
  Smartphone, 
  Link2, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

interface ShareInvoiceModalProps {
  trip: TripRecord;
  companySettings: CompanySettings;
  onClose: () => void;
  onDownloadPdf: () => void;
  onDirectSharePdf: () => void;
  onPrint?: () => void;
  onOpenGuestPortal?: () => void;
}

export const ShareInvoiceModal: React.FC<ShareInvoiceModalProps> = ({
  trip,
  companySettings,
  onClose,
  onDownloadPdf,
  onDirectSharePdf,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [customPhone, setCustomPhone] = useState(trip.customerPhone || '');
  const [showQrCode, setShowQrCode] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const currency = companySettings.currencySymbol || '₹';
  const isPaid = trip.balanceAmount <= 0;
  const guestLink = generateGuestShareUrl(trip);
  const fullWhatsAppText = generateWhatsAppMessage(trip, companySettings, true);

  // High quality QR Code for in-person scanning
  const linkQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(guestLink)}&margin=10`;

  // WhatsApp click handler with phone validation & automatic country code prefix (+91 default for 10-digit Indian numbers)
  const handleOpenWhatsApp = () => {
    const rawPhone = customPhone.trim() || trip.customerPhone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
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
    <div 
      id="modal-share-invoice"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Share Digital Guest Invoice</h2>
              <p className="text-xs text-slate-400 font-medium">Invoice {trip.billNo} • {trip.customerName}</p>
            </div>
          </div>
          <button
            id="btn-close-share-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/60">

          {/* Quick Invoice Glance Summary */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Due</span>
              <span className="font-mono text-base font-bold text-slate-900">
                {formatCurrency(trip.balanceAmount, currency)}
              </span>
            </div>
            <div className="text-right">
              {isPaid ? (
                <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Paid in Full
                </span>
              ) : (
                <span className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  Payment Due
                </span>
              )}
            </div>
          </div>
          
          {/* PRIMARY HERO ACTION: Share Digital Invoice to WhatsApp */}
          <div className="bg-linear-to-br from-emerald-50 via-white to-emerald-50/50 rounded-2xl p-4 sm:p-5 border-2 border-emerald-400/80 shadow-sm space-y-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <span className="inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Primary Action
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                  Send Digital Invoice to WhatsApp
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sends full trip details + secure online link directly to client's phone.
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </div>
            </div>

            {/* Target WhatsApp Number Input Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Client's WhatsApp Number:
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                    +91
                  </span>
                  <input
                    id="input-whatsapp-phone"
                    type="tel"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    placeholder="Enter 10-digit WhatsApp number"
                    className="w-full pl-11 pr-3 py-2 text-xs font-mono font-medium rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Prominent Send to WhatsApp Button */}
            <button
              id="btn-send-whatsapp-client"
              onClick={handleOpenWhatsApp}
              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share to WhatsApp ({customPhone || trip.customerPhone || 'Direct'})</span>
            </button>
          </div>

          {/* Download Official PDF */}
          <button
            id="btn-modal-download-pdf"
            onClick={onDownloadPdf}
            className="w-full p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-200 text-left transition-all flex items-center space-x-3 cursor-pointer group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-xs text-slate-900 block truncate">Download PDF Invoice</span>
              <span className="text-[11px] text-slate-500 block truncate">Save official stamped PDF copy directly to device</span>
            </div>
          </button>

          {/* Digital Guest Web Link Copy Box */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Online Digital Invoice Link</span>
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
              <input
                id="input-guest-share-url"
                type="text"
                readOnly
                value={guestLink}
                className="w-full text-[11px] font-mono text-slate-700 bg-transparent border-none focus:outline-none truncate"
              />
              <button
                id="btn-copy-guest-url"
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 flex items-center space-x-1 cursor-pointer ${
                  copiedLink 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Collapsible More Options: QR Code Scan, Copy Text, Direct PDF App Share */}
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
            <button
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span>More Sharing Options (In-Person QR, Native Share, Text)</span>
              {showMoreOptions ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showMoreOptions && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs animate-in fade-in duration-150">
                {/* QR Code toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">In-Person QR Code</span>
                    <span className="text-[11px] text-slate-500">Scan camera directly from device</span>
                  </div>
                  <button
                    onClick={() => setShowQrCode(!showQrCode)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer"
                  >
                    <QrCode className="w-3 h-3 text-slate-600" />
                    <span>{showQrCode ? 'Hide QR' : 'Show QR'}</span>
                  </button>
                </div>

                {showQrCode && (
                  <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 text-center sm:text-left">
                    <img
                      src={linkQrCodeUrl}
                      alt="Invoice QR"
                      className="w-24 h-24 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs shrink-0"
                    />
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <p className="font-bold text-slate-900">Scan to Open Digital Invoice</p>
                      <p className="text-slate-500">Guest scans this with camera to open instant bill & pay via UPI.</p>
                      <p className="font-mono text-slate-400 text-[10px]">Invoice: {trip.billNo}</p>
                    </div>
                  </div>
                )}

                {/* Direct App Share / Web Share API */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">Share PDF via App</span>
                    <span className="text-[11px] text-slate-500">Uses device share menu (WhatsApp, Email, etc.)</span>
                  </div>
                  <button
                    onClick={onDirectSharePdf}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Share PDF</span>
                  </button>
                </div>

                {/* Copy Formatted Text */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">Copy Text Message</span>
                    <span className="text-[11px] text-slate-500">Full itemized WhatsApp text copy</span>
                  </div>
                  <button
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 cursor-pointer"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Invoice: <b className="font-mono text-slate-800">{trip.billNo}</b>
          </span>
          <button
            id="btn-done-share-modal"
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
