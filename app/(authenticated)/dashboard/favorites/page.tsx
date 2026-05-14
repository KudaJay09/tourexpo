'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import type { Favorite, Attraction } from '@/lib/types/firestore';

interface FavoriteWithAttraction extends Favorite {
  attractionData?: Attraction;
}

export const dynamic = 'force-dynamic';

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteWithAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user || !db) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      try {
        const favRef = collection(db, 'favorites');
        const favQuery = query(favRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(favQuery);

        const favs: FavoriteWithAttraction[] = [];
        const attractionsRef = collection(db, 'attractions');

        for (const favDoc of snapshot.docs) {
          const favData = favDoc.data() as Favorite;

          // Fetch the full attraction data
          const attrDoc = await getDocs(
            query(
              attractionsRef,
              where('__name__', '==', favData.attractionId)
            )
          );

          let attractionData: Attraction | undefined;
          attrDoc.forEach((doc) => {
            attractionData = {
              id: doc.id,
              ...doc.data(),
            } as Attraction;
          });

          favs.push({
            ...favData,
            id: favDoc.id,
            attractionData,
          });
        }

        setFavorites(favs);
      } catch (err) {
        console.error('Error loading favorites:', err);
        setError('Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  const handleRemoveFavorite = async (favoriteId: string) => {
    if (!db) return;

    try {
      await deleteDoc(doc(db, 'favorites', favoriteId));
      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Failed to remove favorite');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-300">Loading favorites...</div>
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
              My Saved Attractions
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {favorites.length} saved {favorites.length === 1 ? 'attraction' : 'attractions'}
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

        {favorites.length === 0 && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You haven't saved any attractions yet.
            </p>
            <button
              onClick={() => router.push('/dashboard/search')}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              Start exploring →
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((fav) => {
            const attr = fav.attractionData;
            return (
              <div
                key={fav.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {fav.attractionName}
                  </h3>
                  <button
                    onClick={() => handleRemoveFavorite(fav.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-lg"
                  >
                    ❌
                  </button>
                </div>

                {attr && (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {attr.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs dark:bg-gray-700 dark:text-gray-300">
                        {attr.category}
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs dark:bg-gray-700 dark:text-gray-300">
                        💰 {attr.budget}
                      </span>
                      {attr.rating && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs dark:bg-gray-700 dark:text-gray-300">
                          ⭐ {attr.rating}/5
                        </span>
                      )}
                    </div>
                  </>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Saved on {new Date(fav.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
