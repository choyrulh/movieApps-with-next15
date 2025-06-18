// app/tv/[id]/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="mx-auto px-4 pt-8">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Poster Skeleton */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <Skeleton className="aspect-[2/3] w-full rounded-xl" />
          </div>

          {/* Info Skeleton */}
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-3/4 bg-gray-800" />
            <div className="flex flex-wrap gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 bg-gray-800 rounded-full" />
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-gray-800" />
              <Skeleton className="h-4 w-5/6 bg-gray-800" />
              <Skeleton className="h-4 w-4/6 bg-gray-800" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-3/4 bg-gray-800" />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Video Player Skeleton */}
          <div className="lg:w-2/3 space-y-4">
            <Skeleton className="aspect-video w-full bg-gray-800 rounded-xl" />
            
            {/* Navigation Buttons Skeleton */}
            <div className="flex justify-between gap-4">
              <Skeleton className="h-10 w-1/2 bg-gray-800 rounded-lg" />
              <Skeleton className="h-10 w-1/2 bg-gray-800 rounded-lg" />
            </div>

            {/* Current Episode Info Skeleton */}
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
              <Skeleton className="h-6 w-2/3 bg-gray-700" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-gray-700" />
                <Skeleton className="h-4 w-5/6 bg-gray-700" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24 bg-gray-700" />
                <Skeleton className="h-4 w-16 bg-gray-700" />
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:w-1/3 bg-gray-800/50 rounded-xl p-4">
            {/* Toggle Buttons Skeleton */}
            <div className="flex mb-4">
              <Skeleton className="flex-1 h-10 bg-gray-700 rounded-t-lg" />
              <Skeleton className="flex-1 h-10 bg-gray-700 rounded-t-lg" />
            </div>

            {/* Content Skeleton */}
            <div className="space-y-4">
              {/* Season Selector Skeleton */}
              <Skeleton className="h-10 w-full bg-gray-700 rounded-lg" />

              {/* Episode List Skeleton */}
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-gray-700/30 rounded-lg">
                    <Skeleton className="w-28 h-28 bg-gray-700 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-gray-700" />
                      <div className="flex gap-3">
                        <Skeleton className="h-3 w-16 bg-gray-700" />
                        <Skeleton className="h-3 w-12 bg-gray-700" />
                      </div>
                      <Skeleton className="h-3 w-full bg-gray-700" />
                      <Skeleton className="h-3 w-5/6 bg-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}