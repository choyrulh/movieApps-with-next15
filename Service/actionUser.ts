import { getCookie } from "@/Service/fetchUser";
import { WatchlistItem } from "@/store/useWatchListStore";

const API_URL = "https://backend-movie-apps-api-one.vercel.app/api/watchlist";

export const fetchWatchlist = async () => {
  const token = getCookie("user");
  if (!token) {
    const localData = JSON.parse(
      localStorage.getItem("watchlist-storage") || "{}"
    );
    return localData?.state?.watchlist || [];
  }

  const response = await fetch(API_URL, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to fetch watchlist");

  return response.json();
};

export const addToWatchlistAPI = async (item: WatchlistItem, type: string) => {
  const token = getCookie("user");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      movieId: item.id,
      title: item.title || item.name,
      poster: item.poster_path,
      type: type,
      release_date: item.release_date,
      backdrop_path: item.backdrop_path,
    }),
  });

  if (!response.ok) throw new Error("Failed to add to watchlist");

  return response.json();
};

export const removeFromWatchlistAPI = async (movieId: number) => {
  const token = getCookie("user");
  const response = await fetch(`${API_URL}/${movieId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to remove from watchlist");

  return response.json();
};

export const addRecentlyWatched = async (item: WatchHistory) => {
  const token = getCookie("user");
  const response = await fetch(
    "https://backend-movie-apps-api-one.vercel.app/api/recently-watched",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        movieId: item.movieId,
        title: item.title,
        poster: item.poster,
        backdrop_path: item.backdrop_path,
        duration: item.duration,
        durationWatched: item.durationWatched,
        totalDuration: item.totalDuration,
        genres: item.genres,
        progressPercentage: item.progressPercentage,
      }),
    }
  );

  if (!response.ok) throw new Error(response.statusText);

  return response.json();
};

export interface WatchHistory {
  movieId: number;
  title: string | null;
  poster: string;
  backdrop_path: string | undefined;
  duration: number;
  durationWatched: number;
  totalDuration: number;
  genres: any[] | undefined;
  progressPercentage?: number; // Opsional karena dihitung di backend
}
