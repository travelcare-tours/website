export interface TourPackage {
  id: string;
  title: string;
  category: 'Honeymoon' | 'Family' | 'Premium' | 'Groups' | 'Custom';
  tag: string;
  duration: string;
  nights: number;
  days: number;
  route: string[];
  image: string;
  priceNote: string;
  highlights: string[];
  inclusions: string[];
  itinerary: {
    day: number;
    title: string;
    description: string;
    activities: string[];
  }[];
}

export interface Destination {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  image: string;
  tagline: string;
  description: string;
  keyAttractions: string[];
  bestTime: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  tripType: string;
  rating: number;
  date: string;
  comment: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export interface EnquiryData {
  name: string;
  phone: string;
  email?: string;
  date: string;
  nights: string;
  adults: string;
  children: string;
  package: string;
  destinations: string[];
  hotelCategory: string;
  vehicleType: string;
  message: string;
}

export type { TripRecord } from '../invoice/src/types';
