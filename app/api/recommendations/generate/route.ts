import { NextRequest, NextResponse } from 'next/server';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateRecommendations, createRecommendationDocs } from '@/lib/recommendation-engine';
import type { Attraction, UserPreferences } from '@/lib/types/firestore';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, destinationId, budget, interests, duration } = body;

    if (!userId || !destinationId || !budget || !interests || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch attractions for this destination
    const attractionsRef = collection(db, 'attractions');
    const attractionsQuery = query(
      attractionsRef,
      where('destinationId', '==', destinationId)
    );
    const attractionsSnapshot = await getDocs(attractionsQuery);

    if (attractionsSnapshot.empty) {
      return NextResponse.json(
        { error: 'No attractions found for this destination' },
        { status: 404 }
      );
    }

    const attractions: Attraction[] = [];
    attractionsSnapshot.forEach((doc) => {
      attractions.push({
        id: doc.id,
        ...doc.data(),
      } as Attraction);
    });

    // Generate recommendations using rule-based engine
    const scoredAttractions = generateRecommendations({
      attractions,
      budget,
      interests: interests as string[],
      duration: parseInt(duration),
      maxResults: 10,
    });

    if (scoredAttractions.length === 0) {
      return NextResponse.json(
        { error: 'No suitable recommendations found' },
        { status: 404 }
      );
    }

    // Store user preferences and recommendations in Firestore
    const preferencesRef = collection(db, 'userPreferences');
    const prefDoc = await addDoc(preferencesRef, {
      userId,
      destinationId,
      budget,
      interests,
      duration: parseInt(duration),
      createdAt: Timestamp.now(),
    });

    const recommendationsRef = collection(db, 'recommendations');
    const recommendationDocs = createRecommendationDocs(
      userId,
      prefDoc.id,
      destinationId,
      scoredAttractions
    );

    const savedRecommendations = [];
    for (const rec of recommendationDocs) {
      const docRef = await addDoc(recommendationsRef, {
        ...rec,
        createdAt: Timestamp.now(),
      });
      savedRecommendations.push({
        id: docRef.id,
        ...rec,
        attraction: scoredAttractions.find((s) => s.attraction.id === rec.attractionId)?.attraction,
      });
    }

    return NextResponse.json(
      {
        preferenceId: prefDoc.id,
        recommendations: savedRecommendations.map((rec) => ({
          id: rec.id,
          attraction: rec.attraction,
          score: rec.score,
          matchReasons: rec.matchReasons,
          rank: rec.rank,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Recommendation generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
