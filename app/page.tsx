"use client";

import { BannerSkeleton } from "@/components/Banner";
import MovieRow from "@/components/MovieRow"; // Import komponen baru
import { getPopularMovie, getSearchByGenre } from "@/Service/fetchMovie";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import HistoryTontonan from "@/Fragments/HistoryWatch";

// --- Helpers ---
// Mapping Nama Genre User ke TMDB ID
const GENRE_MAP: Record<string, string> = {
  Action: "28",
  Adventure: "12",
  Animation: "16",
  Comedy: "35",
  Crime: "80",
  Documentary: "99",
  Drama: "18",
  Family: "10751",
  Fantasy: "14",
  History: "36",
  Horror: "27",
  Music: "10402",
  Mystery: "9648",
  Romance: "10749",
  "Science Fiction": "878",
  "Sci-Fi": "878",
  "TV Movie": "10770",
  Thriller: "53",
  War: "10752",
  Western: "37",
};

const Banner = dynamic(() => import("@/components/Banner"), {
  ssr: true,
});

// Component kecil untuk fetch data per genre (agar kode rapi)
const GenreSection = ({ genreName }: { genreName: string }) => {
  const genreId = GENRE_MAP[genreName] || GENRE_MAP[genreName.split(" ")[0]]; // Fallback logic

  const { data: movies, isLoading } = useQuery({
    queryKey: ["movies", "genre", genreName],
    queryFn: () => getSearchByGenre(genreId, 1), // Fetch page 1
    enabled: !!genreId,
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  if (isLoading)
    return (
      <div className="h-40 w-full animate-pulse bg-gray-900/30 my-4 rounded-md" />
    );
  if (!movies?.results?.length) return null;

  return (
    <MovieRow
      id={`genre-${genreId}`}
      title={`Karena Anda menyukai ${genreName}`}
      movies={movies.results}
    />
  );
};

export default function Home() {
  // 1. Ambil Profil User untuk Preferensi
  const { user: userProfile, isLoadingUser: isUserLoading } = useAuth();

  // 2. Fetch Popular Movies (Default Row)
  const { data: popularMovies, isLoading: isPopLoading } = useQuery({
    queryKey: ["movie", "popular"],
    queryFn: () => getPopularMovie(1, {}),
    staleTime: 5 * 60 * 1000,
  });

  // 3. Tracking Logs
  useEffect(() => {
    const trackAccess = async () => {
      try {
        await axios.post(
          "https://backend-movie-apps-api-one.vercel.app/api/logs",
          {},
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Tracking error:", error);
      }
    };
    trackAccess();
  }, []);

  // 4. Filter Genre: Ambil maksimal 3 genre pertama user
  const userGenres = useMemo(() => {
    if (!userProfile?.data?.preferences?.favoriteGenres) return [];
    return userProfile.data.preferences.favoriteGenres.slice(0, 3);
  }, [userProfile]);

  return (
    <main className="relative min-h-screen pb-20 overflow-x-hidden">
      {/*<Suspense fallback={<BannerSkeleton />}>*/}
      <Banner type="movie" />
      {/*</Suspense>*/}

      <div className="-mt-10 relative z-20 md:-mt-0 pl-0">
        <div className="container mx-auto py-4 max-w-[95.625vw]">
          <HistoryTontonan />
        </div>

        {/* ROW 1: Popular Movies (Selalu ada) */}
        {isPopLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-green-500" />
          </div>
        ) : (
          <MovieRow
            id="popular"
            title="Populer Saat Ini"
            movies={popularMovies || []}
          />
        )}

        {/* ROW 2, 3, 4: Berdasarkan User Preference */}
        {!isUserLoading && userGenres.length > 0 && (
          <div className="flex flex-col gap-2">
            {userGenres.map((genre: string) => (
              <GenreSection key={genre} genreName={genre} />
            ))}
          </div>
        )}

        {/* Fallback jika user belum punya preferensi atau data sedikit */}
        {!isUserLoading && userGenres.length === 0 && popularMovies && (
          <MovieRow
            id="top-rated"
            title="Rekomendasi Top Rated"
            // Dalam real app ini fetch endpoint top_rated, disini reuse popular sebagai demo
            movies={[...popularMovies].reverse()}
          />
        )}
      </div>
    </main>
  );
}
