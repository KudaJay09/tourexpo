"use client";

import { use, useEffect, useState } from "react";
import {
  fetchAttractionsForDestination,
  fetchDestinationById,
} from "@/lib/firestore-helpers";
import type { Attraction, Destination } from "@/lib/firestore-schema";
import Image from "next/image";
import { AttractionCard } from "@/components/attraction-card";

type DestinationWithAttractions = Destination & {
  attractions: Attraction[];
};

export default function DestinationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [destination, setDestination] =
    useState<DestinationWithAttractions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDestination = async () => {
      setLoading(true);
      setError("");

      try {
        const destinationData = await fetchDestinationById(id);

        if (!destinationData) {
          if (isMounted) {
            setError("Destination not found.");
          }
          return;
        }

        const attractions = await fetchAttractionsForDestination(id);
        const sortedAttractions = [...attractions].sort((a, b) =>
          a.name.localeCompare(b.name),
        );

        if (isMounted) {
          setDestination({
            ...destinationData,
            attractions: sortedAttractions,
          });
        }
      } catch (fetchError) {
        console.error("Error loading destination:", fetchError);
        if (isMounted) {
          setError("Failed to load destination.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadDestination();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
        <div className="mx-auto max-w-5xl text-sm text-slate-300">
          Loading destination...
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error || "Destination not found."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="p-6 md:p-8">
            {destination.imageUrl ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                <Image
                  width={300}
                  height={300}
                  src={destination.imageUrl}
                  alt={destination.name}
                  className="h-72 w-full object-cover md:h-96"
                />
              </div>
            ) : null}

            <div className="pt-6 md:pt-8">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {destination.name}
                {", "}
                {destination.country ? `${destination.country}` : ""}
              </h1>
            </div>

            {destination.description ? (
              <p className="mt-5 text-sm leading-7 text-slate-200 md:text-base line-clamp-3">
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
                    <AttractionCard
                      key={attraction.id}
                      attraction={attraction}
                    />
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
      </div>
    </div>
  );
}
