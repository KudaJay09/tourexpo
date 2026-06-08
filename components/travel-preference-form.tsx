"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchAttractionsForDestination,
  fetchDestinations,
} from "@/lib/firestore-helpers";
import type { Destination } from "@/lib/types/firestore";
import Image from "next/image";
import { MdOutlineSubdirectoryArrowRight } from "react-icons/md";
import Link from "next/link";

const BUDGET_OPTIONS = ["budget", "moderate", "luxury"] as const;
const CONTINENT_OPTIONS = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
] as const;

export type TravelPreferenceValues = {
  destination: string;
  destinationId: string;
  budget: (typeof BUDGET_OPTIONS)[number];
  continent: (typeof CONTINENT_OPTIONS)[number] | "";
  imageUrl?: string;
};

type TravelPreferenceFormProps = {
  onSubmit?: (values: TravelPreferenceValues) => void;
};

export default function TravelPreferenceForm({
  onSubmit,
}: TravelPreferenceFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<TravelPreferenceValues>({
    destination: "",
    destinationId: "",
    budget: "moderate",
    continent: "",
    imageUrl: "",
  });
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [destinationError, setDestinationError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [destinationsWithAttractions, setDestinationsWithAttractions] =
    useState<Record<string, boolean>>({});

  const resetDestinationFields = () => ({
    destinationId: "",
    budget: "moderate" as const,
    continent: "" as const,
    imageUrl: "" as const,
  });

  useEffect(() => {
    let isMounted = true;

    const loadDestinations = async () => {
      setDestinationLoading(true);
      setDestinationError("");

      try {
        const data = await fetchDestinations();
        if (!isMounted) return;

        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setDestinations(sorted);
      } catch (error) {
        console.error("Error loading destination suggestions:", error);
        if (!isMounted) return;
        setDestinationError("Could not load destination suggestions.");
      } finally {
        if (isMounted) {
          setDestinationLoading(false);
        }
      }
    };

    void loadDestinations();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDestinationAttractionPresence = async () => {
      if (destinations.length === 0) {
        setDestinationsWithAttractions({});
        return;
      }

      try {
        const entries = await Promise.all(
          destinations.map(async (destination) => {
            const attractions = await fetchAttractionsForDestination(
              destination.id,
            );
            return [destination.id, attractions.length > 0] as const;
          }),
        );

        if (!isMounted) return;

        setDestinationsWithAttractions(Object.fromEntries(entries));
      } catch (error) {
        console.error("Error loading attraction presence:", error);
        if (!isMounted) return;
        setDestinationsWithAttractions({});
      }
    };

    void loadDestinationAttractionPresence();

    return () => {
      isMounted = false;
    };
  }, [destinations]);

  const filteredDestinations = useMemo(() => {
    const query = values.destination.trim().toLowerCase();
    if (!query) return destinations;

    return destinations.filter((destination) => {
      const label = `${destination.name}, ${destination.country}`.toLowerCase();
      return label.includes(query);
    });
  }, [destinations, values.destination]);

  const selectDestination = (destination: Destination) => {
    setValues((prev) => ({
      ...prev,
      destination: `${destination.name}, ${destination.country}`,
      destinationId: destination.id,
      budget: destination.budget,
      continent: destination.continent,
      imageUrl: destination.imageUrl,
    }));
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    router.push(`/dashboard/destinations/${destination.id}`);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(values);
  };

  const handleDestinationKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (!showSuggestions) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setShowSuggestions(true);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredDestinations.length - 1 ? prev + 1 : 0,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredDestinations.length - 1,
      );
      return;
    }

    if (event.key === "Enter") {
      if (
        highlightedIndex >= 0 &&
        highlightedIndex < filteredDestinations.length
      ) {
        event.preventDefault();
        selectDestination(filteredDestinations[highlightedIndex]);
      }
      return;
    }

    if (event.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl rounded-3xl border border-white/20 bg-slate-950/80 p-6 text-white shadow-2xl shadow-slate-950/30 backdrop-blur md:p-8"
    >
      <div className="mb-6 space-y-2">
        <h2 className="text-2xl font-semibold md:text-3xl">
          Build your travel brief &{" "}
          <span className="text-cyan-300 ">Travel Smart.</span>
        </h2>
        <p className="text-sm text-slate-300">
          Enter a destination, choose a budget, and narrow the search by
          continent.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="grid gap-2 md:col-span-3">
          <span className="text-sm font-medium text-slate-200">
            Destination
          </span>
          <div className="relative">
            <input
              type="text"
              value={values.destination}
              onFocus={() => {
                setShowSuggestions(true);
                setHighlightedIndex(-1);
              }}
              onBlur={() => {
                setTimeout(() => {
                  setShowSuggestions(false);
                  setHighlightedIndex(-1);
                }, 120);
              }}
              onKeyDown={handleDestinationKeyDown}
              onChange={(event) => {
                setValues((prev) => ({
                  ...prev,
                  destination: event.target.value,
                  ...resetDestinationFields(),
                }));
                setShowSuggestions(true);
                setHighlightedIndex(-1);
              }}
              placeholder="e.g. Tokyo, Bali, Cape Town"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-controls="destination-suggestion-list"
              aria-autocomplete="list"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 outline-none transition focus:border-cyan-300/70 focus:bg-white/10"
            />

            {showSuggestions && (
              <div
                id="destination-suggestion-list"
                role="listbox"
                className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-1 shadow-2xl"
              >
                {destinationLoading ? (
                  <div className="px-3 py-2 text-sm text-slate-300">
                    Loading destinations...
                  </div>
                ) : destinationError ? (
                  <div className="px-3 py-2 text-sm text-rose-300">
                    {destinationError}
                  </div>
                ) : filteredDestinations.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-slate-300">
                    No destinations found.
                  </div>
                ) : (
                  filteredDestinations.map((destination, index) => {
                    const isHighlighted = index === highlightedIndex;
                    return (
                      <>
                        <button
                          key={destination.id}
                          type="button"
                          role="option"
                          aria-selected={isHighlighted}
                          className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                            isHighlighted
                              ? "bg-cyan-400/20 text-cyan-200"
                              : "text-slate-100 hover:bg-white/10"
                          }`}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            selectDestination(destination);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10">
                              <Image
                                width={80}
                                height={80}
                                src={
                                  destination.imageUrl || "/images/bgimage.jpg"
                                }
                                alt={destination.name}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="font-medium leading-tight">
                                {destination.name}
                              </div>
                              <div className="truncate text-sm text-slate-400">
                                {destination.country}
                              </div>
                            </div>
                          </div>
                        </button>

                        {destinationsWithAttractions[destination.id] && (
                          <div className="ml-17 flex items-center">
                            <MdOutlineSubdirectoryArrowRight size={22} />
                            <Link
                              href={`/destinations/${destination.id}/attractions`}
                              className="underline cursor-pointer mt-1 pl-2 text-[13px] font-medium text-cyan-300"
                            >
                              Things to do
                            </Link>
                          </div>
                        )}
                      </>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-200">Budget</span>
          <select
            value={values.budget}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                budget: event.target.value as TravelPreferenceValues["budget"],
              }))
            }
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-300/70 focus:bg-white/10"
          >
            {BUDGET_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-slate-950">
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-200">Continent</span>
          <select
            value={values.continent}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                continent: event.target
                  .value as TravelPreferenceValues["continent"],
              }))
            }
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-300/70 focus:bg-white/10"
          >
            <option value="" className="bg-slate-950">
              Select a continent
            </option>
            {CONTINENT_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-slate-950">
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
      >
        Search destinations
      </button>
    </form>
  );
}
