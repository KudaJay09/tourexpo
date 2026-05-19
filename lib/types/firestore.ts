// Firestore collection and document types for TourExpo

export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
}

export interface Attraction {
  id: string;
  name: string;
  destinationId: string;
  description: string;
  category: string; // e.g., "landmark", "museum", "nature", "food", "entertainment"
  budget: "free" | "low" | "medium" | "high"; // budget tier
  tags: string[]; // e.g., ["outdoor", "historical", "photography", "kids-friendly"]
  rating?: number; // 0-5
  reviewCount?: number;
  imageUrl?: string;
  source: "seeded" | "api"; // data source
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  destinationId: string;
  budget: "budget" | "moderate" | "luxury";
  interests: string[]; // e.g., ["history", "nature", "adventure", "food", "art"]
  duration: number; // number of days
  createdAt: Date;
}

export interface Recommendation {
  id: string;
  userId: string;
  preferenceId: string;
  attractionId: string;
  destinationId: string;
  score: number; // 0-100 ranking score
  matchReasons: string[]; // why this attraction matches
  rank: number; // position in ranked list (1, 2, 3, etc)
  createdAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  attractionId: string;
  destinationId: string;
  attractionName: string; // denormalized for quick display
  createdAt: Date;
}

// Firestore schema structure (for reference):
// ├── users/{userId}
// ├── destinations/{destinationId}
// ├── attractions/{attractionId}
// ├── userPreferences/{userId}/preferences/{preferenceId}
// ├── recommendations/{recommendationId}
// └── favorites/{userId}/favorites/{attractionId}
