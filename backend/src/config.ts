import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 4000),
  tmdbApiKey: process.env.TMDB_API_KEY ?? '',
  tmdbLanguage: process.env.TMDB_LANGUAGE ?? 'en-US',
  tmdbBaseUrl: process.env.TMDB_BASE_URL ?? 'https://api.themoviedb.org/3',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  cacheTtlMs: Number(process.env.MOVIE_CACHE_TTL_MS ?? 300000),
  timeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 8000),
};
