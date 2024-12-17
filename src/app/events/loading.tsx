export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Hero section skeleton */}
      <div className="relative h-96 bg-gray-200">
        <div className="relative mx-auto max-w-7xl py-24 px-6 sm:py-32 lg:px-8">
          <div className="h-12 w-48 bg-gray-300 rounded" />
          <div className="mt-6 h-24 w-96 bg-gray-300 rounded" />
        </div>
      </div>

      {/* Event list skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
              <div className="h-48 bg-gray-200" />
              <div className="flex-1 bg-white p-6">
                <div className="h-6 w-3/4 bg-gray-200 rounded" />
                <div className="mt-3 h-20 bg-gray-200 rounded" />
                <div className="mt-6 space-y-2">
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  <div className="h-4 w-1/3 bg-gray-200 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
