const destinations = [
  {
    name: "Bali, Indonesia",
    image: "/images/bgimage.jpg",
    budgetRange: "$900 - $1,500",
  },
  {
    name: "Kyoto, Japan",
    image: "/images/bgimage.jpg",
    budgetRange: "$1,200 - $2,200",
  },
  {
    name: "Lisbon, Portugal",
    image: "/images/bgimage.jpg",
    budgetRange: "$800 - $1,400",
  },
  {
    name: "Cape Town, South Africa",
    image: "/images/bgimage.jpg",
    budgetRange: "$1,100 - $1,900",
  },
  {
    name: "Marrakech, Morocco",
    image: "/images/bgimage.jpg",
    budgetRange: "$700 - $1,300",
  },
  {
    name: "Reykjavik, Iceland",
    image: "/images/bgimage.jpg",
    budgetRange: "$1,500 - $2,700",
  },
];

export default function RecommendationsPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">
            Recommendations
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Destination ideas for your next trip
          </h1>
          <p className="mt-3 text-base leading-7 text-gray-600 dark:text-gray-300">
            A static preview of destination cards with image, name, and budget
            range.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {destinations.map((destination) => (
            <article
              key={destination.name}
              className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800 dark:ring-gray-700"
            >
              <div className="aspect-4/3 overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {destination.name}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      Budget range
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                    Static
                  </span>
                </div>

                <div className="mt-4 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  {destination.budgetRange}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
