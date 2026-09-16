export interface TripRecord {
  id: string;
  timestamp: string;
  emailAddress: string;
  dateOfTrip: string;
  pickupDate?: string;
  pickupTime?: string;
  dropoffDate?: string;
  dropoffTime?: string;
  durationText?: string;
  extraNightAdded?: boolean;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  numberOfDays: number;
  vehicleNumber: string;
  vehicleType: 'SUV' | 'Sedan' | 'Hatchback' | 'Innova / Crysta' | 'Tempo Traveller' | 'Luxury' | string;
  driverName: string;
  driverPhone?: string;
  tripRoute: string;
  startingKm: number;
  closingKm: number;
  ratePerKm: number;
  includedKm: number;
  dailyPackageRate: number;
  driverBata: number;
  tollParkingPermit: number;
  otherCharges: number;
  advanceReceived: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  remarks: string;
  billNo: string;
  adjustment: number;
  
  // Computed fields (can be stored or recalculated)
  totalKm: number;
  additionalKm: number;
  additionalKmAmount: number;
  vehicleHire: number;
  totalAmount: number;
  balanceAmount: number;

  // Status & Payment Settlement (Ledger balancing)
  status?: 'pending' | 'closed' | 'settled';
  settlementAmount?: number;
  settlementDate?: string;
  settlementPaymentMode?: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  settlementNotes?: string;

  // Archive & Audit Trail
  archivedAt?: string;
  archivedReason?: string;

  // Google Form / Document Merge fields
  mergedDocId?: string;
  linkToMergedDoc?: string;
  documentMergeStatus?: string;
  mergedDocUrl?: string;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  gstNo?: string;
  upiId: string;
  upiName: string;
  currencySymbol: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  termsAndConditions: string[];
  logoUrl?: string;
  googleSheetWebhookUrl?: string;
  googleSheetId?: string;
  googleSheetUrl?: string;
  googleSheetName?: string;
  googleSheetLastSynced?: string;
}

export type ViewMode = 'create' | 'invoice' | 'history' | 'analytics' | 'settings';
