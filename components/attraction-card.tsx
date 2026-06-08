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

        {attraction.tags && attraction.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {attraction.tags.map((tag, index) => (
              <p key={tag} className="text-xs text-slate-400">
                {tag}
                {index < attraction.tags.length - 1 ? "," : ""}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
