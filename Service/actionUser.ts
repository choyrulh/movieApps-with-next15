"use server";

import { cookies } from "next/headers";
import { WatchlistItem } from "@/store/useWatchListStore";

const BASE_URL =
  process.env.BACKEND_API_URL ||
  "https://backend-movie-apps-api-one.vercel.app/api";

const getAuthToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("user")?.value;
};

export const fetchWatchlist = async () => {
  const token = await getAuthToken();
  if (!token) {
    // Return null to indicate to the client to check local storage
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/watchlist`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to fetch watchlist");

    return response.json();
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    // Return empty array or throw? Returning null allows fallback
    return null;
  }
};

export const addToWatchlistAPI = async (item: WatchlistItem, type: string) => {
  const token = await getAuthToken();
  if (!token) throw new Error("Unauthorized");

  const response = await fetch(`${BASE_URL}/watchlist`, {
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
  const token = await getAuthToken();
  if (!token) throw new Error("Unauthorized");

  const response = await fetch(`${BASE_URL}/watchlist/${movieId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to remove from watchlist");

  return response.json();
};

export const addRecentlyWatched = async (item: any) => {
  const token = await getAuthToken();
  // Safe to return if no token, client handles local storage
  if (!token) return null;

  const response = await fetch(`${BASE_URL}/recently-watched`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      type: item.type,
      contentId: item.contentId,
      season: item.season,
      episode: item.episode,
      title: item.title,
      poster: item.poster,
      backdrop_path: item.backdrop_path,
      durationWatched: item.durationWatched,
      totalDuration: item.totalDuration,
      genres: item.genres,
      progressPercentage: item.progressPercentage,
    }),
  });

  if (!response.ok) throw new Error(response.statusText);

  return response.json();
};

export const removeRecentlyWatched = async (id: string) => {
  const token = await getAuthToken();
  if (!token) throw new Error("Unauthorized");

  const response = await fetch(`${BASE_URL}/recently-watched/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to remove from watchlist");

  return response.json();
};

export const clearAllRecentlyWatched = async () => {
  const token = await getAuthToken();
  if (!token) throw new Error("Unauthorized");

  const response = await fetch(`${BASE_URL}/recently-watched`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Gagal menghapus semua riwayat");

  return response.json();
};

export const fetchVideoProgress = async ({ id, season, episode }: any) => {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch(
      `${BASE_URL}/recently-watched/tv/${id}/season/${season}/episode/${episode}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      // throw new Error("Gagal mengambil progress");
      return null;
    }

    const data = await response.json();
    return data.progressPercentage > 0
      ? {
          watched: data.durationWatched,
          duration: data.totalDuration,
          percentage: data.progressPercentage,
        }
      : null;
  } catch (error) {
    console.error("Gagal mengambil progress:", error);
    return null;
  }
};

// New Actions for fetchUser.ts compatibility

export const fetchUserProfileAPI = async () => {
  const token = await getAuthToken();
  if (!token) throw new Error("Token tidak ditemukan");

  const response = await fetch(`${BASE_URL}/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
};

export const getWatchlistUserAPI = async () => {
  const token = await getAuthToken();
  if (!token) throw new Error("Token tidak ditemukan");

  const response = await fetch(`${BASE_URL}/watchlist`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch watchlist");
  return response.json();
};

export const getHistoryWatchUserAPI = async (page = 1) => {
  const token = await getAuthToken();
  if (!token) throw new Error("Token tidak ditemukan");

  const response = await fetch(
    `${BASE_URL}/recently-watched?page=${page}&limit=10`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
};

export const getFavoritesUserAPI = async () => {
  const token = await getAuthToken();
  if (!token) throw new Error("Token tidak ditemukan");

  const response = await fetch(`${BASE_URL}/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch favorites");
  return response.json();
};

export const getStatsUserAPI = async (type: "week" | "month" = "week") => {
  const token = await getAuthToken();
  if (!token) throw new Error("Token tidak ditemukan");

  if (!["week", "month"].includes(type)) {
    type = "week";
  }

  const response = await fetch(`${BASE_URL}/statistics?type=${type}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch stats");
  const data = await response.json();
  console.log(
    "SERVER_STATS_DATA",
    JSON.stringify(data.data?.period?.data?.[0]),
  );
  return data;
};

export const getEpisodeAndSeasonUserAPI = async ({
  id,
  season,
  episode,
}: any) => {
  const token = await getAuthToken();
  if (!token) throw new Error("Token tidak ditemukan");

  const response = await fetch(
    `${BASE_URL}/recently-watched/tv/${id}/season/${season}/episode/${episode}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) throw new Error("Failed to fetch episode progress");
  return response.json();
};

export const getShowProgressUserAPI = async (id: string) => {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch(
      `${BASE_URL}/recently-watched/tv-progress/${id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Error fetching from API:", error);
    return null;
  }
};

export const addToFavoritesAPI = async (item: any) => {
  const token = await getAuthToken();
  if (!token) throw new Error("Unauthorized");

  const response = await fetch(`${BASE_URL}/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) throw new Error("Failed to add to favorites");
  return response.json();
};

export const removeFromFavoritesAPI = async (itemId: number, type: string) => {
  const token = await getAuthToken();
  if (!token) throw new Error("Unauthorized");

  const response = await fetch(`${BASE_URL}/favorites/${itemId}?type=${type}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to remove from favorites");
  return response.json();
};

export const updateUserProfileAPI = async (data: any) => {
  const token = await getAuthToken();
  if (!token) throw new Error("Unauthorized");

  const response = await fetch(`${BASE_URL}/user/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Failed to update profile");
  return response.json();
};

export const changePasswordAPI = async (data: any) => {
  const token = await getAuthToken();
  if (!token) throw new Error("Unauthorized");

  const response = await fetch(`${BASE_URL}/auth/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    try {
      // Try to get error message
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to change password");
    } catch (e) {
      throw new Error("Failed to change password");
    }
  }
  return response.json();
};

export const logAccessAPI = async () => {
  await fetch(`${BASE_URL}/logs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
};

export interface WatchHistory {
  contentId: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  title: string | null;
  poster: string;
  backdrop_path: string | undefined;
  duration: number;
  durationWatched: number;
  totalDuration: number;
  genres: any[] | undefined;
  progressPercentage?: number;
}
