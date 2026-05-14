// Rule-based recommendation engine for TourExpo

import type { Attraction, Recommendation } from './types/firestore';

interface RecommendationInput {
  attractions: Attraction[];
  budget: 'budget' | 'moderate' | 'luxury';
  interests: string[];
  duration: number;
  maxResults?: number;
}

interface ScoredAttraction {
  attraction: Attraction;
  score: number;
  matchReasons: string[];
}

/**
 * Maps user budget level to attraction budget tiers
 */
function getBudgetTiersForLevel(
  level: 'budget' | 'moderate' | 'luxury'
): ('free' | 'low' | 'medium' | 'high')[] {
  switch (level) {
    case 'budget':
      return ['free', 'low'];
    case 'moderate':
      return ['free', 'low', 'medium'];
    case 'luxury':
      return ['free', 'low', 'medium', 'high'];
  }
}

/**
 * Scores a single attraction based on user preferences
 */
function scoreAttraction(
  attraction: Attraction,
  budget: 'budget' | 'moderate' | 'luxury',
  interests: string[],
  duration: number
): ScoredAttraction {
  let score = 0;
  const matchReasons: string[] = [];

  // Budget scoring (0-30 points)
  const budgetTiers = getBudgetTiersForLevel(budget);
  if (budgetTiers.includes(attraction.budget)) {
    score += 30;
    matchReasons.push(`Perfect for ${budget} travelers`);
  } else {
    // Penalize budget mismatch
    score -= 10;
    matchReasons.push(`Above your typical budget range`);
  }

  // Interest scoring (0-40 points)
  const matchingInterests = attraction.tags.filter((tag) =>
    interests.includes(tag)
  );
  const interestMatchPercentage = matchingInterests.length / interests.length;
  const interestScore = interestMatchPercentage * 40;
  score += interestScore;

  if (matchingInterests.length > 0) {
    matchReasons.push(`Matches your interests: ${matchingInterests.join(', ')}`);
  }

  // Category bonus (0-10 points)
  const categoryBonus =
    attraction.category === 'food' && interests.includes('food') ? 10 : 0;
  score += categoryBonus;

  // Duration/variety scoring (0-10 points)
  // Longer stays benefit from diverse attractions
  if (duration >= 3) {
    score += 5;
    matchReasons.push(`Great for ${duration}-day itinerary`);
  }

  // Rating boost (0-10 points)
  if (attraction.rating) {
    const ratingBonus = (attraction.rating / 5) * 10;
    score += ratingBonus;

    if (attraction.rating >= 4.5) {
      matchReasons.push(`Highly rated (${attraction.rating}/5)`);
    }
  }

  // Normalize score to 0-100 range
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  return {
    attraction,
    score: normalizedScore,
    matchReasons,
  };
}

/**
 * Generates recommendations for a user based on preferences
 */
export function generateRecommendations(
  input: RecommendationInput
): ScoredAttraction[] {
  const { attractions, budget, interests, duration, maxResults = 10 } = input;

  // Filter out attractions that don't match critical criteria
  const filteredAttractions = attractions.filter((attr) => {
    // Must have at least one matching interest
    return attr.tags.some((tag) => interests.includes(tag));
  });

  // Score all remaining attractions
  const scored = filteredAttractions.map((attr) =>
    scoreAttraction(attr, budget, interests, duration)
  );

  // Sort by score descending, then by rating descending
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (b.attraction.rating || 0) - (a.attraction.rating || 0);
  });

  // Return top N results
  return scored.slice(0, maxResults);
}

/**
 * Creates Recommendation documents from scored attractions
 */
export function createRecommendationDocs(
  userId: string,
  preferenceId: string,
  destinationId: string,
  scoredAttractions: ScoredAttraction[]
): Omit<Recommendation, 'id' | 'createdAt'>[] {
  return scoredAttractions.map((scored, index) => ({
    userId,
    preferenceId,
    attractionId: scored.attraction.id,
    destinationId,
    score: Math.round(scored.score),
    matchReasons: scored.matchReasons,
    rank: index + 1,
  }));
}

/**
 * Calculates compatibility percentage for display
 */
export function getCompatibilityPercentage(score: number): string {
  return `${Math.round(score)}%`;
}
