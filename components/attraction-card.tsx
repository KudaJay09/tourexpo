"use client";

import Image from "next/image";
import type { Attraction } from "@/lib/firestore-schema";

type AttractionCardProps = {
  attraction: Attraction;
};

export function AttractionCard({ attraction }: AttractionCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
      {attraction.imageUrl ? (
        <div className="relative h-40 w-full overflow-hidden bg-black/20">
          <Image
            src={attraction.imageUrl}
            alt={attraction.activity}
            width={400}
            height={250}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="p-4">
        <h3 className="text-lg font-medium text-white hover:underline cursor-pointer">
          {attraction.activity}
        </h3>

        {/* {attraction.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {attraction.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-cyan-600/80 px-2 py-0.5 text-xs text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        )} */}

        {/* <div className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
          {attraction.category}
        </div> */}
      </div>
    </div>
  );
}
