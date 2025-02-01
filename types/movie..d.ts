export interface Movie {
  id: number;
  name?: string;
  title: string | null;
  original_name: string;
  vote_average: number;
  poster_path: string;
  backdrop_path?: string;
  overview?: string;
  adult?: boolean;
  release_date: string;
  first_air_date: string;
  original_language: string;
  vote_average?: number;
  vote_count?: number;
  budget?: number;
  revenue?: number;
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
