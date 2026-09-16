import React from 'react';
import { TripRecord, CompanySettings } from '../types';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { TravelCareLogo } from './TravelCareLogo';
import { MapPin, Phone, Mail, Globe, CheckCircle2 } from 'lucide-react';

interface OfficialInvoiceDocumentProps {
  trip: TripRecord;
  companySettings: CompanySettings;
  className?: string;
}

/**
 * Standard A4 Official Tax Invoice Document
 * Designed with fixed 794px width (standard A4 proportion at 96 DPI)
 * guaranteeing identical, un-distorted rendering on mobile and desktop devices.
 */
export const OfficialInvoiceDocument: React.FC<OfficialInvoiceDocumentProps> = ({
  trip,
  companySettings,
  className = '',
}) => {
  const currency = companySettings.currencySymbol || '₹';
  const isPaid = trip.balanceAmount <= 0;

  return (
    <div
      id="official-invoice-document"
      style={{
        width: '794px',
        minWidth: '794px',
        maxWidth: '794px',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      className={`p-8 bg-white relative overflow-hidden text-slate-900 border border-slate-200 shadow-sm ${className}`}
    >
      {/* Company Watermark Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
        <div className="w-[480px] pointer-events-none">
          <TravelCareLogo watermark customLogoUrl={companySettings.logoUrl} />
        </div>
      </div>

      {/* Invoice Header */}
      <div className="relative z-10 border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex flex-row justify-between items-start gap-4">
          <div className="space-y-1.5 max-w-[480px]">
            {/* Official Logo Banner */}
            <div className="flex items-center mb-1">
              <TravelCareLogo
                size="lg"
                showText={true}
                customLogoUrl={companySettings.logoUrl}
                className="h-16 w-auto max-w-[320px]"
              />
            </div>

            <div className="text-xs text-slate-600 space-y-0.5">
              <p className="font-medium text-slate-500">{companySettings.tagline}</p>
              <p className="flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" /> {companySettings.address}
              </p>
              <p className="flex items-center flex-wrap gap-x-2">
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
          <div className="text-right self-start shrink-0 min-w-[200px]">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
              TRIP BILL / TAX INVOICE
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{trip.billNo}</div>
            <div className="text-xs text-slate-600 mt-1 space-y-0.5">
              {trip.pickupDate && (
                <div>
                  <b>Pickup:</b> {trip.pickupDate} {trip.pickupTime ? `at ${trip.pickupTime}` : ''}
                </div>
              )}
              {trip.dropoffDate && (
                <div>
                  <b>Drop-off:</b> {trip.dropoffDate} {trip.dropoffTime ? `at ${trip.dropoffTime}` : ''}
                </div>
              )}
              <div>
                <b>Duration:</b>{' '}
                <span className="font-semibold text-blue-700">
                  {trip.durationText || `${trip.numberOfDays} Day(s)`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer & Driver / Vehicle Meta Blocks (Side by Side 2-Columns) */}
      <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
        {/* Customer Details */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
            Billed To (Customer)
          </span>
          <div className="font-bold text-sm text-slate-900">{trip.customerName}</div>
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
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
            Vehicle & Driver Profile
          </span>
          <div className="flex justify-between items-center">
            <div>
              <span className="font-mono font-bold text-slate-900 text-sm">{trip.vehicleNumber}</span>
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
      <div className="mb-4 relative z-10">
        <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">
          Distance & Odometer Breakdown
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-200">
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
      <div className="mb-4 relative z-10">
        <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">
          Itemized Fare Calculation
        </h2>
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
              <tr>
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
              <tr>
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
                <tr>
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
                <tr>
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
                <tr>
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
                <tr>
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

      {/* Financial Summary (Grid 12-Cols: Remarks on Left, Calculations on Right) */}
      <div className="grid grid-cols-12 gap-4 items-start mb-4 relative z-10">
        {/* Left Column: Remarks & Payment Notes */}
        <div className="col-span-7 space-y-2.5">
          {trip.remarks && (
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-0.5">Remarks / Trip Notes:</span>
              <p>{trip.remarks}</p>
            </div>
          )}

          {/* Settlement notice */}
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

          {/* Clean Official Payment Notice for Unpaid Invoices */}
          {!isPaid && companySettings.upiId && (
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-0.5">
              <span className="font-bold text-slate-900 block">Payment Information:</span>
              <p className="text-[11px]">
                UPI ID for balance payment:{' '}
                <span className="font-mono font-semibold text-blue-700">{companySettings.upiId}</span>
              </p>
              {companySettings.bankDetails && (
                <p className="text-[11px] text-slate-500 whitespace-pre-line mt-0.5">
                  {companySettings.bankDetails}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Calculations Grand Totals */}
        <div className="col-span-5 bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Gross Total Amount</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
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
            <span className={`font-mono text-base font-bold ${isPaid ? 'text-emerald-700' : 'text-blue-600'}`}>
              {formatCurrency(Math.max(0, trip.balanceAmount), currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="border-t border-slate-200 pt-2.5 mb-3 text-[9.5px] text-slate-500 space-y-0.5 relative z-10">
        <span className="font-bold uppercase tracking-wider text-slate-700 block">Terms & Conditions:</span>
        {companySettings.termsAndConditions.map((term, index) => (
          <p key={index}>• {term}</p>
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center text-[9.5px] text-slate-400 border-t border-slate-100 pt-2 relative z-10">
        This is a computer generated invoice for {companySettings.companyName}.
      </div>
    </div>
  );
};
