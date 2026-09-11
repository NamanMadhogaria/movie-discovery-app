import type { Movie } from '../types.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export class WishlistStore {
  private items = new Map<string, Map<number, Movie>>();
  private readonly file = fileURLToPath(new URL('../../data/wishlist.json', import.meta.url));
  constructor() {
    if (existsSync(this.file)) {
      try {
        const saved = JSON.parse(readFileSync(this.file, 'utf8')) as Record<string, Movie[]>;
        for (const [device, movies] of Object.entries(saved)) this.items.set(device, new Map(movies.map(movie => [movie.id, movie])));
      } catch { /* A corrupted local cache should not prevent the API from starting. */ }
    }
  }
  private persist(): void {
    mkdirSync(dirname(this.file), { recursive: true });
    const serialised = Object.fromEntries([...this.items.entries()].map(([device, movies]) => [device, [...movies.values()]]));
    writeFileSync(this.file, JSON.stringify(serialised, null, 2), 'utf8');
  }
  list(deviceId: string): Movie[] { return [...(this.items.get(deviceId)?.values() ?? [])].sort((a, b) => a.title.localeCompare(b.title)); }
  add(deviceId: string, movie: Movie): Movie[] { if (!this.items.has(deviceId)) this.items.set(deviceId, new Map()); this.items.get(deviceId)!.set(movie.id, movie); this.persist(); return this.list(deviceId); }
  remove(deviceId: string, movieId: number): Movie[] { this.items.get(deviceId)?.delete(movieId); this.persist(); return this.list(deviceId); }
}
