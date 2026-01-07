import axios from "axios";

// const url = process.env.BASE_URL_BACKEND;
const url= "http://localhost:3000/api"

const getToken: any = () => {
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

export const getCookie = (name: string) => {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((row) => row.startsWith(`${name}=`));
  return cookie ? cookie.split("=")[1] : null;
};

export const fetchUserProfile = async () => {
  const token = getCookie("user");
  if (!token) {
    throw new Error("Token tidak ditemukan");
  }

  try {
    const response = await axios.get(
      `https://backend-movie-apps-api-one.vercel.app/api/user/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const getWatchlistUser = async () => {
  const token = getCookie("user");
  if (!token) {
    throw new Error("Token tidak ditemukan");
  }

  try {
    const response = await axios.get(
      `https://backend-movie-apps-api-one.vercel.app/api/watchlist`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const getHistoryWatchUser = async (page = 1) => {
  const token = getCookie("user");
  if (!token) {
    throw new Error("Token tidak ditemukan");
  }

  try {
    // Menambahkan query param page
    const response = await axios.get(
      `https://backend-movie-apps-api-one.vercel.app/api/recently-watched?page=${page}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user history:", error);
    throw error;
  }
};

export const getFavoritesUser = async () => {
  const token = getCookie("user");
  if (!token) {
    throw new Error("Token tidak ditemukan");
  }

  try {
    const response = await axios.get(
      `https://backend-movie-apps-api-one.vercel.app/api/favorites`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const getStatsUser = async (type: "week" | "month" = "week") => {
  const token = getCookie("user");
  if (!token) {
    throw new Error("Token tidak ditemukan");
  }

  if (!["week", "month"].includes(type)) {
    console.warn(`Tipe "${type}" tidak valid, menggunakan default "week".`);
    type = "week";
  }
  try {
    const response = await axios.get(
      `https://backend-movie-apps-api-one.vercel.app/api/statistics?type=${type}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    throw error;
  }
};

// get episode and season tv by user
export const getEpisodeAndSeasonUser = async ({ id, season, episode }: any) => {
  const token = getCookie("user");
  if (!token) {
    throw new Error("Token tidak ditemukan");
  }

  try {
    const response = await axios.get(
      `https://backend-movie-apps-api-one.vercel.app/api/recently-watched/tv/${id}/season/${season}/episode/${episode}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user tv progress season and episode:", error);
    throw error;
  }
};

// get progress tv by user
// Fungsi untuk mendapatkan progress (handle both API dan localStorage)
export const getShowProgressUser = async (id: string) => {
  const token = getCookie("user");
  
  // Jika ada token, ambil dari API
  if (token) {
    try {
      const response = await axios.get(
        `https://backend-movie-apps-api-one.vercel.app/api/recently-watched/tv-progress/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching from API:", error);
      return null;
    }
  }

  // Jika tidak ada token, ambil dari localStorage
  try {
    const history = JSON.parse(localStorage.getItem("watchHistory") || "{}");
    const showData = history[id];
    
    if (!showData) return null;

    // Transformasi data localStorage ke format API
    const transformedData = {
      contentId: showData.contentId,
      episodes: Object.entries(showData.seasons).flatMap(([season, seasonData]: any) => 
        Object.entries(seasonData.episodes).map(([episode, episodeData]: any) => ({
          season: parseInt(season),
          episode: parseInt(episode),
          title: episodeData.episode_title,
          durationWatched: episodeData.progress.watched,
          totalDuration: episodeData.progress.duration,
          progressPercentage: episodeData.progress.percentage,
          isCompleted: episodeData.progress.percentage >= 90,
          watchedDate: episodeData.last_updated
        }))
      ),
      totalEpisodesWatched: Object.values(showData.seasons).reduce(
        (acc: number, season: any) => acc + Object.keys(season.episodes).length, 0
      ),
      hasWatchedEpisodes: true
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
    // Jika ada token, simpan ke API
    if (token) {
      await axios.post(
        "https://backend-movie-apps-api-one.vercel.app/api/recently-watched",
        historyItem,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
              ...(history[showId]?.seasons?.[historyItem.season]?.episodes || {}),
              [historyItem.episode]: {
                progress: {
                  watched: historyItem.durationWatched,
                  duration: historyItem.totalDuration,
                  percentage: historyItem.progressPercentage
                },
                last_updated: new Date().toISOString(),
                episode_title: historyItem.title
              }
            }
          }
        },
        last_updated: new Date().toISOString()
      }
    };

    localStorage.setItem("watchHistory", JSON.stringify(updatedHistory));
    
  } catch (error) {
    console.error("Error saving progress:", error);
    throw error;
  }
};
