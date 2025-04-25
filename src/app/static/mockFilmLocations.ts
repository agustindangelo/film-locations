import { Film } from '../models/Film';

const mockFilmLocations: Film[] = [
  {
    id: '1',
    title: 'Inception',
    releaseYear: 2010,
    locations: 'Los Angeles',
    funFacts: 'Famous rotating hallway scene',
    productionCompany: 'Legendary Pictures',
    distributor: 'Warner Bros.',
    director: 'Christopher Nolan',
    writer: 'Christopher Nolan',
    actor1: 'Leonardo DiCaprio',
    actor2: 'Joseph Gordon-Levitt',
    actor3: undefined,
    longitude: -118.2437,
    latitude: 34.0522,
    position: { lat: 34.0522, lng: -118.2437 },
    dataLoadedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'The Dark Knight',
    releaseYear: 2008,
    locations: 'Chicago',
    funFacts: 'Many car chase scenes filmed downtown',
    productionCompany: 'Syncopy',
    distributor: 'Warner Bros.',
    director: 'Christopher Nolan',
    writer: 'Jonathan Nolan, Christopher Nolan',
    actor1: 'Christian Bale',
    actor2: 'Heath Ledger',
    actor3: 'Aaron Eckhart',
    longitude: -87.6298,
    latitude: 41.8781,
    position: { lat: 41.8781, lng: -87.6298 },
    dataLoadedAt: new Date().toISOString()
  }
];

export default mockFilmLocations;
