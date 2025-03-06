export interface Movie {
  id: number;
  name?: string;
  title: string | null;
  original_name: string;
  vote_average: number;
  poster_path: string;
  backdrop_path?: string;
  overview?: string;
  episode_run_time?: number[];
  adult?: boolean;
  release_date: string;
  first_air_date?: string;
  last_air_date?: string;
  media_type?: string;
  number_of_episodes?: number;
  number_of_seasons?: number;
  next_episode_to_air: {
    air_date: string;
    episode_number: number;
    name: string;
    overview: string;
    production_code: string;
    season_number: number;
    show_id: number;
    still_path: string;
    vote_average: number;
    vote_count: number;
  };
  networks?: {
    name: string;
    id: number;
    logo_path: string;
    origin_country: string;
  };
  original_language: string;
  vote_average?: number;
  vote_count?: number;
  budget?: number;
  revenue?: number;
  runtime?: number;
  spoken_languages?: { iso_639_1: string; name: string }[];
  status?: string;
  production_companies?: { name: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  genre_ids?: number[];
  credits?: { cast: { name: string; character: string }[] };
  genres?: Genre[];
  runtime?: number;
  videos?: {
    results: Video[];
  };
}

interface Genre {
  id: number;
  name: string;
}

interface Video {
  key: string;
  site: string;
  type: string;
}
