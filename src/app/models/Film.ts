type Position = {
  lat: number;
  lng: number;
};

export interface Film {
  id: string;
  title: string;
  releaseYear?: number;
  locations?: string;
  funFacts?: string;
  productionCompany: string;
  distributor: string;
  director: string;
  writer: string;
  actor1: string;
  actor2?: string;
  actor3?: string;
  longitude?: number;
  latitude?: number;
  position: Position;
  dataLoadedAt: string;
}
