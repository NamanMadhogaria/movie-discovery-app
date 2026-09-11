import { config } from '../config.js';
import { demoMovies } from '../data/demoMovies.js';
import type { Movie, PageResult } from '../types.js';

type TmdbMovie = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  genres?: { name: string }[];
  runtime?: number | null;
};
type TmdbPage = {
  page: number;
  total_pages: number;
  total_results: number;
  results: TmdbMovie[];
};
const image = (path?: string | null, size = 'w500') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

const genreNames: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  27: 'Horror',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export function mapMovie(item: TmdbMovie): Movie {
  return {
    id: item.id,
    title: item.title ?? item.name ?? 'Untitled',
    overview: item.overview?.trim() || 'No description available.',
    posterUrl: image(item.poster_path),
    backdropUrl: image(item.backdrop_path, 'original'),
    releaseDate: item.release_date ?? item.first_air_date ?? null,
    rating: typeof item.vote_average === 'number' ? Math.round(item.vote_average * 10) / 10 : null,
    voteCount: item.vote_count ?? 0,
    genres:
      item.genres?.map((g) => g.name) ??
      item.genre_ids?.map((id) => genreNames[id]).filter(Boolean) ??
      [],
    runtimeMinutes: item.runtime ?? null,
  };
}

export class MovieProviderError extends Error {}

async function request<T>(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(`${config.tmdbBaseUrl}${path}`);
  url.searchParams.set('api_key', config.tmdbApiKey);
  url.searchParams.set('language', config.tmdbLanguage);
  for (const [key, value] of Object.entries(params))
    if (value !== undefined) url.searchParams.set(key, String(value));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new MovieProviderError(`Movie provider returned ${response.status}`);
    return (await response.json()) as T;
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown provider error';
    console.error(`[movie-provider] ${reason}`);
    if (error instanceof MovieProviderError) throw error;
    throw new MovieProviderError(`Movie provider is unavailable: ${reason}`);
  } finally {
    clearTimeout(timer);
  }
}

const demoPage = (items: Movie[], page: number): PageResult<Movie> => ({
  data: items,
  pagination: {
    page,
    totalPages: 1,
    totalResults: items.length,
    hasNextPage: false,
  },
});

export class MovieProvider {
  async discover(page = 1, genre?: string, sortBy = 'popularity.desc'): Promise<PageResult<Movie>> {
    if (!config.tmdbApiKey) {
      let items = [...demoMovies];
      if (genre)
        items = items.filter((m) => m.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
      if (sortBy.includes('vote_average')) items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      return demoPage(items, page);
    }
    try {
      const result = await request<TmdbPage>('/discover/movie', {
        page,
        with_genres: genre,
        sort_by: sortBy,
      });
      return {
        data: result.results.map(mapMovie),
        pagination: {
          page: result.page,
          totalPages: result.total_pages,
          totalResults: result.total_results,
          hasNextPage: result.page < result.total_pages,
        },
      };
    } catch (error) {
      if (config.demoFallback) {
        console.warn('[movie-provider] Using demo catalog because TMDB is unavailable.');
        return demoPage(demoMovies, page);
      }
      throw error;
    }
  }
  async search(query: string, page = 1): Promise<PageResult<Movie>> {
    if (!config.tmdbApiKey)
      return demoPage(
        demoMovies.filter((m) => m.title.toLowerCase().includes(query.toLowerCase())),
        page,
      );
    try {
      const result = await request<TmdbPage>('/search/movie', {
        query,
        page,
        include_adult: 'false',
      });
      return {
        data: result.results.map(mapMovie),
        pagination: {
          page: result.page,
          totalPages: result.total_pages,
          totalResults: result.total_results,
          hasNextPage: result.page < result.total_pages,
        },
      };
    } catch (error) {
      if (config.demoFallback) {
        console.warn('[movie-provider] Using demo catalog because TMDB is unavailable.');
        return demoPage(
          demoMovies.filter((m) => m.title.toLowerCase().includes(query.toLowerCase())),
          page,
        );
      }
      throw error;
    }
  }
  async trending(): Promise<PageResult<Movie>> {
    if (!config.tmdbApiKey) return demoPage(demoMovies.slice(0, 8), 1);
    try {
      const result = await request<TmdbPage>('/trending/movie/week', {});
      return {
        data: result.results.map(mapMovie),
        pagination: {
          page: 1,
          totalPages: 1,
          totalResults: result.results.length,
          hasNextPage: false,
        },
      };
    } catch (error) {
      if (config.demoFallback) {
        console.warn('[movie-provider] Using demo catalog because TMDB is unavailable.');
        return demoPage(demoMovies.slice(0, 8), 1);
      }
      throw error;
    }
  }
  async details(id: number): Promise<Movie> {
    if (!config.tmdbApiKey) {
      const found = demoMovies.find((m) => m.id === id);
      if (!found) throw new MovieProviderError('Movie not found');
      return found;
    }
    try {
      return mapMovie(await request<TmdbMovie>(`/movie/${id}`, {}));
    } catch (error) {
      if (config.demoFallback) {
        const found = demoMovies.find((m) => m.id === id);
        if (found) return found;
      }
      throw error;
    }
  }
}
