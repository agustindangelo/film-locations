import { Component, inject } from '@angular/core';
import { MapComponent } from './components/map/map.component';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  of,
  switchMap,
  BehaviorSubject,
  shareReplay
} from 'rxjs';
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
  private filmsService = inject(FilmsService);
  private selectedTitle$ = new BehaviorSubject<string | null>(null);
  searchControl = new FormControl('', [Validators.maxLength(45)]);
  loading$ = new BehaviorSubject<boolean>(false);

  filmLocations$ = this.searchControl.valueChanges.pipe(
    debounceTime(500),
    distinctUntilChanged(),
    filter((query) => !!query && query.trim().length > 0),
    switchMap((query) => {
      this.loading$.next(true);
      return this.filmsService.search(query!).pipe(
        catchError(() => {
          return of([]);
        }),
        finalize(() => this.loading$.next(false))
      );
    }),
    shareReplay(1)
  );

  options$ = this.filmLocations$.pipe(map(this.filterOutDuplicates));

  filteredFilmLocations$ = this.filmLocations$.pipe(
    switchMap((locations) =>
      this.selectedTitle$.pipe(
        map((title) => (title ? locations.filter((location) => location.title === title) : []))
      )
    )
  );

  filterOutDuplicates(array: Film[]) {
    const uniqueTitles = new Set();
    return array.filter((film) => {
      if (uniqueTitles.has(film.title)) {
        return false;
      }
      uniqueTitles.add(film.title);
      return true;
    });
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedTitle = event.option.value;
    this.searchControl.setValue(selectedTitle, { emitEvent: false });
    this.selectedTitle$.next(selectedTitle);
  }
}
