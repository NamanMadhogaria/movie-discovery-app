export type Movie = {
  id: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  rating: number | null;
  voteCount: number;
  genres: string[];
  runtimeMinutes: number | null;
};
export type PageResult = {
  data: Movie[];
  pagination: {
    page: number;
    totalPages: number;
    totalResults: number;
    hasNextPage: boolean;
  };
};
