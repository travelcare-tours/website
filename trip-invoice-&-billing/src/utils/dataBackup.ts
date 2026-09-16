import { TripRecord, CompanySettings } from '../types';
import { convertTripsToCsv } from './calculations';

export interface AppBackupData {
  version: string;
  exportedAt: string;
  app: string;
  companySettings: CompanySettings;
  activeTrips: TripRecord[];
  archivedTrips: TripRecord[];
  totalTripsCount: number;
}

/**
 * Triggers a browser download of a text/csv/json blob file
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads trips as a CSV spreadsheet compatible with Excel, Google Sheets, and Numbers
 */
export function downloadTripsCsv(
  trips: TripRecord[], 
  type: 'active' | 'archive' | 'all' = 'all',
  companyName: string = 'TravelCare'
) {
  const safeName = companyName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const csvContent = convertTripsToCsv(trips);
  const filename = `${safeName}_Trips_${type.toUpperCase()}_${dateStr}.csv`;
  triggerFileDownload(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Downloads a complete JSON snapshot containing all trips, archives, and custom company settings
 */
export function downloadCompleteJsonBackup(
  activeTrips: TripRecord[],
  archivedTrips: TripRecord[],
  companySettings: CompanySettings
) {
  const backupData: AppBackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    app: 'Travel Care Tours - Trip Billing & Ledger',
    companySettings,
    activeTrips,
    archivedTrips,
    totalTripsCount: activeTrips.length + archivedTrips.length
  };

  const safeName = (companySettings.companyName || 'TravelCare').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const jsonContent = JSON.stringify(backupData, null, 2);
  const filename = `${safeName}_FULL_BACKUP_${dateStr}.json`;
  triggerFileDownload(jsonContent, filename, 'application/json;charset=utf-8;');
}

/**
 * Copies formatted TSV data to clipboard for instant pasting directly into Excel or Google Sheets
 */
export async function copyTripsToClipboard(trips: TripRecord[]): Promise<boolean> {
  const headers = [
    'Bill No', 'Date', 'Customer Name', 'Phone', 'Vehicle No', 'Vehicle Type',
    'Driver', 'Route', 'Days', 'Total KM', 'Rate/KM', 'Pkg Rate',
    'Driver Bata', 'Tolls/Parking', 'Gross Total', 'Advance Paid',
    'Settlement Paid', 'Balance Due', 'Status'
  ];

  const rows = trips.map(t => [
    t.billNo || '',
    t.dateOfTrip || '',
    t.customerName || '',
    t.customerPhone || '',
    t.vehicleNumber || '',
    t.vehicleType || '',
    t.driverName || '',
    t.tripRoute || '',
    t.numberOfDays || 1,
    t.totalKm || 0,
    t.ratePerKm || 0,
    t.dailyPackageRate || 0,
    t.driverBata || 0,
    t.tollParkingPermit || 0,
    t.totalAmount || 0,
    t.advanceReceived || 0,
    t.settlementAmount || 0,
    t.balanceAmount || 0,
    t.status || (t.balanceAmount <= 0 ? 'Closed' : 'Pending')
  ].join('\t'));

  const tsv = [headers.join('\t'), ...rows].join('\n');
  try {
    await navigator.clipboard.writeText(tsv);
    return true;
  } catch (err) {
    console.error('Clipboard copy error', err);
    return false;
  }
}

/**
 * Validates and restores backup JSON data
 */
export function parseBackupFile(jsonString: string): {
  success: boolean;
  data?: AppBackupData;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || (typeof parsed !== 'object')) {
      return { success: false, error: 'Invalid backup file format.' };
    }
    
    // Validate that it has trip records
    const activeTrips = Array.isArray(parsed.activeTrips) ? parsed.activeTrips : [];
    const archivedTrips = Array.isArray(parsed.archivedTrips) ? parsed.archivedTrips : [];
    
    return {
      success: true,
      data: {
        version: parsed.version || '1.0.0',
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        app: parsed.app || 'Travel Care Tours',
        companySettings: parsed.companySettings,
        activeTrips,
        archivedTrips,
        totalTripsCount: activeTrips.length + archivedTrips.length
      }
    };
  } catch (e: any) {
    return { success: false, error: e.message || 'Could not parse JSON file.' };
  }
}
