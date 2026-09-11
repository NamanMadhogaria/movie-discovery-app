import { describe, expect, it } from 'vitest';
import { WishlistStore } from './wishlist.js';
import type { Movie } from '../types.js';

const movie: Movie = { id: 1, title: 'Example', overview: '', posterUrl: null, backdropUrl: null, releaseDate: null, rating: 7, voteCount: 1, genres: [], runtimeMinutes: null };
describe('WishlistStore', () => { it('does not duplicate a movie and isolates devices', () => { const store = new WishlistStore(); store.add('a', movie); store.add('a', movie); expect(store.list('a')).toHaveLength(1); expect(store.list('b')).toHaveLength(0); }); });
