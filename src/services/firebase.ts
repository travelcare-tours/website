import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDocFromServer,
  writeBatch,
  query,
  where,
  arrayUnion,
  arrayRemove,
  deleteField
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
const settingsDeletedDocRef = doc(db, 'settings', 'deleted_records');

const DELETED_BILLS_STORAGE_KEY = 'tc_deleted_bill_nos';
const DEFAULT_DELETED = ['TC-0001', 'TC-0002', 'TC-0003', 'TC-0004', 'TC_0001', 'TC_0002', 'TC_0003', 'TC_0004'];

let inMemoryDeletedCache: Set<string> | null = null;

/**
 * Get locally recorded deleted bills to prevent ghost resurrection
 */
export function getDeletedBills(): Set<string> {
  if (inMemoryDeletedCache) {
    return new Set<string>(inMemoryDeletedCache);
  }
  const set = new Set<string>();
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(DELETED_BILLS_STORAGE_KEY);
      if (raw !== null) {
        const arr: string[] = JSON.parse(raw);
        arr.forEach(s => set.add(s.trim().toUpperCase()));
      } else {
        DEFAULT_DELETED.forEach(s => set.add(s.trim().toUpperCase()));
        localStorage.setItem(DELETED_BILLS_STORAGE_KEY, JSON.stringify(Array.from(set)));
      }
    } else {
      DEFAULT_DELETED.forEach(s => set.add(s.trim().toUpperCase()));
    }
  } catch {
    DEFAULT_DELETED.forEach(s => set.add(s.trim().toUpperCase()));
  }
  inMemoryDeletedCache = set;
  return new Set<string>(set);
}

/**
 * Fetch deleted bills from Cloud Firestore tombstone ledger merged with local storage
 */
export async function fetchCloudAndLocalDeletedBills(): Promise<Set<string>> {
  const merged = getDeletedBills();
  try {
    const docSnap = await getDoc(settingsDeletedDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data?.deleted)) {
        data.deleted.forEach((s: string) => {
          if (s && typeof s === 'string') {
            merged.add(s.trim().toUpperCase());
          }
        });
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(DELETED_BILLS_STORAGE_KEY, JSON.stringify(Array.from(merged)));
        }
        inMemoryDeletedCache = merged;
      }
    }
  } catch (err) {
    console.warn('Could not fetch cloud deleted bills:', err);
  }
  return merged;
}

/**
 * Record a bill number / trip ID as deleted in both local storage and Cloud Firestore tombstones
 */
export async function markBillAsDeleted(...billNosOrIds: string[]): Promise<void> {
  const validKeys: string[] = [];
  const current = getDeletedBills();

  billNosOrIds.forEach(id => {
    if (id && id.trim()) {
      const upper = id.trim().toUpperCase();
      current.add(upper);
      validKeys.push(upper);
      const clean = upper.replace(/[^A-Za-z0-9_-]/g, '_');
      if (clean !== upper) {
        current.add(clean);
        validKeys.push(clean);
      }
    }
  });

  inMemoryDeletedCache = current;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(DELETED_BILLS_STORAGE_KEY, JSON.stringify(Array.from(current)));
    }
  } catch (err) {
    console.warn('Could not persist deleted bills record:', err);
  }

  // Persist to Cloud Firestore global tombstone registry
  if (validKeys.length > 0) {
    try {
      await setDoc(settingsDeletedDocRef, {
        deleted: arrayUnion(...validKeys),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Could not update cloud tombstone registry:', err);
    }
  }
}

/**
 * Remove a bill number / trip ID from deletion records (used on Restore)
 */
export async function unmarkBillAsDeleted(...billNosOrIds: string[]): Promise<void> {
  const current = getDeletedBills();
  const keysToRemove: string[] = [];

  billNosOrIds.forEach(id => {
    if (id && id.trim()) {
      const upper = id.trim().toUpperCase();
      const clean = upper.replace(/[^A-Za-z0-9_-]/g, '_');
      current.delete(upper);
      current.delete(clean);
      keysToRemove.push(upper, clean);
    }
  });

  inMemoryDeletedCache = current;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(DELETED_BILLS_STORAGE_KEY, JSON.stringify(Array.from(current)));
    }
  } catch {}

  if (keysToRemove.length > 0) {
    try {
      await setDoc(settingsDeletedDocRef, {
        deleted: arrayRemove(...keysToRemove),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Could not remove key from cloud tombstone registry:', err);
    }
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
 * Save or update an active trip in Cloud Firestore
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
 * Move a trip to Cloud Archive (soft delete - preserves history across all devices)
 */
export async function archiveTripInCloud(trip: TripRecord | { id: string; billNo?: string }): Promise<void> {
  try {
    const archivedAt = (trip as TripRecord).archivedAt || new Date().toISOString();
    const docId = getTripDocId(trip);
    const docRef = doc(tripsColRef, docId);
    await setDoc(docRef, { archivedAt, updatedAt: new Date().toISOString() }, { merge: true });

    // Ensure any matching documents by billNo are also marked archived
    if (trip.billNo) {
      const rawBill = trip.billNo.trim();
      const qBill = query(tripsColRef, where('billNo', 'in', [rawBill, rawBill.toUpperCase(), rawBill.toLowerCase()]));
      const snap = await getDocs(qBill);
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.forEach(d => batch.update(d.ref, { archivedAt, updatedAt: new Date().toISOString() }));
        await batch.commit();
      }
    }
  } catch (error) {
    console.error('Failed to archive trip in Cloud Firestore:', error);
    throw error;
  }
}

/**
 * Restore an archived trip back to Active status in Cloud Firestore
 */
export async function restoreTripInCloud(trip: TripRecord): Promise<void> {
  try {
    const sanitized = sanitizeTripData(trip);
    delete sanitized.archivedAt;
    delete sanitized.archivedReason;

    const docId = getTripDocId(trip);
    const docRef = doc(tripsColRef, docId);
    await setDoc(docRef, {
      ...sanitized,
      archivedAt: deleteField(),
      archivedReason: deleteField(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    if (trip.billNo || trip.id) {
      await unmarkBillAsDeleted(trip.billNo, trip.id);
    }
  } catch (error) {
    console.error('Failed to restore trip in Cloud Firestore:', error);
    throw error;
  }
}

/**
 * Robustly and permanently delete a trip from Cloud Firestore
 * Handles multiple ID representations, cleans up matching docs, and writes global tombstones
 */
export async function deleteTripFromCloud(target: { id?: string; billNo?: string } | string): Promise<void> {
  const rawId = typeof target === 'string' ? target.trim() : (target?.id || '').trim();
  const rawBill = typeof target === 'string' ? target.trim() : (target?.billNo || '').trim();

  if (!rawId && !rawBill) return;

  // 1. Record tombstone in both local storage and Cloud Firestore
  await markBillAsDeleted(rawBill, rawId);

  // 2. Compute candidate document IDs
  const candidateDocIds = new Set<string>();
  [rawId, rawBill].forEach(val => {
    if (!val) return;
    candidateDocIds.add(val);
    candidateDocIds.add(val.toUpperCase());
    candidateDocIds.add(val.toLowerCase());
    candidateDocIds.add(val.replace(/[^A-Za-z0-9_-]/g, '_'));
    candidateDocIds.add(val.toUpperCase().replace(/[^A-Za-z0-9_-]/g, '_'));
    candidateDocIds.add(val.toLowerCase().replace(/[^A-Za-z0-9_-]/g, '_'));
  });

  if (rawBill) {
    candidateDocIds.add(getTripDocId({ billNo: rawBill }));
  }
  if (rawId) {
    candidateDocIds.add(getTripDocId({ id: rawId }));
  }

  try {
    // 3. Collect unique document references across candidate IDs and field queries
    const docRefsToDelete = new Map<string, any>();
    for (const docId of candidateDocIds) {
      const docRef = doc(tripsColRef, docId);
      docRefsToDelete.set(docRef.path, docRef);
    }

    if (rawBill) {
      try {
        const qBill = query(tripsColRef, where('billNo', 'in', [rawBill, rawBill.toUpperCase(), rawBill.toLowerCase()]));
        const snapBill = await getDocs(qBill);
        snapBill.forEach(d => {
          docRefsToDelete.set(d.ref.path, d.ref);
        });
      } catch {}
    }

    if (rawId) {
      try {
        const qId = query(tripsColRef, where('id', 'in', [rawId, rawId.toUpperCase(), rawId.toLowerCase()]));
        const snapId = await getDocs(qId);
        snapId.forEach(d => {
          docRefsToDelete.set(d.ref.path, d.ref);
        });
      } catch {}
    }

    // 4. Delete each unique document reference cleanly
    for (const docRef of docRefsToDelete.values()) {
      try {
        await deleteDoc(docRef);
      } catch (err) {
        console.warn(`Doc delete attempt for ${docRef.id}:`, err);
      }
    }
  } catch (error) {
    console.error('Failed to permanently delete trip from Cloud Firestore:', error);
    throw error;
  }
}

/**
 * Sync local trips to Cloud Firestore (ensures offline or locally created bills like TC-0005 are uploaded)
 * Never re-uploads deleted bills or tombstoned trips
 */
export async function syncLocalTripsToCloud(localTrips: TripRecord[]): Promise<void> {
  if (!localTrips || localTrips.length === 0) return;

  const deletedBills = await fetchCloudAndLocalDeletedBills();

  // Actively prune deleted/tombstoned bills from local storage so clients don't retain ghosts
  const nonDeletedLocal = localTrips.filter(trip => {
    const billKey = (trip.billNo || '').trim().toUpperCase();
    const idKey = (trip.id || '').trim().toUpperCase();
    return !(billKey && deletedBills.has(billKey)) && !(idKey && deletedBills.has(idKey));
  });

  if (typeof window !== 'undefined' && window.localStorage && nonDeletedLocal.length !== localTrips.length) {
    try {
      localStorage.setItem('tc_invoices_trips', JSON.stringify(nonDeletedLocal));
    } catch {}
  }

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
      if (data.id) {
        existingCloudIds.add(String(data.id).trim().toUpperCase());
      }
    });

    const batch = writeBatch(db);
    let countToUpload = 0;

    for (const trip of nonDeletedLocal) {
      const billKey = (trip.billNo || '').trim().toUpperCase();
      const docId = getTripDocId(trip);
      if (!existingCloudIds.has(docId.toUpperCase()) && (!billKey || !existingCloudIds.has(billKey))) {
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
 * Subscribe to real-time changes across all devices, segregating Active vs Archived trips
 */
export function subscribeToCloudTrips(
  onUpdate: (activeTrips: TripRecord[], archivedTrips: TripRecord[]) => void,
  onError?: (error: Error) => void
): () => void {
  return onSnapshot(
    tripsColRef,
    async (snapshot) => {
      const deletedBills = await fetchCloudAndLocalDeletedBills();
      const activeTrips: TripRecord[] = [];
      const archivedTrips: TripRecord[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as TripRecord;
        const billKey = (data.billNo || '').trim().toUpperCase();
        const idKey = (data.id || '').trim().toUpperCase();
        const docIdKey = docSnap.id.trim().toUpperCase();

        if (
          (billKey && deletedBills.has(billKey)) ||
          (idKey && deletedBills.has(idKey)) ||
          deletedBills.has(docIdKey)
        ) {
          return;
        }

        if (data.archivedAt) {
          archivedTrips.push(data);
        } else {
          activeTrips.push(data);
        }
      });

      const sortByDate = (a: TripRecord, b: TripRecord) => {
        const timeA = new Date(a.dateOfTrip || a.timestamp || 0).getTime();
        const timeB = new Date(b.dateOfTrip || b.timestamp || 0).getTime();
        return timeB - timeA;
      };

      activeTrips.sort(sortByDate);
      archivedTrips.sort(sortByDate);

      onUpdate(activeTrips, archivedTrips);
    },
    (err) => {
      console.error('Cloud Firestore subscription error:', err);
      if (onError) onError(err);
    }
  );
}
