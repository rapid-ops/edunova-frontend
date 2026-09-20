export const SkeletonCard = () => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
    <div className="h-4 bg-gray-800 rounded w-3/4 mb-3" />
    <div className="h-3 bg-gray-800 rounded w-1/2 mb-2" />
    <div className="h-3 bg-gray-800 rounded w-2/3" />
  </div>
);

export const SkeletonStat = () => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse">
    <div className="h-3 bg-gray-800 rounded w-1/2 mb-3" />
    <div className="h-8 bg-gray-800 rounded w-1/3" />
  </div>
);

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonPage = () => (
  <div className="min-h-screen bg-gray-950 p-6">
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-2 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStat key={i} />
        ))}
      </div>
      <SkeletonList count={5} />
    </div>
  </div>
);
