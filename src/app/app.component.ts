import { Component } from '@angular/core';
import { MapComponent } from './components/map/map.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil
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

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    MapComponent,
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
  searchControl = new FormControl('', [Validators.maxLength(25)]);
  options$: Observable<Film[]> | undefined;
  subscriptions: Subscription[] = [];
  searchResults: Film[] = [];
  filmLocations: Film[] = [];
  initialOptions: Film[] = [];
  filteredFilmLocations: Film[] = [];
  options: Film[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(private filmsService: FilmsService) {}

  ngOnInit() {
    this.fetchTopFilms();
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchTopFilms(): void {
    this.loading = true;
    this.filmsService
      .fetchTopFilms()
      .pipe(
        catchError((error) => {
          console.error('Error fetching films', error);
          return of([]);
        }),
        finalize(() => (this.loading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        this.filmLocations = data;
        this.options = this.getUniqueResults(data);
        this.initialOptions = this.options;
      });
  }

  setupSearchSubscription() {
    this.subscriptions.push(
      this.searchControl.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          takeUntil(this.destroy$),
          filter((query) => !!query)
        )
        .subscribe((query) => {
          this.loading = true;
          this.filmsService
            .search(query!)
            .pipe(
              catchError((error) => {
                console.error('Error searching films', error);
                return of([]);
              }),
              finalize(() => (this.loading = false))
            )
            .subscribe((data) => {
              this.filmLocations = data;
              this.options = this.getUniqueResults(data);
            });
        })
    );

    this.subscriptions.push(
      this.searchControl.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          takeUntil(this.destroy$),
          filter((query) => !query)
        )
        .subscribe(() => {
          this.options = this.initialOptions;
        })
    );
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

  onOptionSelected(event: any): void {
    const selectedFilm = event.option.value;
    this.filteredFilmLocations = this.filmLocations.filter(
      (location) => location.title === selectedFilm
    );
  }
}
