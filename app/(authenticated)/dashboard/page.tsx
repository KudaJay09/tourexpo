"use client";

import { useRouter } from "next/navigation";
import TravelPreferenceForm, {
  type TravelPreferenceValues,
} from "@/components/travel-preference-form";

function page() {
  const router = useRouter();

  const handleSubmit = (values: TravelPreferenceValues) => {
    const params = new URLSearchParams();

    if (values.destinationId) {
      params.set("destinationId", values.destinationId);
    }

    params.set("budget", values.budget);

    if (values.continent) {
      params.set("continent", values.continent);
    }

    const query = params.toString();
    router.push(query ? `/dashboard/search?${query}` : "/dashboard/search");
  };

  return (
    <div className="relative min-h-[calc(100vh-7rem)]">
      <div
        className="absolute inset-x-0 -top-20 h-[55vh] bg-cover bg-center -z-20 opacity-40"
        style={{ backgroundImage: "url('/images/bgimage.jpg')" }}
      />

      <div className="relative z-20 px-4 pb-16 sm:px-6 lg:px-8 pt-40">
        <div className="mx-auto w-full max-w-5xl">
          <TravelPreferenceForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}

export default page;
