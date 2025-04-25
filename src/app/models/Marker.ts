import { Film } from './Film';

export type Marker = {
  position: google.maps.LatLngLiteral;
  film: Film;
};
