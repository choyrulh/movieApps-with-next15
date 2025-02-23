
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-28 space-y-4 animate-pulse">
        {/* Title Skeleton */}
        <Skeleton className="h-6 w-48 bg-gray-800 rounded-lg" />

        {/* Server Selector Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24 bg-gray-800 rounded-md" />
          <Skeleton className="h-10 w-32 bg-gray-800 rounded-md" />
        </div>

        {/* Season/Episode Selector Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-12 w-48 bg-gray-800 rounded-lg" />
          
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-10 w-10 bg-gray-800 rounded-lg relative"
              >
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                  <div className="h-full bg-gray-600 w-1/2" />
                </div>
              </Skeleton>
            ))}
          </div>
        </div>

        {/* Video Player Skeleton */}
        <div className="aspect-video w-full bg-gray-800 rounded-lg overflow-hidden shadow-xl relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>

        {/* Progress Info Skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32 bg-gray-800 rounded-md" />
          <Skeleton className="h-4 w-24 bg-gray-800 rounded-md" />
        </div>
      </div>
    </div>
  );
}