import { TripRecord, CompanySettings } from '../types';

export interface DurationCalculation {
  days: number;
  nights: number;
  totalHours: number;
  durationText: string;
  hasLateNightDrop: boolean;
  extraNightAdded: boolean;
  summary: string;
}

/**
 * Calculates trip duration, billable days, and night count from pickup and drop-off date/time
 */
export function calculateTripDuration(
  pickupDate?: string,
  pickupTime: string = '08:00',
  dropoffDate?: string,
  dropoffTime: string = '20:00'
): DurationCalculation {
  if (!pickupDate) {
    const today = new Date().toISOString().split('T')[0];
    pickupDate = today;
  }
  if (!dropoffDate) {
    dropoffDate = pickupDate;
  }

  const pTime = pickupTime || '08:00';
  const dTime = dropoffTime || '20:00';

  const start = new Date(`${pickupDate}T${pTime}`);
  let end = new Date(`${dropoffDate}T${dTime}`);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    // If invalid or dropoff before pickup, default to same day
    end = new Date(`${pickupDate}T${dTime >= pTime ? dTime : '20:00'}`);
  }

  // Calculate total elapsed hours
  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

  // Calculate calendar days difference
  const pDay = new Date(pickupDate).setHours(0, 0, 0, 0);
  const dDay = new Date(dropoffDate).setHours(0, 0, 0, 0);
  const calendarDaysDiff = Math.max(0, Math.round((dDay - pDay) / (1000 * 60 * 60 * 24)));
  
  let billableDays = calendarDaysDiff + 1; // e.g. 21st to 24th = 4 days
  let nights = Math.max(0, calendarDaysDiff);

  // Check for late night drop-off (after 22:00 / 10 PM) or early morning pickup (before 06:00 AM)
  const [dropHour] = dTime.split(':').map(Number);
  const hasLateNightDrop = dropHour >= 22 || dropHour < 4;
  const extraNightAdded = nights > 0 || hasLateNightDrop;

  const durationText = nights > 0 
    ? `${billableDays} Day${billableDays > 1 ? 's' : ''} / ${nights} Night${nights > 1 ? 's' : ''}`
    : `${billableDays} Day${billableDays > 1 ? 's' : ''} (${totalHours} hrs)`;

  const summary = `${billableDays} Day${billableDays > 1 ? 's' : ''} (${pTime} on ${pickupDate} to ${dTime} on ${dropoffDate})`;

  return {
    days: Math.max(1, billableDays),
    nights,
    totalHours,
    durationText,
    hasLateNightDrop,
    extraNightAdded,
    summary
  };
}

export function calculateTripTotals(trip: Partial<TripRecord>): {
  totalKm: number;
  additionalKm: number;
  additionalKmAmount: number;
  vehicleHire: number;
  totalAmount: number;
  balanceAmount: number;
  computedDays: number;
  durationText: string;
} {
  const startingKm = Number(trip.startingKm) || 0;
  const closingKm = Number(trip.closingKm) || 0;
  const ratePerKm = Number(trip.ratePerKm) || 0;
  const includedKm = Number(trip.includedKm) || 0;
  
  // Calculate days either from pickup/dropoff or fallback to numberOfDays
  let computedDays = Number(trip.numberOfDays) || 1;
  let durationText = `${computedDays} Day(s)`;

  if (trip.pickupDate && trip.dropoffDate) {
    const durationCalc = calculateTripDuration(
      trip.pickupDate,
      trip.pickupTime || '08:00',
      trip.dropoffDate,
      trip.dropoffTime || '20:00'
    );
    computedDays = durationCalc.days;
    durationText = durationCalc.durationText;
  }

  const dailyPackageRate = Number(trip.dailyPackageRate) || 0;
  const driverBata = Number(trip.driverBata) || 0;
  const tollParkingPermit = Number(trip.tollParkingPermit) || 0;
  const otherCharges = Number(trip.otherCharges) || 0;
  const adjustment = Number(trip.adjustment) || 0;
  const advanceReceived = Number(trip.advanceReceived) || 0;

  // 1. Total KM
  const totalKm = Math.max(0, closingKm - startingKm);

  // 2. Additional KM (Exceeding the package/included km)
  const additionalKm = Math.max(0, totalKm - includedKm);

  // 3. Additional KM Amount
  const additionalKmAmount = Math.round(additionalKm * ratePerKm);

  // 4. Vehicle Hire (Days * daily rate)
  const vehicleHire = Math.round(computedDays * dailyPackageRate);

  // 5. Total Amount
  const totalAmount = Math.round(
    vehicleHire + additionalKmAmount + driverBata + tollParkingPermit + otherCharges + adjustment
  );

  // 6. Balance Amount
  const balanceAmount = Math.round(totalAmount - advanceReceived);

  return {
    totalKm,
    additionalKm,
    additionalKmAmount,
    vehicleHire,
    totalAmount,
    balanceAmount,
    computedDays,
    durationText
  };
}

export function formatCurrency(amount: number, symbol: string = '₹'): string {
  return `${symbol} ${Number(amount || 0).toLocaleString('en-IN')}`;
}

export function formatNumber(num: number): string {
  return Number(num || 0).toLocaleString('en-IN');
}

export function generateNextBillNo(records: TripRecord[], prefix: string = 'TC-', minNumber: number = 6): string {
  let highestNum = Math.max(0, minNumber - 1);
  records.forEach((r) => {
    if (r.billNo && r.billNo.startsWith(prefix)) {
      const rawPart = r.billNo.slice(prefix.length).trim();
      // Match pure digits to prevent test IDs like E2E-777 from skewing bill sequence
      const match = rawPart.match(/^(\d+)$/);
      if (match) {
        const numPart = parseInt(match[1], 10);
        if (!isNaN(numPart) && numPart > highestNum) {
          highestNum = numPart;
        }
      }
    }
  });
  const next = highestNum + 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

export function encodeTripToUrl(trip: TripRecord): string {
  try {
    // Pack essential trip fields into a compact ordered array tuple to minimize link length
    const compactTuple = [
      trip.billNo || '',
      trip.customerName || '',
      trip.customerPhone || '',
      trip.tripRoute || '',
      trip.vehicleType || '',
      trip.vehicleNumber || '',
      trip.driverName || '',
      trip.driverPhone || '',
      Number(trip.startingKm) || 0,
      Number(trip.closingKm) || 0,
      Number(trip.totalKm) || 0,
      Number(trip.includedKm) || 0,
      Number(trip.ratePerKm) || 0,
      Number(trip.numberOfDays) || 1,
      Number(trip.vehicleHire) || 0,
      Number(trip.additionalKm) || 0,
      Number(trip.additionalKmAmount) || 0,
      Number(trip.driverBata) || 0,
      Number(trip.tollParkingPermit) || 0,
      Number(trip.otherCharges) || 0,
      Number(trip.adjustment) || 0,
      Number(trip.totalAmount) || 0,
      Number(trip.advanceReceived) || 0,
      Number(trip.balanceAmount) || 0,
      trip.paymentMode || 'Cash',
      trip.remarks || '',
      trip.pickupDate || '',
      trip.pickupTime || '',
      trip.dropoffDate || '',
      trip.dropoffTime || '',
      trip.durationText || '',
      trip.id || ''
    ];
    
    const jsonStr = JSON.stringify(compactTuple);
    // URL-safe base64 without padding or percent-encoded bloated symbols
    const b64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => 
      String.fromCharCode(parseInt(p1, 16))
    ))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return b64;
  } catch (e) {
    console.error('Failed to encode trip to URL', e);
    return '';
  }
}

export function decodeTripFromUrl(encoded: string): TripRecord | null {
  try {
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) {
      b64 += '=';
    }
    const decodedUri = decodeURIComponent(
      Array.prototype.map
        .call(atob(b64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(decodedUri);
    
    // Check if parsed data is our compact tuple array
    if (Array.isArray(parsed)) {
      const nowIso = new Date().toISOString();
      return {
        id: parsed[31] || `trip-${Date.now()}`,
        timestamp: nowIso,
        emailAddress: '',
        dateOfTrip: parsed[26] || nowIso.split('T')[0],
        billNo: parsed[0] || '',
        customerName: parsed[1] || '',
        customerPhone: parsed[2] || '',
        tripRoute: parsed[3] || '',
        vehicleType: parsed[4] || '',
        vehicleNumber: parsed[5] || '',
        driverName: parsed[6] || '',
        driverPhone: parsed[7] || '',
        startingKm: Number(parsed[8]) || 0,
        closingKm: Number(parsed[9]) || 0,
        totalKm: Number(parsed[10]) || 0,
        includedKm: Number(parsed[11]) || 0,
        ratePerKm: Number(parsed[12]) || 0,
        dailyPackageRate: 0,
        numberOfDays: Number(parsed[13]) || 1,
        vehicleHire: Number(parsed[14]) || 0,
        additionalKm: Number(parsed[15]) || 0,
        additionalKmAmount: Number(parsed[16]) || 0,
        driverBata: Number(parsed[17]) || 0,
        tollParkingPermit: Number(parsed[18]) || 0,
        otherCharges: Number(parsed[19]) || 0,
        adjustment: Number(parsed[20]) || 0,
        totalAmount: Number(parsed[21]) || 0,
        advanceReceived: Number(parsed[22]) || 0,
        balanceAmount: Number(parsed[23]) || 0,
        paymentMode: (parsed[24] as 'Cash' | 'UPI' | 'Card' | 'Bank Transfer') || 'Cash',
        remarks: parsed[25] || '',
        pickupDate: parsed[26] || '',
        pickupTime: parsed[27] || '',
        dropoffDate: parsed[28] || '',
        dropoffTime: parsed[29] || '',
        durationText: parsed[30] || '',
        status: (Number(parsed[23]) <= 0 ? 'settled' : 'pending'),
      };
    }
    
    // Legacy full JSON object fallback
    return parsed as TripRecord;
  } catch (e) {
    console.error('Failed to decode trip from URL', e);
    return null;
  }
}

export function generateGuestShareUrl(trip: TripRecord, preferredBaseUrl?: string): string {
  if (typeof window === 'undefined') return '';
  
  let baseUrl = '';
  if (preferredBaseUrl && preferredBaseUrl.trim()) {
    baseUrl = preferredBaseUrl.trim();
    if (!baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`;
    }
  } else if (window.location.hostname.includes('travelcaretours.in')) {
    baseUrl = `${window.location.origin}${window.location.pathname}`;
  } else if (window.location.hostname.includes('run.app') || window.location.hostname === 'localhost') {
    // When sharing from preview/development, automatically use official custom domain
    baseUrl = 'https://travelcaretours.in/invoice/';
  } else {
    baseUrl = `${window.location.origin}${window.location.pathname}`;
  }

  const cleanBase = baseUrl.replace(/\/+$/, '') + '/';
  const encodedData = encodeTripToUrl(trip);
  return `${cleanBase}?b=${encodeURIComponent(trip.billNo)}&d=${encodedData}`;
}

export function generateWhatsAppMessage(trip: TripRecord, settings: CompanySettings, includeLink: boolean = true): string {
  const currency = settings.currencySymbol || '₹';
  const isPaid = trip.balanceAmount <= 0;
  const durationDesc = trip.durationText || `${trip.numberOfDays} Day(s)`;
  const scheduleDesc = trip.pickupDate 
    ? `🗓️ *Schedule:* ${trip.pickupDate} (${trip.pickupTime || '08:00'}) to ${trip.dropoffDate || trip.pickupDate} (${trip.dropoffTime || '20:00'})\n⏳ *Duration:* ${durationDesc}`
    : `🗓️ *Duration:* ${durationDesc}`;

  const customWebsiteBase = settings.website 
    ? `https://${settings.website.replace(/^https?:\/\//, '').replace(/\/+$/, '')}/invoice/` 
    : 'https://travelcaretours.in/invoice/';
  const guestUrl = includeLink ? generateGuestShareUrl(trip, customWebsiteBase) : '';

  return `🚕 *${settings.companyName} - Trip Invoice*
---------------------------------------
📄 *Invoice No:* ${trip.billNo}
👤 *Customer:* ${trip.customerName}
🚗 *Vehicle:* ${trip.vehicleNumber} (${trip.vehicleType})
👨‍✈️ *Driver:* ${trip.driverName}
🗺️ *Route:* ${trip.tripRoute}
${scheduleDesc}
---------------------------------------
📍 *Distance:* ${formatNumber(trip.totalKm)} KM (${formatNumber(trip.startingKm)} to ${formatNumber(trip.closingKm)} KM)
💰 *Total Fare:* ${currency}${formatNumber(trip.totalAmount)}
💳 *Advance Paid:* ${currency}${formatNumber(trip.advanceReceived)}
📌 *BALANCE DUE:* ${currency}${formatNumber(trip.balanceAmount)} ${isPaid ? '✅ (PAID IN FULL)' : '⏳ (PENDING)'}
---------------------------------------
${guestUrl ? `🔗 *View / Download Bill Online:* \n${guestUrl}\n---------------------------------------\n` : ''}${settings.upiId && !isPaid ? `📲 *UPI Payment ID:* ${settings.upiId} (${settings.upiName})\n` : ''}${trip.remarks ? `📝 *Note:* ${trip.remarks}\n` : ''}📞 *Contact:* ${settings.phone} | ${settings.email}
Thank you for traveling with us!`;
}

export function generateUpiPaymentUrl(settings: CompanySettings, trip: TripRecord): string {
  if (!settings.upiId || trip.balanceAmount <= 0) return '';
  const pa = encodeURIComponent(settings.upiId);
  const pn = encodeURIComponent(settings.upiName || settings.companyName);
  const am = encodeURIComponent(trip.balanceAmount.toString());
  const tn = encodeURIComponent(`Invoice ${trip.billNo} - ${trip.customerName}`);
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
}

export function convertTripsToCsv(trips: TripRecord[]): string {
  const headers = [
    'Timestamp',
    'Email Address',
    'Date of Trip',
    'Customer Name',
    'Number of Days',
    'Vehicle Number',
    'Vehicle Type',
    "Driver's Name",
    'Trip/ Route',
    'Starting KM',
    'Closing KM',
    'Rate per KM',
    'Included KM',
    'Daily / Package Rate',
    'Driver Bata or Allowance',
    'Toll or Parking or Permit Charges',
    'Other Charges',
    'Advance Received',
    'Payment Mode',
    'Remarks',
    'Bill No',
    'Total KM',
    'Additional KM',
    'Additional KM Amount',
    'Vehicle Hire',
    'Total Amount',
    'Balance Amount',
    'Adjustment',
    'Status',
    'Settlement Paid Amount',
    'Settlement Date',
    'Settlement Payment Mode',
    'Settlement Notes',
    'Merged Doc ID - TC Invoices',
    'Link to merged Doc - TC Invoices',
    'Document Merge Status - TC Invoices',
    'Merged Doc URL - TC Invoices'
  ];

  const escapeCsv = (str: string | number | undefined) => {
    if (str === undefined || str === null) return '""';
    const s = String(str);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = trips.map(t => [
    escapeCsv(t.timestamp),
    escapeCsv(t.emailAddress),
    escapeCsv(t.dateOfTrip),
    escapeCsv(t.customerName),
    escapeCsv(t.numberOfDays),
    escapeCsv(t.vehicleNumber),
    escapeCsv(t.vehicleType),
    escapeCsv(t.driverName),
    escapeCsv(t.tripRoute),
    escapeCsv(t.startingKm),
    escapeCsv(t.closingKm),
    escapeCsv(t.ratePerKm),
    escapeCsv(t.includedKm),
    escapeCsv(t.dailyPackageRate),
    escapeCsv(t.driverBata),
    escapeCsv(t.tollParkingPermit),
    escapeCsv(t.otherCharges),
    escapeCsv(t.advanceReceived),
    escapeCsv(t.paymentMode),
    escapeCsv(t.remarks),
    escapeCsv(t.billNo),
    escapeCsv(t.totalKm),
    escapeCsv(t.additionalKm),
    escapeCsv(t.additionalKmAmount),
    escapeCsv(t.vehicleHire),
    escapeCsv(t.totalAmount),
    escapeCsv(t.balanceAmount),
    escapeCsv(t.adjustment),
    escapeCsv(t.status || (t.balanceAmount <= 0 ? 'Closed' : 'Pending')),
    escapeCsv(t.settlementAmount ?? (t.status === 'closed' ? t.balanceAmount : '')),
    escapeCsv(t.settlementDate || ''),
    escapeCsv(t.settlementPaymentMode || ''),
    escapeCsv(t.settlementNotes || ''),
    escapeCsv(t.mergedDocId || ''),
    escapeCsv(t.linkToMergedDoc || ''),
    escapeCsv(t.documentMergeStatus || ''),
    escapeCsv(t.mergedDocUrl || '')
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}
