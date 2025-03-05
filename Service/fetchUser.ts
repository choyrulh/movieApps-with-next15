import axios from "axios";

const url = process.env.BASE_URL_BACKEND;

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
  const cookie = cookies.find(row => row.startsWith(`${name}=`));
  return cookie ? cookie.split("=")[1] : null;
};


export const fetchUserProfile = async () => {
  const token = getCookie('user');
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
  const token = getCookie('user');
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

export const getHistoryWatchUser = async () => {
  const token = getCookie('user');
  if (!token) {
    throw new Error("Token tidak ditemukan");
  }

  try {
    const response = await axios.get(
      `https://backend-movie-apps-api-one.vercel.app/api/recently-watched`,
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

export const getFavoritesUser = async () => {
  const token = getCookie('user');
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
    const response = await axios.get(`https://backend-movie-apps-api-one.vercel.app/api/statistics?type=${type}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    throw error;
  }
};