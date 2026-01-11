import axios from "axios";
import {
  fetchUserProfileAPI,
  getWatchlistUserAPI,
  getHistoryWatchUserAPI,
  getFavoritesUserAPI,
  getStatsUserAPI,
  getEpisodeAndSeasonUserAPI,
  getShowProgressUserAPI,
  addRecentlyWatched as addRecentlyWatchedAPI,
} from "./actionUser";

export const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((row) => row.startsWith(`${name}=`));
  return cookie ? cookie.split("=")[1] : null;
};

// Kept for backward compatibility if used elsewhere, but ideally should use hooks
export const getToken: any = () => {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        return userObj;
      } catch (error) {
        console.error("Error parsing user data:", error);
        return "";
      }
    }
  }
  return "";
};

export const fetchUserProfile = async () => {
  // Call Server Action
  return await fetchUserProfileAPI();
};

export const getWatchlistUser = async () => {
  return await getWatchlistUserAPI();
};

export const getHistoryWatchUser = async (page = 1) => {
  return await getHistoryWatchUserAPI(page);
};

export const getFavoritesUser = async () => {
  return await getFavoritesUserAPI();
};

export const getStatsUser = async (type: "week" | "month" = "week") => {
  return await getStatsUserAPI(type);
};

// get episode and season tv by user
export const getEpisodeAndSeasonUser = async ({ id, season, episode }: any) => {
  return await getEpisodeAndSeasonUserAPI({ id, season, episode });
};

// get progress tv by user
// Fungsi untuk mendapatkan progress (handle both API dan localStorage)
export const getShowProgressUser = async (id: string) => {
  const token = getCookie("user");

  // Jika ada token, ambil dari API lewat Server Action
  if (token) {
    const data = await getShowProgressUserAPI(id);
    if (data) return data;
  }

  // Jika tidak ada token (atau API fail/null), ambil dari localStorage
  try {
    const history = JSON.parse(localStorage.getItem("watchHistory") || "{}");
    const showData = history[id];

    if (!showData) return null;

    // Transformasi data localStorage ke format API
    const transformedData = {
      contentId: showData.contentId,
      episodes: Object.entries(showData.seasons).flatMap(
        ([season, seasonData]: any) =>
          Object.entries(seasonData.episodes).map(
            ([episode, episodeData]: any) => ({
              season: parseInt(season),
              episode: parseInt(episode),
              title: episodeData.episode_title,
              durationWatched: episodeData.progress.watched,
              totalDuration: episodeData.progress.duration,
              progressPercentage: episodeData.progress.percentage,
              isCompleted: episodeData.progress.percentage >= 90,
              watchedDate: episodeData.last_updated,
            })
          )
      ),
      totalEpisodesWatched: Object.values(showData.seasons).reduce(
        (acc: number, season: any) => acc + Object.keys(season.episodes).length,
        0
      ),
      hasWatchedEpisodes: true,
    };

    return transformedData;
  } catch (error) {
    console.error("Error parsing localStorage data:", error);
    return null;
  }
};

// Fungsi untuk menyimpan progress (handle both API dan localStorage)
export const addRecentlyWatched = async (historyItem: any) => {
  const token = getCookie("user");

  try {
    // Jika ada token, simpan ke API lewat Server Action
    if (token) {
      await addRecentlyWatchedAPI(historyItem);
      return;
    }

    // Simpan ke localStorage baik ada token maupun tidak
    const history = JSON.parse(localStorage.getItem("watchHistory") || "{}");
    const showId = historyItem.contentId;

    const updatedHistory = {
      ...history,
      [showId]: {
        ...history[showId],
        contentId: showId,
        title: historyItem.title,
        type: "tv",
        backdrop_path: historyItem.backdrop_path,
        poster_path: historyItem.poster_path,
        seasons: {
          ...(history[showId]?.seasons || {}),
          [historyItem.season]: {
            episodes: {
              ...(history[showId]?.seasons?.[historyItem.season]?.episodes ||
                {}),
              [historyItem.episode]: {
                progress: {
                  watched: historyItem.durationWatched,
                  duration: historyItem.totalDuration,
                  percentage: historyItem.progressPercentage,
                },
                last_updated: new Date().toISOString(),
                episode_title: historyItem.title,
              },
            },
          },
        },
        last_updated: new Date().toISOString(),
      },
    };

    localStorage.setItem("watchHistory", JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error saving progress:", error);
    throw error;
  }
};
