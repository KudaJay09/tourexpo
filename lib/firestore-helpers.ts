'use client';

import { seedDestinations, seedAttractions } from './seed-data';
import type { Destination, Attraction } from './firestore-schema';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Seed destinations and attractions into Firestore
 * Run this once manually to populate the database
 */
export async function seedFirestore() {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  const batch = writeBatch(db);
  const destRef = collection(db, 'destinations');

  try {
    console.log('Starting seed...');

    // Add destinations
    for (const destination of seedDestinations) {
      const docRef = doc(db, 'destinations', destination.id);
      batch.set(docRef, {
        ...destination,
        createdAt: new Date().toISOString(),
      });
    }

    // Add attractions (as subcollection under destinations)
    for (const attraction of seedAttractions) {
      const attractionRef = doc(
        db,
        'destinations',
        attraction.destinationId,
        'attractions',
        attraction.id
      );
      batch.set(attractionRef, {
        ...attraction,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    await batch.commit();
    console.log('✓ Seed data loaded successfully!');
    return { success: true, message: 'Seed data loaded' };
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
}

/**
 * Check if seed data already exists
 */
export async function isSeedDataLoaded(): Promise<boolean> {
  if (!db) return false;

  try {
    const destinationsRef = collection(db, 'destinations');
    const snapshot = await getDocs(destinationsRef);
    return snapshot.docs.length > 0;
  } catch (error) {
    console.error('Error checking seed data:', error);
    return false;
  }
}

/**
 * Fetch all destinations
 */
export async function fetchDestinations(): Promise<Destination[]> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    const destinationsRef = collection(db, 'destinations');
    const snapshot = await getDocs(destinationsRef);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Destination));
  } catch (error) {
    console.error('Error fetching destinations:', error);
    throw error;
  }
}

/**
 * Fetch attractions for a destination
 */
export async function fetchAttractionsForDestination(
  destinationId: string
): Promise<Attraction[]> {
  if (!db) throw new Error('Firestore not initialized');

  try {
    const attractionsRef = collection(
      db,
      'destinations',
      destinationId,
      'attractions'
    );
    const snapshot = await getDocs(attractionsRef);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Attraction));
  } catch (error) {
    console.error('Error fetching attractions:', error);
    throw error;
  }
}
