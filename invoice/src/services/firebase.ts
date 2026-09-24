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
  writeBatch
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

/**
 * Deterministic doc ID from bill number or trip ID
 */
export function getTripDocId(trip: Partial<TripRecord>): string {
  if (trip.billNo && trip.billNo.trim()) {
    return trip.billNo.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
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
 * Delete a trip from Cloud Firestore
 */
export async function deleteTripFromCloud(tripIdOrBillNo: string): Promise<void> {
  try {
    const docId = tripIdOrBillNo.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
    const docRef = doc(tripsColRef, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Failed to delete trip from Cloud Firestore:', error);
    throw error;
  }
}

/**
 * Sync local trips to Cloud Firestore (ensures offline or locally created bills like TC-0005 are uploaded)
 */
export async function syncLocalTripsToCloud(localTrips: TripRecord[]): Promise<void> {
  if (!localTrips || localTrips.length === 0) return;

  try {
    const snapshot = await getDocs(tripsColRef);
    const existingCloudIds = new Set<string>();
    snapshot.forEach(docSnap => {
      existingCloudIds.add(docSnap.id);
      const data = docSnap.data();
      if (data.billNo) {
        existingCloudIds.add(data.billNo.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_'));
      }
    });

    const batch = writeBatch(db);
    let countToUpload = 0;

    for (const trip of localTrips) {
      const docId = getTripDocId(trip);
      if (!existingCloudIds.has(docId)) {
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
