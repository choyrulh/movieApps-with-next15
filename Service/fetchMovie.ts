"use server";

import axios from "axios";

const api_key = process.env.TMDB_API_KEY;
const url = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";

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

export const getSearchFilter = async (
  q: string,
  type: string,
  page: string
) => {
  try {
    const response = await axios.get(
      `${url}/search/${type}?api_key=${api_key}&query=${q}&page=${page}&`
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

export const getTrending = async (
  type: "movie" | "tv",
  timeWindow: "day" | "week"
) => {
  try {
    const response = await axios.get(
      `${url}/trending/${type}/${timeWindow}?api_key=${api_key}`
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
  } catch (error) {
    throw new Error("Failed to fetch movie details");
  }
};

export const getDetailShow = async (id: number, params = {}) => {
  try {
    // const response = await axios.get(`${url}/tv/${id}?api_key=${api_key}`);
    const response = await axios.get(`${url}/tv/${id}?api_key=${api_key}`, {
      params: {
        api_key: api_key,
        ...params,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch show details");
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

export const getTVEpisodes = async (id: string, seasonNumber: number) => {
  try {
    const response = await axios.get(
      `${url}/tv/${id}/season/${seasonNumber}?api_key=${api_key}&language=en-US`
    );

    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

export const getTVImages = async (id: string) => {
  try {
    const response = await axios.get(
      `${url}/tv/${id}/images?api_key=${api_key}`
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

export const getUpcomingShow = async (
  type: "movie" | "tv",
  page: string,
  dateRange?: { start?: string; end?: string }
) => {
  try {
    const params: Record<string, string> = {
      api_key: api_key!,
      region: "ID",
      sort_by: type === "movie" ? "release_date.desc" : "first_air_date.desc",
      with_original_language: "id",
      page: page,
    };

    // Tambahkan filter tanggal khusus untuk movie
    if (type === "movie" && dateRange?.start && dateRange?.end) {
      params["primary_release_date.gte"] = dateRange.start;
      params["primary_release_date.lte"] = dateRange.end;
    }

    const response = await axios.get(`${url}/discover/${type}`, { params });

    return response.data;
  } catch (error) {
    throw error; // Lebih baik di-throw untuk handling error di component
  }
};

export const getFiltered = async (params: Record<string, any>) => {
  const { genre, type, sort, country, rating, year, page, lang } = params;
  const baseUrl =
    type === "movie" ? `${url}/discover/movie` : `${url}/discover/tv`;

  const queryParams = new URLSearchParams({
    api_key: `${api_key}`,
    with_original_language: `${lang}`,
    sort_by: `release_date.${sort}`,
    with_genres: `${genre}`,
    "vote_average.gte": `${rating}`,
    primary_release_year: `${year}`,
    page: `${page}`,
  });

  try {
    const response = await axios.get(`${baseUrl}?${queryParams}`);
    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

export const getSeasonDetails = async (
  showId: string,
  seasonNumber: string
) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?api_key=${api_key}`
    );
    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

export const getReleaseMovieCurrentMonth = async (
  thisDate: string,
  country: string
) => {
  try {
    const date = new Date();
    const formattedThisDate = date.toISOString().split("T")[0];
    const next30Days = new Date(date.setDate(date.getDate() + 30))
      .toISOString()
      .split("T")[0];

    // Menentukan format language berdasarkan country
    let language =
      country === country.toLowerCase()
        ? `${country.toLowerCase()}-${country.toUpperCase()}`
        : country.toLowerCase();

    const response = await fetch(
      `${url}/discover/movie?api_key=${api_key}&region=${country}&sort_by=release_date.desc&primary_release_date.gte=${formattedThisDate}&primary_release_date.lte=${next30Days}&with_release_type=3%7C2&page=1&language=${language}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const getAiringTodayShow = async () => {
  try {
    const response = await axios.get(
      `${url}/tv/airing_today?api_key=${api_key}`
    );
    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

export const getOnTheAirShow = async () => {
  try {
    const response = await axios.get(`${url}/tv/on_the_air?api_key=${api_key}`);
    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

export const getPopularShow = async () => {
  try {
    const response = await axios.get(`${url}/tv/popular?api_key=${api_key}`);
    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

export const getTopRatedShow = async () => {
  try {
    const response = await axios.get(`${url}/tv/top_rated?api_key=${api_key}`);
    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};

export const getLatestMoviesByRegion = async (region: string = "ID") => {
  const today = new Date().toISOString().split("T")[0];
  try {
    const response = await axios.get(
      `${url}/discover/movie?api_key=${api_key}&with_origin_country=${region}&region=${region}&sort_by=primary_release_date.desc&release_date.lte=${today}`
    );
    const data = await response.data;
    return data;
  } catch (error) {
    return error;
  }
};
