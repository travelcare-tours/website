import { TripRecord, CompanySettings } from '../types';

export const defaultCompanySettings: CompanySettings = {
  companyName: 'Travel Care Tours Pvt Ltd',
  tagline: 'Kerala & South India Premier Cabs & Holiday Trips',
  phone: '+91 91435 43444',
  email: 'travelcare598@gmail.com',
  website: 'travelcaretours.in',
  address: 'Ground Flr, Mannath Bld, 36/267. Seaport-Airport Rd, Thrikkakara Ernakulam, Kerala',
  gstNo: '32AAAAA0000A1Z5',
  upiId: 'hashimhassan2@okhdfcbank',
  upiName: 'Travel Care Tours Pvt Ltd',
  currencySymbol: '₹',
  invoicePrefix: 'TC-',
  nextInvoiceNumber: 4,
  termsAndConditions: [
    'Toll, Parking, Interstate Permits & Entry tickets are as per actual receipts.',
    'Driver Bata is applicable for outstation duty & overnight halt.',
    'AC will be switched off while vehicle is parked or waiting.',
    'Please inspect and verify odometer reading before start and at trip completion.',
    'Any balance amount must be settled at the time of trip completion.'
  ]
};

export const sampleTrips: TripRecord[] = [
  {
    id: 'tc-0001',
    timestamp: '8/12/2026 16:37:11',
    emailAddress: 'hashimhassan2@gmail.com',
    dateOfTrip: '2026-08-03',
    pickupDate: '2026-08-03',
    pickupTime: '06:30',
    dropoffDate: '2026-08-09',
    dropoffTime: '20:30',
    durationText: '7 Days / 6 Nights',
    customerName: 'Hashim',
    customerPhone: '+91 98470 54321',
    numberOfDays: 7,
    vehicleNumber: 'KL39N1510',
    vehicleType: 'SUV',
    driverName: 'Driver 1',
    driverPhone: '+91 94471 00001',
    tripRoute: 'Munnar & Hill Country Tour',
    startingKm: 10065,
    closingKm: 13008,
    ratePerKm: 5,
    includedKm: 200,
    dailyPackageRate: 0,
    driverBata: 5000,
    tollParkingPermit: 300,
    otherCharges: 0,
    advanceReceived: 15000,
    paymentMode: 'Cash',
    remarks: '7 Days hill station tour package',
    billNo: 'TC-0001',
    adjustment: 15,
    totalKm: 2943,
    additionalKm: 2743,
    additionalKmAmount: 13715,
    vehicleHire: 0,
    totalAmount: 19015,
    balanceAmount: 4000,
    mergedDocId: '1PLnPW3WMMUUM4ZPCCUthXUbp4HvfSzM1',
    linkToMergedDoc: 'TC-0001 Hashim',
    documentMergeStatus: 'Document successfully created; PDF created',
    mergedDocUrl: 'https://drive.google.com/file/d/1PLnPW3WMMUUM4ZPCCUthXUbp4HvfSzM1/view?usp=drivesdk'
  },
  {
    id: 'tc-0002',
    timestamp: '8/13/2026 9:51:28',
    emailAddress: 'prarul78@gmail.com',
    dateOfTrip: '2026-08-13',
    pickupDate: '2026-08-13',
    pickupTime: '08:00',
    dropoffDate: '2026-08-17',
    dropoffTime: '21:00',
    durationText: '5 Days / 4 Nights',
    customerName: 'Mr. & Mrs. Sharma (Test)',
    customerPhone: '+91 98950 11223',
    numberOfDays: 5,
    vehicleNumber: 'KL41K1069',
    vehicleType: 'Sedan',
    driverName: 'Amal',
    driverPhone: '+91 94471 00002',
    tripRoute: 'Munnar - Thekkady - Alleppey - Kochi',
    startingKm: 161002,
    closingKm: 161552,
    ratePerKm: 16,
    includedKm: 900,
    dailyPackageRate: 1400,
    driverBata: 3000,
    tollParkingPermit: 200,
    otherCharges: 0,
    advanceReceived: 4000,
    paymentMode: 'UPI',
    remarks: 'Couple trip with houseboat cruise',
    billNo: 'TC-0002',
    adjustment: 0,
    totalKm: 550,
    additionalKm: 0,
    additionalKmAmount: 0,
    vehicleHire: 7000,
    totalAmount: 10200,
    balanceAmount: 6200,
    mergedDocId: '1ZD1sNwTgL3tmGwxEH_dr-EN5HN4cFO03',
    linkToMergedDoc: 'TC-0002 Test',
    documentMergeStatus: 'Document successfully created; PDF created',
    mergedDocUrl: 'https://drive.google.com/file/d/1ZD1sNwTgL3tmGwxEH_dr-EN5HN4cFO03/view?usp=drivesdk'
  },
  {
    id: 'tc-0003',
    timestamp: '8/13/2026 11:56:01',
    emailAddress: 'prarul78@gmail.com',
    dateOfTrip: '2026-08-09',
    pickupDate: '2026-08-09',
    pickupTime: '07:30',
    dropoffDate: '2026-08-13',
    dropoffTime: '22:30',
    durationText: '5 Days / 4 Nights',
    customerName: 'Testing Kerala Trip',
    customerPhone: '+91 97450 99887',
    numberOfDays: 5,
    vehicleNumber: 'KL70C4754',
    vehicleType: 'Sedan',
    driverName: 'Vijesh',
    driverPhone: '+91 94471 00003',
    tripRoute: 'Munnar, Thekkady, Alleppey, Kochi',
    startingKm: 172300,
    closingKm: 172850,
    ratePerKm: 18,
    includedKm: 500,
    dailyPackageRate: 1200,
    driverBata: 3000,
    tollParkingPermit: 200,
    otherCharges: 0,
    advanceReceived: 4000,
    paymentMode: 'Cash',
    remarks: 'Trip from kerala heaven',
    billNo: 'TC-0003',
    adjustment: 100,
    totalKm: 550,
    additionalKm: 50,
    additionalKmAmount: 900,
    vehicleHire: 6000,
    totalAmount: 10100,
    balanceAmount: 6000,
    mergedDocId: '1G-jmFkVjnGZI-_vQ3fnsqAS4L_hRF1_e',
    linkToMergedDoc: 'TC-0003 Testing',
    documentMergeStatus: 'Document successfully created; PDF created',
    mergedDocUrl: 'https://drive.google.com/file/d/1G-jmFkVjnGZI-_vQ3fnsqAS4L_hRF1_e/view?usp=drivesdk'
  }
];

export const commonRoutes = [
  'Munnar - Thekkady - Alleppey - Kochi',
  'Cochin Airport - Munnar - Cochin Airport',
  'Munnar - Thekkady - Houseboat Alleppey - Kovalam - Trivandrum',
  'Kochi - Athirappilly - Valparai - Kochi',
  'Calicut - Wayanad - Mysore - Bangalore',
  'Trivandrum - Kanyakumari - Kovalam - Varkala',
  'Local Sightseeing & City Run (8 Hrs / 80 KM)'
];

export interface VehiclePreset {
  type: string;
  label?: string;
  defaultRatePerKm: number;
  defaultDailyRate: number;
  defaultIncludedKm: number;
  defaultDriverBata: number;
  sublabel?: string;
  description?: string;
}

export const vehiclePresets: VehiclePreset[] = [
  {
    type: 'Sedan',
    label: 'Sedan',
    defaultRatePerKm: 18,
    defaultDailyRate: 2200,
    defaultIncludedKm: 100,
    defaultDriverBata: 600,
    sublabel: '₹18/KM • ₹2,200/Day (100 KM incl.)',
    description: '₹18/KM • ₹2,200/Day'
  },
  {
    type: 'SUV',
    label: 'SUV',
    defaultRatePerKm: 23,
    defaultDailyRate: 3500,
    defaultIncludedKm: 100,
    defaultDriverBata: 700,
    sublabel: '₹23/KM • ₹3,500/Day (100 KM incl.)',
    description: '₹23/KM • ₹3,500/Day'
  },
  {
    type: 'Traveller 12 Seat',
    label: 'Traveller 12 Seat',
    defaultRatePerKm: 25,
    defaultDailyRate: 4000,
    defaultIncludedKm: 100,
    defaultDriverBata: 800,
    sublabel: '₹25/KM • ₹4,000/Day (100 KM incl.)',
    description: '₹25/KM • ₹4,000/Day'
  }
];
