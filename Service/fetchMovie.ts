"use server";

const api_key = process.env.TMDB_API_KEY;
const url = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";

const buildUrl = (
  endpoint: string,
  params: Record<string, string | number> = {},
) => {
  const urlObj = new URL(
    url.includes("http")
      ? `${url}${endpoint}`
      : `https://api.themoviedb.org/3${endpoint}`,
  );
  urlObj.searchParams.append("api_key", api_key || "");
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlObj.searchParams.append(key, String(value));
    }
  });
  return urlObj.toString();
};

const fetchApi = async (
  fullUrl: string,
  cacheOption: RequestCache = "default",
) => {
  try {
    const response = await fetch(fullUrl, {
      cache: cacheOption,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return error;
  }
};

// Search movie
export const getSearch = async (q: string) => {
  return fetchApi(buildUrl("/search/movie", { query: q, page: 1 }));
};

export const getSearchFilter = async (
  q: string,
  type: string,
  page: string,
) => {
  return fetchApi(buildUrl(`/search/${type}`, { query: q, page }));
};

// Search TV Show
export const getSearchShow = async (q: string) => {
  return fetchApi(buildUrl("/search/tv", { query: q, page: 1 }));
};

// API MOVIE
export const getNowPlaying = async () => {
  return fetchApi(buildUrl("/movie/now_playing", { page: 1 }));
};

export const getGenres = async () => {
  return fetchApi(buildUrl("/genre/movie/list", { language: "en" }));
};

export const getPopularMovie = async (page: number, params = {}) => {
  const result = await fetchApi(
    buildUrl("/movie/popular", { page, ...params }),
  );
  return result?.results || result;
};

export const getTopRated = async () => {
  return fetchApi(buildUrl("/movie/top_rated", { page: 1 }));
};

export const getTrending = async (
  type: "movie" | "tv",
  timeWindow: "day" | "week",
) => {
  return fetchApi(buildUrl(`/trending/${type}/${timeWindow}`));
};

export const getDetailMovie = async (id: number, params = {}) => {
  try {
    const response = await fetch(buildUrl(`/movie/${id}`, params));
    if (!response.ok) throw new Error("Failed to fetch movie details");
    return await response.json();
  } catch (error) {
    throw new Error("Failed to fetch movie details");
  }
};

export const getDetailShow = async (id: number, params = {}) => {
  try {
    const response = await fetch(buildUrl(`/tv/${id}`, params));
    if (!response.ok) throw new Error("Failed to fetch show details");
    return await response.json();
  } catch (error) {
    throw new Error("Failed to fetch show details");
  }
};

export const getCastsDetailMovie = async (id: string) => {
  return fetchApi(buildUrl(`/movie/${id}/credits`));
};

export const getCastsDetailShow = async (id: string) => {
  return fetchApi(buildUrl(`/tv/${id}/credits`));
};

export const getTVEpisodes = async (id: string, seasonNumber: number) => {
  return fetchApi(
    buildUrl(`/tv/${id}/season/${seasonNumber}`, { language: "en-US" }),
  );
};

export const getTVImages = async (id: string) => {
  return fetchApi(buildUrl(`/tv/${id}/images`));
};

export const getUpcoming = async () => {
  return fetchApi(buildUrl("/movie/upcoming", { page: 1 }));
};

// search by genre
export const getSearchByGenre = async (genreId: string, page: unknown) => {
  return fetchApi(
    buildUrl("/discover/movie", {
      with_genres: String(genreId),
      page: String(page),
    }),
  );
};

// get popular casts
export const getPopularCasts = async (page: string) => {
  return fetchApi(buildUrl("/person/popular", { page }));
};

// get detail cast
export const getDetailCasts = async (id: string) => {
  return fetchApi(buildUrl(`/person/${id}/credits`));
};

export const getDetailPerson = async (id: string) => {
  return fetchApi(buildUrl(`/person/${id}`));
};

export const getCreditPerson = async (id: string) => {
  return fetchApi(buildUrl(`/person/${id}/combined_credits`));
};

export const getPlayerMovie = async (id: string) => {
  try {
    const response = await fetch(`https://vidlink.pro/movie/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    return error;
  }
};

export const getTrailerTV = async (id: string) => {
  return fetchApi(buildUrl(`/tv/${id}/videos`));
};

export const getSimilarMovies = async (id: string, type: string) => {
  return fetchApi(buildUrl(`/${type}/${id}/similar`));
};

export const getRecommendedMovies = async (id: string, type: string) => {
  return fetchApi(buildUrl(`/${type}/${id}/recommendations`));
};

export const getUpcomingShow = async (
  type: "movie" | "tv",
  page: string,
  dateRange?: { start?: string; end?: string },
) => {
  try {
    const params: Record<string, string> = {
      region: "ID",
      sort_by: type === "movie" ? "release_date.desc" : "first_air_date.desc",
      with_original_language: "id",
      page: page,
    };

    if (type === "movie" && dateRange?.start && dateRange?.end) {
      params["primary_release_date.gte"] = dateRange.start;
      params["primary_release_date.lte"] = dateRange.end;
    }

    const response = await fetch(buildUrl(`/discover/${type}`, params));
    if (!response.ok) throw new Error("Failed to fetch upcoming shows");
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getFiltered = async (params: Record<string, any>) => {
  const { genre, type, sort, country, rating, year, page, lang } = params;
  const endpoint = type === "movie" ? "/discover/movie" : "/discover/tv";

  return fetchApi(
    buildUrl(endpoint, {
      with_original_language: lang || "",
      sort_by: `release_date.${sort}`,
      with_genres: genre || "",
      "vote_average.gte": rating || "",
      primary_release_year: year || "",
      page: page || 1,
    }),
  );
};

export const getSeasonDetails = async (
  showId: string,
  seasonNumber: string,
) => {
  return fetchApi(buildUrl(`/tv/${showId}/season/${seasonNumber}`));
};

export const getReleaseMovieCurrentMonth = async (
  thisDate: string,
  country: string,
) => {
  try {
    const date = new Date();
    const formattedThisDate = date.toISOString().split("T")[0];
    const next30Days = new Date(date.setDate(date.getDate() + 30))
      .toISOString()
      .split("T")[0];

    let language =
      country === country.toLowerCase()
        ? `${country.toLowerCase()}-${country.toUpperCase()}`
        : country.toLowerCase();

    return fetchApi(
      buildUrl("/discover/movie", {
        region: country,
        sort_by: "release_date.desc",
        "primary_release_date.gte": formattedThisDate,
        "primary_release_date.lte": next30Days,
        with_release_type: "3|2",
        page: 1,
        language: language,
      }),
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};

export const getAiringTodayShow = async () => {
  return fetchApi(buildUrl("/tv/airing_today"));
};

export const getOnTheAirShow = async () => {
  return fetchApi(buildUrl("/tv/on_the_air"));
};

export const getPopularShow = async () => {
  return fetchApi(buildUrl("/tv/popular"));
};

export const getTopRatedShow = async () => {
  return fetchApi(buildUrl("/tv/top_rated"));
};

export const getLatestMoviesByRegion = async (region: string = "ID") => {
  const today = new Date().toISOString().split("T")[0];
  return fetchApi(
    buildUrl("/discover/movie", {
      with_origin_country: region,
      region: region,
      sort_by: "primary_release_date.desc",
      "release_date.lte": today,
    }),
  );
};

export const getLatestTvByRegion = async (region: string = "ID") => {
  const today = new Date().toISOString().split("T")[0];
  return fetchApi(
    buildUrl("/discover/tv", {
      with_origin_country: region,
      sort_by: "first_air_date.desc",
      "first_air_date.lte": today,
    }),
  );
};
