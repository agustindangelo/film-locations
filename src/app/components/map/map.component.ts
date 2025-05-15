import { Component, inject, Input } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { Film } from '../../models/Film';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { FilmsService } from '../../services/films.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DetailsModalComponent } from '../details-modal/details-modal.component';
import { Marker } from '../../models/Marker';
import { GoogleMapsLoaderService } from '../../services/google-maps-loader.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-map',
  imports: [GoogleMapsModule, CommonModule, MatCardModule, MatDialogModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  readonly SF_CENTER_LAT = 37.784279;
  readonly SF_CENTER_LNG = -122.407234;
  mapOptions: google.maps.MapOptions = {
    streetViewControl: false,
    mapTypeControl: false,
    styles: [
      {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };
  center = { lat: this.SF_CENTER_LAT, lng: this.SF_CENTER_LNG };
  zoom = 13;
  selectedLocation: Film | null = null;
  apiLoaded = false;
  private filmsService = inject(FilmsService);
  @Input() filmLocations$!: Observable<Film[]>;

  markers$!: Observable<Marker[]>;

  private mapsLoader = inject(GoogleMapsLoaderService);

  constructor(public dialog: MatDialog) {}

  async ngOnInit() {
    await this.mapsLoader.load();
    this.apiLoaded = true;

    this.markers$ = this.filmLocations$.pipe(
      map((films) =>
        films.map(
          (film) =>
            ({
              position: { lat: +film.latitude!, lng: +film.longitude! },
              film: film
            } as Marker)
        )
      )
    );

    this.filmLocations$.subscribe((films) => {
      if (films.length > 0) {
        this.center = {
          lat: films.reduce((sum, film) => sum + film.latitude!, 0) / films.length,
          lng: films.reduce((sum, film) => sum + film.longitude!, 0) / films.length
        };
      }
    });
  }

  get actorList(): (string | undefined)[] {
    return [
      this.selectedLocation!.actor1,
      this.selectedLocation!.actor2,
      this.selectedLocation!.actor3
    ].filter((actor) => !!actor);
  }

  onMarkerClick(marker: Marker) {
    this.selectedLocation = marker.film;
    this.filmsService.fetchLocationDetails(marker.film.id).subscribe((data) => {
      this.selectedLocation = data;
      this.openDetailsModal();
    });
  }

  openDetailsModal(): void {
    this.dialog.open(DetailsModalComponent, {
      width: '600px',
      data: { filmLocation: this.selectedLocation }
    });
  }
}
