"use client";

import Banner from "@/components/Banner";
import MovieRow from "@/components/MovieRow";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  getLatestTvByRegion,
  getPopularShow,
  getTopRatedShow,
} from "@/Service/fetchMovie";
import { Loader2 } from "lucide-react";

function Tv() {
  const pathname = usePathname();

  // Fetch Popular TV
  const { data: popularShows, isLoading: isPopLoading } = useQuery({
    queryKey: ["tv", "popular"],
    queryFn: () => getPopularShow(),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Top Rated TV
  const { data: topRatedShows, isLoading: isTopLoading } = useQuery({
    queryKey: ["tv", "top_rated"],
    queryFn: () => getTopRatedShow(),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Korean Dramas
  const { data: krDramas, isLoading: isKrLoading } = useQuery({
    queryKey: ["tv", "korean"],
    queryFn: () => getLatestTvByRegion("KR"),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch Chinese Dramas
  const { data: cnDramas, isLoading: isCnLoading } = useQuery({
    queryKey: ["tv", "chinese"],
    queryFn: () => getLatestTvByRegion("CN"),
    staleTime: 10 * 60 * 1000,
  });

  const isLoading = isPopLoading || isTopLoading || isKrLoading || isCnLoading;

  return (
    <main className="relative min-h-screen pb-20 overflow-x-hidden">
      <Banner type={pathname === "/tv" ? "tv" : "movie"} />

      <div className="-mt-10 relative z-20 md:-mt-0">
        <div className="container mx-auto py-4 max-w-[95.625vw]">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin text-green-500" />
            </div>
          ) : (
            <>
              {/* Popular TV */}
              {popularShows?.results && (
                <MovieRow
                  id="popular-tv"
                  title="Serial TV Populer"
                  movies={popularShows.results}
                />
              )}

              {/* Chinese Dramas */}
              {cnDramas?.results && (
                <MovieRow
                  id="chinese-dramas"
                  title="Drama China Terbaru"
                  movies={cnDramas.results}
                />
              )}

              {/* Korean Dramas */}
              {krDramas?.results && (
                <MovieRow
                  id="korean-dramas"
                  title="Drama Korea Terbaru"
                  movies={krDramas.results}
                />
              )}

              {/* Top Rated TV */}
              {topRatedShows?.results && (
                <MovieRow
                  id="top-rated-tv"
                  title="Serial TV Rating Tertinggi"
                  movies={topRatedShows.results}
                />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default Tv;
