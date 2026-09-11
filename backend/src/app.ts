import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';
import { config } from './config.js';
import { TtlCache } from './services/cache.js';
import { MovieProvider, MovieProviderError } from './services/movieProvider.js';
import { WishlistStore } from './services/wishlist.js';

const provider = new MovieProvider();
const cache = new TtlCache(config.cacheTtlMs);
const wishlist = new WishlistStore();
const pageSchema = z.coerce.number().int().min(1).max(500).default(1);
const deviceId = (req: Request) => req.header('x-device-id')?.trim() || 'demo-device';
const cached = async <T>(key: string, fn: () => Promise<T>) => { const hit = cache.get<T>(key); if (hit) return hit; const value = await fn(); cache.set(key, value); return value; };

export const app = express();
app.use(helmet());
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', provider: config.tmdbApiKey ? 'tmdb' : 'demo' }));

app.get('/api/movies/discover', async (req, res, next) => { try { const page = pageSchema.parse(req.query.page); const genre = typeof req.query.genre === 'string' ? req.query.genre : undefined; const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'popularity.desc'; res.json(await cached(`discover:${page}:${genre ?? ''}:${sortBy}`, () => provider.discover(page, genre, sortBy))); } catch (e) { next(e); } });
app.get('/api/movies/trending', async (_req, res, next) => { try { res.json(await cached('trending', () => provider.trending())); } catch (e) { next(e); } });
app.get('/api/movies/search', async (req, res, next) => { try { const query = z.string().trim().min(2).max(100).parse(req.query.q); const page = pageSchema.parse(req.query.page); res.json(await cached(`search:${query}:${page}`, () => provider.search(query, page))); } catch (e) { next(e); } });
app.get('/api/movies/:id', async (req, res, next) => { try { const id = z.coerce.number().int().positive().parse(req.params.id); res.json(await cached(`movie:${id}`, () => provider.details(id))); } catch (e) { next(e); } });

app.get('/api/wishlist', (req, res) => res.json({ data: wishlist.list(deviceId(req)) }));
app.post('/api/wishlist', (req, res, next) => { try { const movie = z.object({ id: z.number(), title: z.string(), overview: z.string(), posterUrl: z.string().nullable(), backdropUrl: z.string().nullable(), releaseDate: z.string().nullable(), rating: z.number().nullable(), voteCount: z.number(), genres: z.array(z.string()), runtimeMinutes: z.number().nullable() }).parse(req.body); res.status(201).json({ data: wishlist.add(deviceId(req), movie) }); } catch (e) { next(e); } });
app.delete('/api/wishlist/:movieId', (req, res, next) => { try { const id = z.coerce.number().int().positive().parse(req.params.movieId); res.json({ data: wishlist.remove(deviceId(req), id) }); } catch (e) { next(e); } });

app.use((_req, _res, next) => next(Object.assign(new Error('Route not found'), { status: 404 })));
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => { const status = error instanceof MovieProviderError ? 503 : (error as { status?: number }).status ?? 400; const message = error instanceof z.ZodError ? 'Invalid request parameters' : error instanceof Error ? error.message : 'Unexpected server error'; res.status(status).json({ error: { code: status === 503 ? 'MOVIE_PROVIDER_UNAVAILABLE' : 'REQUEST_FAILED', message } }); });
