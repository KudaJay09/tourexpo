"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchAttractionsForDestination,
  fetchDestinations,
} from "@/lib/firestore-helpers";
import type { Attraction, Destination } from "@/lib/firestore-schema";
import Image from "next/image";

export default function AttractionsTestPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState("");
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [loadingAttractions, setLoadingAttractions] = useState(false);
  const [destinationsError, setDestinationsError] = useState("");
  const [attractionsError, setAttractionsError] = useState("");

  useEffect(() => {
    const loadDestinations = async () => {
      setLoadingDestinations(true);
      setDestinationsError("");

      try {
        const data = await fetchDestinations();
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setDestinations(sorted);

        if (sorted.length > 0) {
          setSelectedDestinationId(sorted[0].id);
        }
      } catch (error) {
        console.error("Error loading destinations:", error);
        setDestinationsError("Failed to load destinations.");
      } finally {
        setLoadingDestinations(false);
      }
    };

    void loadDestinations();
  }, []);

  const selectedDestination = useMemo(
    () =>
      destinations.find(
        (destination) => destination.id === selectedDestinationId,
      ),
    [destinations, selectedDestinationId],
  );

  const handleFetchAttractions = async () => {
    if (!selectedDestinationId) {
      setAttractionsError("Select a destination first.");
      return;
    }

    setLoadingAttractions(true);
    setAttractionsError("");
    setAttractions([]);
    setHasFetched(false);

    try {
      const data = await fetchAttractionsForDestination(selectedDestinationId);
      const sorted = [...data].sort((a, b) =>
        a.activity.localeCompare(b.activity),
      );
      setAttractions(sorted);
      setHasFetched(true);
    } catch (error) {
      console.error("Error loading attractions:", error);
      setAttractionsError("Failed to fetch attractions for this destination.");
      setHasFetched(true);
    } finally {
      setLoadingAttractions(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-orange-200/60 bg-white/95 p-8 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Attractions Fetch Test
          </h1>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            Validate subcollection reads from destinations/{"{destinationId}"}
            /attractions.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <label
                htmlFor="destination-select"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Destination
              </label>
              <select
                id="destination-select"
                value={selectedDestinationId}
                onChange={(event) =>
                  setSelectedDestinationId(event.target.value)
                }
                disabled={loadingDestinations || destinations.length === 0}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {destinations.length === 0 ? (
                  <option value="">No destinations found</option>
                ) : (
                  destinations.map((destination) => (
                    <option key={destination.id} value={destination.id}>
                      {destination.name}, {destination.country}
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              type="button"
              onClick={handleFetchAttractions}
              disabled={
                loadingDestinations ||
                loadingAttractions ||
                !selectedDestinationId
              }
              className="h-fit self-end rounded-lg bg-orange-600 px-5 py-2 font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingAttractions ? "Fetching..." : "Fetch Attractions"}
            </button>
          </div>

          {loadingDestinations && (
            <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">
              Loading destinations...
            </p>
          )}

          {destinationsError && (
            <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-200">
              {destinationsError}
            </div>
          )}

          {attractionsError && (
            <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-200">
              {attractionsError}
            </div>
          )}

          {!loadingAttractions &&
            !hasFetched &&
            attractions.length === 0 &&
            !attractionsError &&
            selectedDestinationId && (
              <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-300">
                No attractions loaded yet. Click Fetch Attractions to test.
              </div>
            )}

          {!loadingAttractions &&
            hasFetched &&
            attractions.length === 0 &&
            !attractionsError &&
            selectedDestinationId && (
              <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-300">
                Fetch completed: no attractions found for this destination.
              </div>
            )}

          {!loadingAttractions && attractions.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                {attractions.length} attractions found for{" "}
                {selectedDestination?.name ?? "selected destination"}.
              </p>
              <ul className="space-y-3">
                {attractions.map((attraction) => (
                  <li
                    key={attraction.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {attraction.activity}
                    </p>

                    <div className="mt-2">
                      <Image
                        src={attraction.imageUrl}
                        alt={attraction.activity}
                        width={100}
                        height={100}
                        className="mt-2 mr-4 h-24 float-left w-24 rounded object-cover"
                      />
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {attraction.about}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
