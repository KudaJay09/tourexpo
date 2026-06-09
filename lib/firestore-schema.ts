/**
 * Firestore Schema Documentation
 *
 * Collections and document structure for TourExpo
 */

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  budget: "budget" | "moderate" | "luxury";
  continent:
    | "Africa"
    | "Asia"
    | "Europe"
    | "North America"
    | "South America"
    | "Oceania";
  region?: string;
  latitude: number;
  longitude: number;
  description: string;
  population?: number;
  attractionCount: number;
  createdAt: Date;
  imageUrl?: string;
}

export interface Attraction {
  id: string;
  imageUrl: string;
  destinationId: string; // foreign key to Destination
  name: string;
  activity: string; // e.g., "Louvre Museum", "Eiffel Tower visit", "Seine River cruise"
  about: string;
  category: string; // e.g., "museum", "park", "beach", "monument", "restaurant"
  budgetLevel: "budget" | "moderate" | "premium"; // cost indicator
  tags: string[]; // e.g., ["cultural", "outdoor", "family-friendly", "historical"]
  latitude?: number;
  longitude?: number;
  rating?: number; // 0-5
  reviewCount?: number;
  website?: string;
  phone?: string;
  address?: string;
  hours?: string;
  source: "seeded" | "external"; // data origin
  externalId?: string; // ID from external API if applicable
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreference {
  userId: string;
  budgetLevel: "budget" | "moderate" | "premium";
  interests: string[]; // e.g., ["culture", "nature", "food", "history", "adventure"]
  tripDuration: "day" | "weekend" | "week" | "longer";
  createdAt: Date;
  updatedAt: Date;
}

export interface Hotel {
  id: string;
  name: string;
  destinationId: string;
  description: string;
  imageUrl?: string;
  rating?: number;
  pricePerNight: number;
  amenities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  attractionId: string;
  destinationId: string;
  notes?: string;
  savedAt: Date;
}

/**
 * Firestore Collections Structure:
 *
 * /users/{uid}
 *   - User profile data
 *
 * /destinations/{destinationId}
 *   - Destination metadata and summary
 *
 * /destinations/{destinationId}/attractions/{attractionId}
 *   - Attractions within a destination
 *
 * /recommendations/{recommendationId}
 *   - Generated recommendation results (cached per user query)
 *
 * /users/{uid}/favorites/{favoriteId}
 *   - User's saved favorite attractions
 *
 * /userPreferences/{userId}
 *   - User preference profile for recommendations
 */

/**
 * Security Rules Strategy:
 * - Users can only read/write their own user data
 * - Destinations and attractions are read-only for all authenticated users
 * - Recommendations are user-scoped (only user can read their own)
 * - Favorites are user-scoped (users manage their own favorites)
 */
