"use client";

import { useState } from "react";

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
  budget: (typeof BUDGET_OPTIONS)[number];
  continent: (typeof CONTINENT_OPTIONS)[number] | "";
};

type TravelPreferenceFormProps = {
  onSubmit?: (values: TravelPreferenceValues) => void;
};

export default function TravelPreferenceForm({
  onSubmit,
}: TravelPreferenceFormProps) {
  const [values, setValues] = useState<TravelPreferenceValues>({
    destination: "",
    budget: "moderate",
    continent: "",
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(values);
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
          <input
            type="text"
            value={values.destination}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                destination: event.target.value,
              }))
            }
            placeholder="e.g. Tokyo, Bali, Cape Town"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 outline-none transition focus:border-cyan-300/70 focus:bg-white/10"
          />
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
