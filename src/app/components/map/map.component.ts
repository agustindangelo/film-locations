import { Component, inject, Input, SimpleChanges, ViewChild } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { Film } from '../../models/Film';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { FilmsService } from '../../services/films.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DetailsModalComponent } from '../details-modal/details-modal.component';
import { Marker } from '../../models/Marker';

@Component({
  selector: 'app-map',
  imports: [GoogleMapsModule, CommonModule, MatCardModule, MatDialogModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  private filmsService = inject(FilmsService);

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

  @Input() filmLocations: Film[] = [];

  markers: Marker[] = [];
  center = { lat: this.SF_CENTER_LAT, lng: this.SF_CENTER_LNG };
  zoom = 12;
  selectedLocation: Film | null = null;

  get actorList(): (string | undefined)[] {
    return [
      this.selectedLocation!.actor1,
      this.selectedLocation!.actor2,
      this.selectedLocation!.actor3
    ].filter((actor) => !!actor);
  }

  constructor(public dialog: MatDialog) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filmLocations'] && !changes['filmLocations'].firstChange) {
      this.updateMarkers();
      this.adjustMapCenter();
    }
  }

  updateMarkers() {
    this.markers = [];
    for (const film of this.filmLocations) {
      this.markers.push({
        position: { lat: +film.latitude!, lng: +film.longitude! },
        film: film
      } as Marker);
    }
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

  adjustMapCenter(): void {
    this.center = {
      lat:
        this.filmLocations.reduce((sum, film) => sum + film.latitude!, 0) /
        this.filmLocations.length,
      lng:
        this.filmLocations.reduce((sum, film) => sum + film.longitude!, 0) /
        this.filmLocations.length
    };
  }
}
