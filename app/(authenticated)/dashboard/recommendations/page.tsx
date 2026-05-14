'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, query, where, getDocs, Timestamp, doc } from 'firebase/firestore';
import type { Attraction } from '@/lib/types/firestore';

interface Recommendation {
  id: string;
  attraction: Attraction;
  score: number;
  matchReasons: string[];
  rank: number;
}

export const dynamic = 'force-dynamic';

export default function RecommendationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [savingFav, setSavingFav] = useState<Set<string>>(new Set());

  const destinationId = searchParams.get('destinationId');
  const budget = searchParams.get('budget');
  const interests = searchParams.get('interests')?.split(',') || [];
  const duration = searchParams.get('duration');

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user || !destinationId || !budget || !duration) {
        setError('Missing required parameters');
        setLoading(false);
        return;
      }

      if (!db) {
        setError('Database not initialized');
        setLoading(false);
        return;
      }

      try {
        // Call API to generate recommendations
        const response = await fetch('/api/recommendations/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            destinationId,
            budget,
            interests,
            duration: parseInt(duration),
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Failed to generate recommendations');
          setLoading(false);
          return;
        }

        const data = await response.json();
        setRecommendations(data.recommendations);

        // Load user's existing favorites
        const favRef = collection(db, 'favorites');
        const favQuery = query(favRef, where('userId', '==', user.uid));
        const favSnapshot = await getDocs(favQuery);
        const favSet = new Set<string>();
        favSnapshot.forEach((doc) => {
          const favData = doc.data();
          favSet.add(favData.attractionId);
        });
        setFavorites(favSet);
      } catch (err) {
        console.error('Error loading recommendations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [user, destinationId, budget, duration, interests]);

  const handleToggleFavorite = async (attractionId: string, attractionName: string) => {
    if (!user || !db) return;

    setSavingFav((prev) => new Set([...prev, attractionId]));

    try {
      if (favorites.has(attractionId)) {
        // Remove from favorites
        const favRef = collection(db, 'favorites');
        const favQuery = query(
          favRef,
          where('userId', '==', user.uid),
          where('attractionId', '==', attractionId)
        );
        const snapshot = await getDocs(favQuery);
        snapshot.forEach((document) => {
          deleteDoc(document.ref);
        });

        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(attractionId);
          return newSet;
        });
      } else {
        // Add to favorites
        const favRef = collection(db, 'favorites');
        await addDoc(favRef, {
          userId: user.uid,
          attractionId,
          destinationId,
          attractionName,
          createdAt: Timestamp.now(),
        });

        setFavorites((prev) => new Set([...prev, attractionId]));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setSavingFav((prev) => {
        const newSet = new Set(prev);
        newSet.delete(attractionId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-300">
          Generating recommendations...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Recommended Attractions
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Based on your preferences: {interests.join(', ')} • {budget} budget • {duration} days
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/search')}
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            New Search
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 rounded bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}

        {recommendations.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">
              No recommendations found. Try adjusting your preferences.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {recommendations.map((rec) => {
            const isFavorite = favorites.has(rec.attraction.id);
            const isSaving = savingFav.has(rec.attraction.id);

            return (
              <div
                key={rec.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {rec.attraction.name}
                      </h2>
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium dark:bg-indigo-900 dark:text-indigo-200">
                        #{rec.rank}
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium dark:bg-green-900 dark:text-green-200">
                        {Math.round(rec.score)}% Match
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {rec.attraction.description}
                    </p>

                    {/* Tags and info */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm dark:bg-gray-700 dark:text-gray-300">
                        {rec.attraction.category}
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm dark:bg-gray-700 dark:text-gray-300">
                        💰 {rec.attraction.budget}
                      </span>
                      {rec.attraction.rating && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm dark:bg-gray-700 dark:text-gray-300">
                          ⭐ {rec.attraction.rating}/5
                        </span>
                      )}
                    </div>

                    {/* Match reasons */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 mb-4">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                        Why we recommend this:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                        {rec.matchReasons.map((reason, idx) => (
                          <li key={idx}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Favorite button */}
                  <button
                    onClick={() =>
                      handleToggleFavorite(rec.attraction.id, rec.attraction.name)
                    }
                    disabled={isSaving}
                    className={`ml-4 px-4 py-2 rounded font-medium transition-colors flex-shrink-0 ${
                      isFavorite
                        ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    } ${isSaving ? 'opacity-50' : ''}`}
                  >
                    {isSaving ? '...' : isFavorite ? '❤️ Saved' : '🤍 Save'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => router.push('/dashboard/favorites')}
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            View My Saved Favorites →
          </button>
        </div>
      </div>
    </div>
  );
}
