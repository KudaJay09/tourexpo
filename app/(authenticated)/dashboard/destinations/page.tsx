"use client";

import { useEffect, useState } from "react";
import {
  fetchAttractionsForDestination,
  fetchDestinations,
} from "@/lib/firestore-helpers";
import type { Attraction, Destination } from "@/lib/firestore-schema";

type DestinationWithAttractions = Destination & {
  attractions: Attraction[];
};

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<
    DestinationWithAttractions[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDestinations = async () => {
      setLoading(true);
      setError("");

      try {
        const destinationData = await fetchDestinations();
        const sortedDestinations = [...destinationData].sort((a, b) =>
          a.name.localeCompare(b.name),
        );

        const destinationCards = await Promise.all(
          sortedDestinations.map(async (destination) => {
            const attractions = await fetchAttractionsForDestination(
              destination.id,
            );

            return {
              ...destination,
              attractions: [...attractions].sort((a, b) =>
                a.name.localeCompare(b.name),
              ),
            };
          }),
        );

        if (isMounted) {
          setDestinations(destinationCards);
        }
      } catch (fetchError) {
        console.error("Error loading destinations:", fetchError);
        if (isMounted) {
          setError("Failed to load destinations.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadDestinations();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
        <div className="mx-auto max-w-5xl text-sm text-slate-300">
          Loading destinations...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Destinations
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
            Browse each destination in the order you requested: name, image,
            description, then its things to do.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {destinations.map((destination) => (
            <article
              key={destination.id}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur"
            >
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-white md:text-3xl">
                  {destination.name}
                </h2>

                {destination.imageUrl ? (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                    <img
                      src={destination.imageUrl}
                      alt={destination.name}
                      className="h-72 w-full object-cover md:h-96"
                    />
                  </div>
                ) : null}

                {destination.description ? (
                  <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
                    {destination.description}
                  </p>
                ) : null}

                <section className="mt-7">
                  <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Things to do
                  </div>

                  {destination.attractions.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {destination.attractions.map((attraction) => (
                        <div
                          key={attraction.id}
                          className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                        >
                          <h3 className="text-lg font-medium text-white">
                            {attraction.name}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {attraction.description}
                          </p>
                          <div className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                            {attraction.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">
                      No attractions found for this destination yet.
                    </p>
                  )}
                </section>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
