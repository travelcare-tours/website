import React from 'react';
import { TripRecord, CompanySettings } from '../types';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { 
  Car, 
  IndianRupee, 
  TrendingUp, 
  UserCheck, 
  Wallet
} from 'lucide-react';

interface AnalyticsViewProps {
  trips: TripRecord[];
  companySettings: CompanySettings;
  onSelectTrip: (trip: TripRecord) => void;
}

interface DriverMetric {
  trips: number;
  revenue: number;
  km: number;
  bata: number;
}

interface VehicleMetric {
  trips: number;
  revenue: number;
  km: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  trips,
  companySettings,
  onSelectTrip,
}) => {
  const currency = companySettings.currencySymbol || '₹';

  // Driver metrics
  const driverStats: Record<string, DriverMetric> = {};
  trips.forEach((t) => {
    const driver = t.driverName || 'Unassigned';
    if (!driverStats[driver]) {
      driverStats[driver] = { trips: 0, revenue: 0, km: 0, bata: 0 };
    }
    driverStats[driver].trips += 1;
    driverStats[driver].revenue += (t.totalAmount || 0);
    driverStats[driver].km += (t.totalKm || 0);
    driverStats[driver].bata += (t.driverBata || 0);
  });

  // Vehicle metrics
  const vehicleStats: Record<string, VehicleMetric> = {};
  trips.forEach((t) => {
    const vehicle = `${t.vehicleNumber} (${t.vehicleType})`;
    if (!vehicleStats[vehicle]) {
      vehicleStats[vehicle] = { trips: 0, revenue: 0, km: 0 };
    }
    vehicleStats[vehicle].trips += 1;
    vehicleStats[vehicle].revenue += (t.totalAmount || 0);
    vehicleStats[vehicle].km += (t.totalKm || 0);
  });

  // Payment mode distribution
  const paymentStats: Record<string, number> = {};
  trips.forEach((t) => {
    const mode = t.paymentMode || 'Cash';
    paymentStats[mode] = (paymentStats[mode] || 0) + (t.advanceReceived || 0);
  });

  let totalBata = 0;
  let totalTolls = 0;
  let totalAdvance = 0;
  trips.forEach((t) => {
    totalBata += (t.driverBata || 0);
    totalTolls += (t.tollParkingPermit || 0);
    totalAdvance += (t.advanceReceived || 0);
  });

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }} className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 font-sans">
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }} className="text-lg sm:text-xl font-bold text-slate-900 font-sans tracking-normal">
          Fleet & Earnings Insights
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Overview of driver allocations, vehicle distance, and revenue channels</p>
      </div>

      {/* Driver Performance Cards */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }} className="text-xs sm:text-sm font-bold text-slate-900 mb-3 sm:mb-4 flex items-center space-x-2 font-sans">
          <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
          <span>Driver Breakdown & Allowance (Bata)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {Object.entries(driverStats).map(([name, data]) => (
            <div key={name} className="p-3 sm:p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900 text-xs">{name}</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded bg-slate-200 text-slate-700 font-bold font-mono uppercase tracking-wider">
                  {data.trips} Trip{data.trips > 1 ? 's' : ''}
                </span>
              </div>
              <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Gross Billed:</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(data.revenue, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Distance Covered:</span>
                  <span className="font-mono font-semibold text-slate-800">{formatNumber(data.km)} KM</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-blue-700 font-medium">
                  <span>Driver Bata Paid:</span>
                  <span className="font-mono font-bold">{formatCurrency(data.bata, currency)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Mileage & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Vehicles */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }} className="text-xs sm:text-sm font-bold text-slate-900 mb-3 sm:mb-4 flex items-center space-x-2 font-sans">
            <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            <span>Vehicle Utilization</span>
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(vehicleStats).map(([veh, data]) => (
              <div key={veh} className="p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-900 font-mono text-xs">{veh}</div>
                  <div className="text-slate-500 text-[10px] sm:text-[11px] mt-0.5">{data.trips} Trips Completed</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{formatCurrency(data.revenue, currency)}</div>
                  <div className="text-slate-500 font-mono text-[10px] sm:text-[11px]">{formatNumber(data.km)} KM</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses & Pass-through */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }} className="text-xs sm:text-sm font-bold text-slate-900 mb-3 sm:mb-4 flex items-center space-x-2 font-sans">
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            <span>Tariff & Pass-through Summary</span>
          </h2>
          <div className="space-y-2 sm:space-y-3 text-xs">
            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block text-xs">Total Driver Bata</span>
                <span className="text-slate-500 text-[10px] sm:text-[11px]">Allowances & night duty</span>
              </div>
              <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{formatCurrency(totalBata, currency)}</span>
            </div>

            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block text-xs">Tolls, Parking & Permits</span>
                <span className="text-slate-500 text-[10px] sm:text-[11px]">Interstate tolls & charges</span>
              </div>
              <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{formatCurrency(totalTolls, currency)}</span>
            </div>

            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block text-xs">Advance Received</span>
                <span className="text-slate-500 text-[10px] sm:text-[11px]">Collected at pickup</span>
              </div>
              <span className="font-mono font-bold text-emerald-700 text-xs sm:text-sm">
                {formatCurrency(totalAdvance, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
