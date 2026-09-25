import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDocFromServer,
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import type { TripRecord } from '../types';

export const firebaseConfig = {
  projectId: "substantial-chassis-sggh3",
  appId: "1:514144983963:web:858c9482b75a0c682f9f3e",
  apiKey: "AIzaSyBQvguisicDSYe-wvbJ0I8EiCB-OnBGiWs",
  authDomain: "substantial-chassis-sggh3.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-tcwebsite-552bf53f-b45e-487c-a41c-8465d46b59c7",
  storageBucket: "substantial-chassis-sggh3.firebasestorage.app",
  messagingSenderId: "514144983963",
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom Database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const TRIPS_COLLECTION = 'trips';
const tripsColRef = collection(db, TRIPS_COLLECTION);

const DELETED_BILLS_STORAGE_KEY = 'tc_deleted_bill_nos';
const DEFAULT_DELETED = ['TC-0001', 'TC-0002', 'TC-0003', 'TC-0004', 'TC_0001', 'TC_0002', 'TC_0003', 'TC_0004'];

/**
 * Get locally recorded deleted bills to prevent ghost resurrection
 */
export function getDeletedBills(): Set<string> {
  const set = new Set<string>(DEFAULT_DELETED);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(DELETED_BILLS_STORAGE_KEY);
      if (raw) {
        const arr: string[] = JSON.parse(raw);
        arr.forEach(s => set.add(s.trim().toUpperCase()));
      }
    }
  } catch {}
  return set;
}

/**
 * Record a bill number / trip ID as deleted
 */
export function markBillAsDeleted(...billNosOrIds: string[]): void {
  try {
    const current = getDeletedBills();
    billNosOrIds.forEach(id => {
      if (id && id.trim()) {
        current.add(id.trim().toUpperCase());
      }
    });
    localStorage.setItem(DELETED_BILLS_STORAGE_KEY, JSON.stringify(Array.from(current)));
  } catch (err) {
    console.warn('Could not persist deleted bills record:', err);
  }
}

/**
 * Deterministic doc ID from bill number or trip ID
 */
export function getTripDocId(trip: Partial<TripRecord>): string {
  if (trip.billNo && trip.billNo.trim()) {
    return trip.billNo.trim().toUpperCase().replace(/[^A-Za-z0-9_-]/g, '_');
  }
  return (trip.id || `trip_${Date.now()}`).replace(/[^A-Za-z0-9_-]/g, '_');
}

/**
 * Clean trip object for Firestore serialization (removes undefined values)
 */
function sanitizeTripData(trip: TripRecord): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(trip)) {
    if (value !== undefined) {
      sanitized[key] = value;
    }
  }
  sanitized.updatedAt = new Date().toISOString();
  return sanitized;
}

/**
 * Validate Firestore connection
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (err: any) {
    if (err?.message?.includes('the client is offline')) {
      console.warn('Firestore is running in offline mode.');
      return false;
    }
    // Any other response means we contacted the server
    return true;
  }
}

/**
 * Save or update a trip in Cloud Firestore
 */
export async function saveTripToCloud(trip: TripRecord): Promise<void> {
  try {
    const docId = getTripDocId(trip);
    const docRef = doc(tripsColRef, docId);
    await setDoc(docRef, sanitizeTripData(trip), { merge: true });
  } catch (error) {
    console.error('Failed to save trip to Cloud Firestore:', error);
    throw error;
  }
}

/**
 * Robustly delete a trip from Cloud Firestore
 * Handles multiple ID representations and cleans up any matching documents
 */
export async function deleteTripFromCloud(tripIdOrBillNo: string): Promise<void> {
  if (!tripIdOrBillNo || !tripIdOrBillNo.trim()) return;

  const raw = tripIdOrBillNo.trim();
  markBillAsDeleted(raw);

  const cleanId = raw.replace(/[^A-Za-z0-9_-]/g, '_');
  const upperId = raw.toUpperCase().replace(/[^A-Za-z0-9_-]/g, '_');
  const lowerId = raw.toLowerCase().replace(/[^A-Za-z0-9_-]/g, '_');

  const possibleDocIds = Array.from(new Set([raw, cleanId, upperId, lowerId]));

  try {
    // 1. Delete direct document references
    for (const docId of possibleDocIds) {
      try {
        await deleteDoc(doc(tripsColRef, docId));
      } catch (err) {
        console.warn(`Doc delete attempt for ${docId}:`, err);
      }
    }

    // 2. Query collection for any docs with matching billNo or id
    try {
      const qBill = query(tripsColRef, where('billNo', 'in', [raw, raw.toUpperCase(), raw.toLowerCase()]));
      const snapBill = await getDocs(qBill);
      if (!snapBill.empty) {
        const batch = writeBatch(db);
        snapBill.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    } catch {}

    try {
      const qId = query(tripsColRef, where('id', 'in', [raw, raw.toUpperCase(), raw.toLowerCase()]));
      const snapId = await getDocs(qId);
      if (!snapId.empty) {
        const batch = writeBatch(db);
        snapId.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    } catch {}
  } catch (error) {
    console.error('Failed to delete trip from Cloud Firestore:', error);
    throw error;
  }
}

/**
 * Sync local trips to Cloud Firestore (ensures offline or locally created bills like TC-0005 are uploaded)
 * Never re-uploads deleted bills or default test templates
 */
export async function syncLocalTripsToCloud(localTrips: TripRecord[]): Promise<void> {
  if (!localTrips || localTrips.length === 0) return;

  const deletedBills = getDeletedBills();

  try {
    const snapshot = await getDocs(tripsColRef);
    const existingCloudIds = new Set<string>();
    snapshot.forEach(docSnap => {
      existingCloudIds.add(docSnap.id.toUpperCase());
      const data = docSnap.data();
      if (data.billNo) {
        existingCloudIds.add(data.billNo.trim().toUpperCase());
        existingCloudIds.add(data.billNo.trim().toUpperCase().replace(/[^A-Za-z0-9_-]/g, '_'));
      }
    });

    const batch = writeBatch(db);
    let countToUpload = 0;

    for (const trip of localTrips) {
      const billKey = (trip.billNo || trip.id).trim().toUpperCase();
      // Skip if explicitly marked deleted or in deleted list
      if (deletedBills.has(billKey) || deletedBills.has(trip.id?.toUpperCase() || '')) {
        continue;
      }

      const docId = getTripDocId(trip);
      if (!existingCloudIds.has(docId.toUpperCase()) && !existingCloudIds.has(billKey)) {
        const docRef = doc(tripsColRef, docId);
        batch.set(docRef, sanitizeTripData(trip), { merge: true });
        countToUpload++;
      }
    }

    if (countToUpload > 0) {
      await batch.commit();
      console.log(`Synced ${countToUpload} local bills to Cloud Firestore.`);
    }
  } catch (error) {
    console.error('Error syncing local trips to cloud:', error);
  }
}

/**
 * Subscribe to real-time changes across all devices
 */
export function subscribeToCloudTrips(
  onUpdate: (trips: TripRecord[]) => void,
  onError?: (error: Error) => void
): () => void {
  return onSnapshot(
    tripsColRef,
    (snapshot) => {
      const cloudTrips: TripRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as TripRecord;
        cloudTrips.push(data);
      });
      // Sort newest first by billNo or timestamp
      cloudTrips.sort((a, b) => {
        const timeA = new Date(a.dateOfTrip || a.timestamp || 0).getTime();
        const timeB = new Date(b.dateOfTrip || b.timestamp || 0).getTime();
        return timeB - timeA;
      });
      onUpdate(cloudTrips);
    },
    (err) => {
      console.error('Cloud Firestore subscription error:', err);
      if (onError) onError(err);
    }
  );
}
