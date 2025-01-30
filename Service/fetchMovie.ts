import axios from "axios";

const api_key = process.env.NEXT_PUBLIC_API_KEY;
const url = process.env.NEXT_PUBLIC_BASE_URL;

// Search movie
const getSearch = async (q: string) => {
  try {
    const response = await fetch(
      `${url}/search/movie?api_key=${api_key}&query=${q}&page=1&`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return error;
  }
};

// API MOVIE
export const getNowPlaying = async () => {
  try {
    const response = await fetch(
      `${url}/movie/now_playing?page=1&api_key=${api_key}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("data");
    return data;
  } catch (error) {
    console.error("Error fetching now playing movies:", error);
    throw error; // Lempar error agar bisa ditangani di tempat lain
  }
};

export const getGenres = async () => {
  try {
    const response = await fetch(
      `${url}/genre/movie/list?api_key=${api_key}&language=en`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return error;
  }
};

export const getPopularMovie = async (page: number, params = {}) => {
  try {
    const response = await axios.get(
      `${url}/movie/popular?page=${page}&api_key=${api_key}`,
      {
        params: {
          api_key: api_key,
          page: page,
          ...params,
        },
      }
    );

    const data = await response.data?.results;

    return data;
  } catch (error) {
    return error;
  }
};

const getTopRated = async () => {
  try {
    const response = await fetch(
      `${url}/movie/top_rated?page=1&api_key=${api_key}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return error;
  }
};

export const getTrending = async () => {
  try {
    const response = await axios.get(
      `${url}/trending/movie/week?page=1&api_key=${api_key}`
    );

    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

const getUpcoming = async () => {
  try {
    const response = await fetch(
      `${url}/movie/upcoming?page=1&api_key=${api_key}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return error;
  }
};

// API TV
// const getTrendingShow = axiosCreate.get(
//   "/trending/tv/week?page=1&type=all&api_key=" + api_key
// );
// const getGenrestv = async () => {
//   const response = await axiosCreate.get(
//     `/genre/tv/list?api_key=${api_key}&language=en`
//   );
//   return response.data;
// };
// const getPopularTV = axiosCreate.get("/tv/popular?page=1&api_key=" + api_key);
// const getTopRatedTV = axiosCreate.get(
//   "/tv/top_rated?page=1&api_key=" + api_key
// );

//detail movie
export const getDetailMovie = async (id: number, params = {}) => {
  try {
    const response = await axios.get(`${url}/movie/${id}?api_key=${api_key}`, {
      params: {
        api_key: api_key,
        ...params,
      },
    });

    return response.data;

    // const data = await response.json();
    // return data;
  } catch (error) {
    return error;
  }
};

// search by genre
const getSearchByGenre = async (genreId: number) => {
  try {
    const response = await fetch(
      `${url}/discover/movie?api_key=${api_key}&with_genres=${genreId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return error;
  }
};

export default {
  // getNowPlaying,
  getGenres,
  getSearch,
  //   getGenrestv,
  getTopRated,
  getUpcoming,
  getTrending,
  //   getTrendingShow,
  //   getPopularTV,
  //   getTopRatedTV,
  getDetailMovie,
  getSearchByGenre,
};
