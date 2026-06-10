"use client";

import { TravelersChoiceData } from "@/data";
import Link from "next/dist/client/link";
import Image from "next/image";

function TravelersChoice() {
  const date = new Date().getFullYear();

  console.log(date);
  return (
    <div className="min-h-screen px-4 py-12">
      <h1 className="text-3xl font-bold text-center">
        Travelers' Choice Best of 2026
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {TravelersChoiceData.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className="rounded-lg shadow-md overflow-hidden"
          >
            <div className="relative">
              <Image
                src={item.image}
                alt={item.name}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
              <p className="absolute top-4 right-4 bg-[#FFC56F] p-1 rounded px-2 text-black">
                {date}
              </p>
              <div className="p-4 absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/50 to-transparent">
                <h2
                  className="text-xl font-extrabold mb-2 hover:underline 
                "
                >
                  {item.name}
                </h2>
                <p className="text-gray-300 text-sm">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default TravelersChoice;
