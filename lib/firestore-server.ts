import { seedDestinations, seedAttractions } from "./seed-data";
import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

export async function seedFirestore() {
  if (!db) throw new Error("Firestore not initialized");
  const batch = writeBatch(db);

  for (const destination of seedDestinations) {
    const docRef = doc(db, "destinations", destination.id);
    batch.set(docRef, { ...destination, createdAt: new Date().toISOString() });
  }

  for (const attraction of seedAttractions) {
    const attractionRef = doc(
      db,
      "destinations",
      attraction.destinationId,
      "attractions",
      attraction.id,
    );
    batch.set(attractionRef, {
      ...attraction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  await batch.commit();
  return { success: true, message: "Seed data loaded" };
}
