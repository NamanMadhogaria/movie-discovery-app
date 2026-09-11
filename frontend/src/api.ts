import type { Movie, PageResult } from './types';
const base = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
const deviceKey = 'movie-discovery-device-id';
const deviceId = localStorage.getItem(deviceKey) ?? crypto.randomUUID();
localStorage.setItem(deviceKey, deviceId);
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
      ...options?.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message ?? 'Request failed');
  }
  return response.json() as Promise<T>;
}
export const api = {
  discover: (page = 1, genre = '', sortBy = 'popularity.desc') =>
    request<PageResult>(
      `/movies/discover?page=${page}&genre=${encodeURIComponent(genre)}&sortBy=${encodeURIComponent(sortBy)}`,
    ),
  trending: () => request<PageResult>('/movies/trending'),
  search: (query: string, page = 1) =>
    request<PageResult>(`/movies/search?q=${encodeURIComponent(query)}&page=${page}`),
  details: (id: number) => request<Movie>(`/movies/${id}`),
  wishlist: () => request<{ data: Movie[] }>('/wishlist'),
  addWishlist: (movie: Movie) =>
    request<{ data: Movie[] }>('/wishlist', {
      method: 'POST',
      body: JSON.stringify(movie),
    }),
  removeWishlist: (id: number) =>
    request<{ data: Movie[] }>(`/wishlist/${id}`, { method: 'DELETE' }),
};
