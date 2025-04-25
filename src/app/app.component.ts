import { Component, inject } from '@angular/core';
import { MapComponent } from './components/map/map.component';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { catchError, debounceTime, distinctUntilChanged, filter, finalize, of } from 'rxjs';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FilmsService } from './services/films.service';
import { Film } from './models/Film';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    MapComponent,
    GoogleMapsModule,
    MatAutocompleteModule,
    LoadingSpinnerComponent,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TopBarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  searchControl = new FormControl('', [Validators.maxLength(45)]);
  searchResults: Film[] = [];
  filmLocations: Film[] = [];
  filteredFilmLocations: Film[] = [];
  options: Film[] = [];
  loading = false;

  private filmsService = inject(FilmsService);

  ngOnInit() {
    this.setupSearchSubscription();
  }

  setupSearchSubscription() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter((query) => !!query && query.trim().length > 0)
      )
      .subscribe((query) => {
        this.loading = true;
        this.filmsService
          .search(query!)
          .pipe(
            catchError((err) => {
              console.error('Search error', err);
              return of([]);
            }),
            finalize(() => (this.loading = false))
          )
          .subscribe((data) => {
            this.filmLocations = data as Film[];
            this.options = this.getUniqueResults(this.filmLocations);
          });
      });
  }

  getUniqueResults(results: Film[]): Film[] {
    const uniqueTitles = new Set();
    return results.filter((film) => {
      if (uniqueTitles.has(film.title)) {
        return false;
      }
      uniqueTitles.add(film.title);
      return true;
    });
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedTitle = event.option.value;
    this.searchControl.setValue(selectedTitle, { emitEvent: true });
    this.filteredFilmLocations = this.filmLocations.filter(
      (location) => location.title === selectedTitle
    );
    console.log('filtered', this.filteredFilmLocations);
  }
}
