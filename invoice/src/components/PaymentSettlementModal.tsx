import React, { useState, useEffect } from 'react';
import { TripRecord, CompanySettings } from '../types';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { CustomDropdown } from './CustomDropdown';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  Calendar, 
  FileText, 
  ArrowRight, 
  BadgeCheck, 
  Receipt
} from 'lucide-react';

interface PaymentSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripRecord | null;
  currency: string;
  onSaveSettlement: (updatedTrip: TripRecord) => void;
}

export const PaymentSettlementModal: React.FC<PaymentSettlementModalProps> = ({
  isOpen,
  onClose,
  trip,
  currency,
  onSaveSettlement,
}) => {
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [settlementDate, setSettlementDate] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer'>('UPI');
  const [notes, setNotes] = useState<string>('');
  const [markAsClosed, setMarkAsClosed] = useState<boolean>(true);

  useEffect(() => {
    if (trip) {
      // Default to remaining balance amount
      const remaining = Math.max(0, trip.balanceAmount);
      setPaidAmount(trip.settlementAmount && trip.settlementAmount > 0 ? trip.settlementAmount : remaining);
      setSettlementDate(trip.settlementDate || new Date().toISOString().split('T')[0]);
      setPaymentMode(trip.settlementPaymentMode || 'UPI');
      setNotes(trip.settlementNotes || '');
      setMarkAsClosed(trip.status === 'closed' || remaining <= 0 || true);
    }
  }, [trip]);

  if (!isOpen || !trip) return null;

  const currentOutstanding = Math.max(0, trip.balanceAmount);
  const remainingAfterThisPayment = Math.max(0, currentOutstanding - (Number(paidAmount) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const settledAmountNum = Number(paidAmount) || 0;
    
    // Balance calculation: original total - advance - newly settled amount
    const newBalance = Math.max(0, trip.totalAmount - trip.advanceReceived - settledAmountNum);
    const newStatus = (markAsClosed || newBalance <= 0) ? 'closed' : 'pending';

    const updatedTrip: TripRecord = {
      ...trip,
      settlementAmount: settledAmountNum,
      settlementDate: settlementDate,
      settlementPaymentMode: paymentMode,
      settlementNotes: notes.trim(),
      status: newStatus,
      balanceAmount: newBalance,
    };

    onSaveSettlement(updatedTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Record Payment Settlement</h2>
              <p className="text-xs text-slate-300">Bill No: {trip.billNo} • {trip.customerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            
            {/* Financial Status Summary */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Billed</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-slate-900">
                  {formatCurrency(trip.totalAmount, currency)}
                </span>
              </div>
              <div className="border-x border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Advance Paid</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-emerald-700">
                  {formatCurrency(trip.advanceReceived, currency)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Due Balance</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-rose-600">
                  {formatCurrency(currentOutstanding, currency)}
                </span>
              </div>
            </div>

            {/* Input 1: Amount Paid Now */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Settlement Amount Paid ({currency}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {currency}
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Amount received to balance the customer ledger.
              </p>
            </div>

            {/* Input 2 & 3: Date & Payment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Payment Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={settlementDate}
                    onChange={(e) => setSettlementDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Payment Mode *
                </label>
                <CustomDropdown
                  value={paymentMode}
                  onChange={(val) => setPaymentMode(val as any)}
                  options={[
                    { value: 'UPI', label: 'UPI', sublabel: 'Google Pay / PhonePe' },
                    { value: 'Cash', label: 'Cash', sublabel: 'Cash directly received' },
                    { value: 'Bank Transfer', label: 'Bank Transfer', sublabel: 'NEFT / IMPS' },
                    { value: 'Card', label: 'Card', sublabel: 'Credit / Debit Card' },
                  ]}
                  triggerClassName="w-full px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs"
                />
              </div>
            </div>

            {/* Input 4: Remarks / Note */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Settlement Notes / Transaction ID
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Paid to driver at dropoff / UTR #9482..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Status Option */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 flex items-center space-x-3">
              <input
                type="checkbox"
                id="markClosedCheck"
                checked={markAsClosed}
                onChange={(e) => setMarkAsClosed(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="markClosedCheck" className="text-xs text-slate-800 cursor-pointer select-none">
                <span className="font-bold block text-slate-900">Mark Trip as "Closed & Ledger Balanced"</span>
                <span className="text-slate-500 text-[11px]">
                  Updates bill status from Pending to Closed on this date.
                </span>
              </label>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <BadgeCheck className="w-4 h-4" />
              <span>Confirm Payment & Close Bill</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
