import type { Movie } from '../types.js';

const poster = '/posters/demo-poster.svg';
const make = (id: number, title: string, overview: string, year: string, rating: number, genres: string[], runtimeMinutes: number): Movie => ({ id, title, overview, posterUrl: poster, backdropUrl: poster, releaseDate: `${year}-06-15`, rating, voteCount: 100 + id, genres, runtimeMinutes });

export const demoMovies: Movie[] = [
  make(101, 'The Last Lighthouse', 'A quiet keeper discovers a signal that should not exist.', '2025', 8.1, ['Mystery', 'Drama'], 118),
  make(102, 'Orbiters', 'A stranded research crew must choose between returning home and solving an impossible anomaly.', '2024', 7.8, ['Science Fiction', 'Adventure'], 132),
  make(103, 'Midnight Kitchen', 'Two rival chefs find a second chance in a restaurant that opens after dark.', '2023', 7.4, ['Comedy', 'Romance'], 104),
  make(104, 'Paper Planets', 'A young cartographer maps an imaginary world to understand the real one.', '2022', 8.4, ['Animation', 'Family'], 96),
  make(105, 'Northbound', 'A musician and a runaway dog cross a changing country together.', '2021', 7.1, ['Drama', 'Adventure'], 111),
  make(106, 'Signal Lost', 'A radio host receives tomorrow’s emergency broadcast one night early.', '2020', 7.7, ['Thriller', 'Mystery'], 109),
  make(107, 'The Glass Garden', 'A botanist rebuilds a forgotten greenhouse while uncovering a family secret.', '2019', 7.6, ['Drama', 'Romance'], 115),
  make(108, 'After the Rain', 'Three strangers share one night in a city waiting for the storm to pass.', '2018', 7.2, ['Drama'], 101),
  make(109, 'Neon Run', 'A courier races across a sleepless city with a package everyone wants.', '2024', 8.0, ['Action', 'Thriller'], 122),
  make(110, 'Small Giants', 'A youth basketball team finds confidence in an unexpected coach.', '2023', 7.9, ['Family', 'Comedy'], 108),
  make(111, 'The Quiet Archive', 'An archivist discovers a missing chapter in the history of her own town.', '2022', 8.2, ['Mystery', 'Drama'], 127),
  make(112, 'Solaris Station', 'The final crew on an orbital station receives a message from Earth decades ahead.', '2025', 8.3, ['Science Fiction', 'Thriller'], 139),
];
