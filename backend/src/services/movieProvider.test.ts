import { describe, expect, it } from 'vitest';
import { mapMovie } from './movieProvider.js';

describe('mapMovie', () => {
  it('normalizes incomplete provider data safely', () => {
    expect(mapMovie({ id: 1, title: 'Example', overview: '', poster_path: null, backdrop_path: null, vote_count: 0, genre_ids: [28] })).toMatchObject({ title: 'Example', overview: 'No description available.', posterUrl: null, genres: ['Action'] });
  });
});
