"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Destination } from "@/lib/types/firestore";

interface SearchState {
  selectedDestination: string;
  budget: "budget" | "moderate" | "luxury";
  interests: string[];
  duration: number;
}

const INTEREST_OPTIONS = [
  "history",
  "nature",
  "adventure",
  "food",
  "art",
  "architecture",
  "spiritual",
  "entertainment",
  "photography",
  "shopping",
];

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formState, setFormState] = useState<SearchState>({
    selectedDestination: "",
    budget: "moderate",
    interests: [],
    duration: 3,
  });

  useEffect(() => {
    const loadDestinations = async () => {
      if (!db) {
        setError("Database not initialized");
        setLoading(false);
        return;
      }

      try {
        const destinationsRef = collection(db, "destinations");
        const snapshot = await getDocs(destinationsRef);
        const dests: Destination[] = [];

        snapshot.forEach((doc) => {
          dests.push({
            id: doc.id,
            ...doc.data(),
          } as Destination);
        });

        dests.sort((a, b) => a.name.localeCompare(b.name));
        setDestinations(dests);

        const destinationIdFromQuery = searchParams.get("destinationId");

        if (
          destinationIdFromQuery &&
          dests.some((dest) => dest.id === destinationIdFromQuery)
        ) {
          setFormState((prev) => ({
            ...prev,
            selectedDestination: destinationIdFromQuery,
          }));
        } else if (dests.length > 0) {
          setFormState((prev) => ({
            ...prev,
            selectedDestination: dests[0].id,
          }));
        }
      } catch (err) {
        console.error("Error loading destinations:", err);
        setError("Failed to load destinations");
      } finally {
        setLoading(false);
      }
    };

    loadDestinations();
  }, [searchParams]);

  const handleInterestToggle = (interest: string) => {
    setFormState((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.selectedDestination) {
      setError("Please select a destination");
      return;
    }

    router.push(`/dashboard/destinations/${formState.selectedDestination}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-300">
          Loading destinations...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Find Your Perfect Destination
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Tell us your travel preferences to get personalized recommendations
          </p>

          {error && (
            <div className="mb-6 rounded bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-6">
            {/* Destination Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Where do you want to go?
              </label>
              <select
                value={formState.selectedDestination}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    selectedDestination: e.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a destination...</option>
                {destinations.map((dest) => (
                  <option key={dest.id} value={dest.id}>
                    {dest.name}, {dest.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What's your budget level?
              </label>
              <div className="flex gap-4">
                {(["budget", "moderate", "luxury"] as const).map((level) => (
                  <label
                    key={level}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="budget"
                      value={level}
                      checked={formState.budget === level}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          budget: e.target.value as SearchState["budget"],
                        }))
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-gray-700 dark:text-gray-300 capitalize">
                      {level === "budget"
                        ? "💰 Budget"
                        : level === "moderate"
                          ? "💵 Moderate"
                          : "💎 Luxury"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Interests Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                What are your interests? (select at least one)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                      formState.interests.includes(interest)
                        ? "bg-indigo-600 text-white dark:bg-indigo-500"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {interest.charAt(0).toUpperCase() + interest.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                How long will you stay?
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={formState.duration}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      duration: parseInt(e.target.value),
                    }))
                  }
                  className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                />
                <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 min-w-fit">
                  {formState.duration}{" "}
                  {formState.duration === 1 ? "day" : "days"}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded bg-indigo-600 py-3 text-white font-medium hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Get Recommendations
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
