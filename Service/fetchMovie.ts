import axios from "axios";

const api_key = process.env.NEXT_PUBLIC_API_KEY;
const url = process.env.NEXT_PUBLIC_BASE_URL;

// Search movie
export const getSearch = async (q: string) => {
  try {
    const response = await axios.get(
      `${url}/search/movie?api_key=${api_key}&query=${q}&page=1&`
    );

    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

export const getSearchFilter = async (q: string, type: string) => {
  try {
    const response = await axios.get(
      `${url}/search/${type}?api_key=${api_key}&query=${q}&page=1&`
    );

    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

// Search TV Show
export const getSearchShow = async (q: string) => {
  try {
    const response = await axios.get(
      `${url}/search/movie?api_key=${api_key}&query=${q}&page=1&`
    );

    const data = await response.data;
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
    return data;
  } catch (error) {
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

export const getTrending = async (type: string, params = {}) => {
  try {
    const response = await axios.get(
      `${url}/trending/${type}/week?page=1&api_key=${api_key}`,
      {
        params: {
          api_key: api_key,
          ...params,
        },
      }
    );

    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

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

export const getDetailShow = async (id: number, params = {}) => {
  try {
    // const response = await axios.get(`${url}/tv/${id}?api_key=${api_key}`);
    const response = await fetch(`${url}/tv/${id}?api_key=${api_key}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return error;
  }
};
export const getCastsDetailMovie = async (id: string) => {
  try {
    const response = await axios.get(
      `${url}/movie/${id}/credits?api_key=${api_key}`
    );

    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

export const getCastsDetailShow = async (id: string) => {
  try {
    const response = await axios.get(
      `${url}/tv/${id}/credits?api_key=${api_key}`
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

// search by genre
export const getSearchByGenre = async (genreId: string, page: unknown) => {
  try {
    const response = await axios.get(
      `${url}/discover/movie?api_key=${api_key}&with_genres=${genreId}&page=${page}`
    );

    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

// get popular casts
export const getPopularCasts = async (page: string) => {
  try {
    const response = await axios.get(
      `${url}/person/popular?api_key=${api_key}&page=${page}`
    );

    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

// get detail cast
export const getDetailCasts = async (id: string) => {
  try {
    const response = await axios.get(
      `${url}/person/${id}/credits?api_key=${api_key}`
    );

    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};
export const getDetailPerson = async (id: string) => {
  try {
    const response = await axios.get(`${url}/person/${id}?api_key=${api_key}`);

    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};
export const getCreditPerson = async (id: string) => {
  try {
    const response = await axios.get(
      `${url}/person/${id}/combined_credits?api_key=${api_key}`
    );

    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

export const getPlayerMovie = async (id: string) => {
  try {
    const response = await axios.get(`https://vidlink.pro/movie/${id}`);

    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

export const getTrailerTV = async (id: string) => {
  try {
    const response = await axios.get(
      `${url}/tv/${id}/videos?api_key=${api_key}`
    );
    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

export const getSimilarMovies = async (id: string, type: string) => {
  try {
    const response = await axios.get(
      `${url}/${type}/${id}/similar?api_key=${api_key}`
    );
    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

export const getRecommendedMovies = async (id: string, type: string) => {
  try {
    const response = await axios.get(
      `${url}/${type}/${id}/recommendations?api_key=${api_key}`
    );
    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};
