# ReelScout Movie Discovery App

ReelScout is a responsive movie discovery application built for the full-stack intern assignment. It lets users browse, search, filter, sort, inspect, and save movies to a persistent device wishlist.

## Stack

- React, TypeScript, Vite, React Router
- Node.js, Express, TypeScript
- TMDB-compatible provider abstraction
- File-backed JSON persistence for the anonymous device wishlist
- Vitest tests for provider mapping and wishlist behavior

## Run locally

Requirements: Node.js 20 or newer.

```bash
cd E:\movie-discovery-app
npm run install:all
copy backend\.env.example backend\.env
npm run dev
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:4000`.

Add a TMDB API key to `backend/.env` to use live movie data:

```env
TMDB_API_KEY=your_key_here
```

Without a key, the backend uses a small demo catalog so the application can still be evaluated locally.

## Architecture

The browser talks only to the Node.js API. The API validates requests, applies rate limiting and caching, calls the movie provider, normalizes provider responses into the application’s movie model, and returns stable response shapes to React.

The wishlist uses a browser-generated device ID stored in `localStorage`. That ID is sent as `X-Device-Id`, and the backend stores the saved movie snapshot in `backend/data/wishlist.json`. This provides persistence across browser restarts without adding authentication to the assignment scope. A production version would replace this with authenticated users and PostgreSQL.

## API endpoints

```text
GET    /api/health
GET    /api/movies/discover?page=1&genre=&sortBy=popularity.desc
GET    /api/movies/trending
GET    /api/movies/search?q=batman&page=1
GET    /api/movies/:id
GET    /api/wishlist
POST   /api/wishlist
DELETE /api/wishlist/:movieId
```

## Important decisions

- The frontend never receives the provider API key.
- Movie responses are normalized at the backend boundary so UI code is not coupled to TMDB field names.
- Search and discovery results are cached in memory for a short period to avoid unnecessary provider calls.
- Provider requests have a timeout and return a safe 503 response when the provider is unavailable.
- Missing posters, ratings, descriptions, and dates have visual fallbacks.
- The app uses server-side pagination and lazy-loaded poster images.
- The demo provider fallback makes the project runnable without credentials while preserving the live-provider integration path.

## Tests and builds

```bash
npm test
npm run build
```

## AI transparency

AI assistance was used to help structure the initial project, reason about API boundaries, generate boilerplate, and review edge cases. The final architecture, persistence approach, UX behavior, and implementation were reviewed and integrated as part of this project.

## Known limitations and future improvements

- Wishlist identity is device-based rather than account-based.
- The local JSON store is suitable for an assignment/demo, not concurrent production traffic.
- A production release would use PostgreSQL, Redis, structured logging, user authentication, image CDN optimization, and end-to-end browser tests.
- More filter categories and richer movie metadata could be added with additional provider endpoints.
