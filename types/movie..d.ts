export interface Movie {
  id: number;
  title: string;
  vote_average: number;
  poster_path: string;
  backdrop_path?: string;
  overview?: string;
  release_date: string;
  original_language: string;
  vote_average?: number;
  vote_count?: number;
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
