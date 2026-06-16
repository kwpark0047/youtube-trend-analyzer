'use client';

interface Props {
  count?: number;
  columns?: number;
}

export default function VideoSkeleton({ count = 12, columns = 4 }: Props) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${columns} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse"
        >
          <div className="aspect-video bg-gray-800" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-800 rounded w-full" />
            <div className="h-3 bg-gray-800 rounded w-2/3" />
            <div className="flex items-center gap-2 mt-3">
              <div className="h-3 bg-gray-800 rounded w-16" />
              <div className="h-3 bg-gray-800 rounded w-12" />
              <div className="h-3 bg-gray-800 rounded w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
