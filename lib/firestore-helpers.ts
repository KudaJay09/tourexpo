"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Attraction, Destination, Hotel } from "./firestore-schema";

/**
 * Fetch all destinations
 */
export async function fetchDestinations(): Promise<Destination[]> {
  if (!db) throw new Error("Firestore not initialized");

  try {
    const destinationsRef = collection(db, "destinations");
    const snapshot = await getDocs(destinationsRef);
    return snapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
        }) as Destination,
    );
  } catch (error) {
    console.error("Error fetching destinations:", error);
    throw error;
  }
}

/**
 * Fetch a single destination by id
 */
export async function fetchDestinationById(
  destinationId: string,
): Promise<Destination | null> {
  if (!db) throw new Error("Firestore not initialized");

  try {
    const destinationRef = doc(db, "destinations", destinationId);
    const snapshot = await getDoc(destinationRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      ...snapshot.data(),
      id: snapshot.id,
    } as Destination;
  } catch (error) {
    console.error("Error fetching destination:", error);
    throw error;
  }
}

/**
 * Fetch attractions for a destination
 */
export async function fetchAttractionsForDestination(
  destinationId: string,
): Promise<Attraction[]> {
  if (!db) throw new Error("Firestore not initialized");

  try {
    const attractionsRef = collection(
      db,
      "destinations",
      destinationId,
      "attractions",
    );
    const snapshot = await getDocs(attractionsRef);
    return snapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
        }) as Attraction,
    );
  } catch (error) {
    console.error("Error fetching attractions:", error);
    throw error;
  }
}

export async function fetchHotelsForDestinations(
  destinationId: string,
): Promise<Hotel[]> {
  if (!db) throw new Error("Firestore not initialized");

  try {
    const hotelsRef = collection(db, "destinations", destinationId, "hotels");
    const snapshot = await getDocs(hotelsRef);
    return snapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
        }) as Hotel,
    );
  } catch (error) {
    console.error("Error fetching hotels:", error);
    throw error;
  }
}
