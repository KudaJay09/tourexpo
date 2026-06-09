"use client";

import { useEffect, useState } from "react";
import {
  fetchAttractionsForDestination,
  fetchDestinations,
} from "@/lib/firestore-helpers";
import type { Attraction, Destination } from "@/lib/firestore-schema";
import { AttractionCard } from "@/components/attraction-card";
import { cn } from "@/lib/utils";
import Link from "next/link";

type DestinationWithAttractions = Destination & {
  attractions: Attraction[];
};

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<
    DestinationWithAttractions[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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
                (a.name ?? a.activity ?? "").localeCompare(
                  b.name ?? b.activity ?? "",
                ),
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
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {destinations.map((destination) => (
            <Link
              href={`/dashboard/destinations/${destination.id}`}
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
                  <>
                    <p
                      className={cn(
                        "mt-5 text-sm leading-7 text-slate-200 md:text-base",
                        !isDescriptionExpanded && "line-clamp-3",
                      )}
                    >
                      {destination.description}
                    </p>
                    {destination.description.length > 250 && (
                      <button
                        type="button"
                        onClick={() =>
                          setIsDescriptionExpanded((prev) => !prev)
                        }
                        className="mt-2 text-xs font-medium text-cyan-300 hover:text-cyan-200 hover:underline"
                      >
                        {isDescriptionExpanded ? "Show less" : "Show more"}
                      </button>
                    )}
                  </>
                ) : null}

                <section className="mt-7">
                  <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Things to do
                  </div>

                  {destination.attractions.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {destination.attractions.map((attraction) => (
                        <AttractionCard
                          key={attraction.id}
                          attraction={attraction}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">
                      No attractions found.
                    </p>
                  )}
                </section>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
