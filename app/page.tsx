"use client";

import MovieRow from "@/components/MovieRow";
import {
  getPopularMovie,
  getSearchByGenre,
  getLatestMoviesByRegion,
} from "@/Service/fetchMovie";
import { logAccessAPI } from "@/Service/actionUser";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import HistoryTontonan from "@/Fragments/HistoryWatch";

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

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
  Thriller: "53",
  War: "10752",
  Western: "37",
};

const Banner = dynamic(() => import("@/components/Banner"), { ssr: true });

/* ---------------------------------- */
/* Genre Section */
/* ---------------------------------- */

const GenreSection = ({ genreName }: { genreName: string }) => {
  const genreId = GENRE_MAP[genreName] || GENRE_MAP[genreName.split(" ")[0]];

  const { data, isLoading } = useQuery({
    queryKey: ["movies", "genre", genreName],
    queryFn: () => getSearchByGenre(genreId, 1),
    enabled: !!genreId,
    staleTime: 30 * 60 * 1000,
  });

  if (isLoading || !data?.results?.length) return null;

  return (
    <MovieRow
      id={`genre-${genreId}`}
      title={`Karena Anda menyukai ${genreName}`}
      movies={data.results}
    />
  );
};

/* ---------------------------------- */
/* Home */
/* ---------------------------------- */

export default function Home() {
  const { user: userProfile, isLoadingUser } = useAuth();
  const [userRegion, setUserRegion] = useState("ID");

  /* ---------- Fetch Data ---------- */

  const { data: popularMovies, isLoading: isPopLoading } = useQuery({
    queryKey: ["movie", "popular"],
    queryFn: () => getPopularMovie(1, {}),
    staleTime: 5 * 60 * 1000,
  });

  const { data: regionalMovies, isLoading: isRegLoading } = useQuery({
    queryKey: ["movie", "regional", userRegion],
    queryFn: () => getLatestMoviesByRegion(userRegion),
    staleTime: 10 * 60 * 1000,
  });

  /* ---------- Effects ---------- */

  useEffect(() => {
    axios
      .get("https://ipapi.co/json/")
      .then((res) => {
        if (res.data?.country_code) {
          setUserRegion(res.data.country_code);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    logAccessAPI().catch(() => {});
  }, []);

  /* ---------- Derived State ---------- */

  const userGenres = useMemo(() => {
    return userProfile?.data?.preferences?.favoriteGenres?.slice(0, 3) || [];
  }, [userProfile]);

  const isMainLoading = isRegLoading || isPopLoading;

  /* ---------- Render Helpers ---------- */

  const mainMovieSection = useMemo(() => {
    if (regionalMovies?.results?.length > 0) {
      return (
        <MovieRow
          id="regional-latest"
          title={`Film Terbaru di Negara Anda (${userRegion})`}
          movies={regionalMovies.results}
        />
      );
    }

    return (
      <MovieRow
        id="popular"
        title="Populer Saat Ini"
        movies={popularMovies || []}
      />
    );
  }, [regionalMovies, popularMovies, userRegion]);

  /* ---------- UI ---------- */

  return (
    <main className="relative min-h-screen pb-20 overflow-x-hidden">
      <Banner type="movie" />

      <div className="-mt-10 relative z-20 md:-mt-0">
        <div className="container mx-auto py-4 max-w-[95.625vw]">
          <HistoryTontonan />
        </div>

        {/* Regional / Popular */}
        {isMainLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-green-500" />
          </div>
        ) : (
          mainMovieSection
        )}

        {/* User Preference */}
        {!isLoadingUser && userGenres.length > 0 && (
          <div className="flex flex-col gap-2">
            {userGenres.map((genre: any) => (
              <GenreSection key={genre} genreName={genre} />
            ))}
          </div>
        )}

        {/* Fallback */}
        {!isLoadingUser && userGenres.length === 0 && popularMovies && (
          <MovieRow
            id="top-rated"
            title="Rekomendasi Top Rated"
            movies={[...popularMovies].reverse()}
          />
        )}
      </div>
    </main>
  );
}
