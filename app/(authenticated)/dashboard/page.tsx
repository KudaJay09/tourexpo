import TravelPreferenceForm from "@/components/travel-preference-form";

function page() {
  return (
    <div className="relative min-h-[calc(100vh-7rem)]">
      <div
        className="absolute inset-x-0 -top-20 h-[55vh] bg-cover bg-center -z-20 opacity-40"
        style={{ backgroundImage: "url('/images/bgimage.jpg')" }}
      />

      <div className="relative z-20 px-4 pb-16 sm:px-6 lg:px-8 pt-40">
        <div className="mx-auto w-full max-w-5xl">
          <TravelPreferenceForm />
        </div>
      </div>
    </div>
  );
}

export default page;
