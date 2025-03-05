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
