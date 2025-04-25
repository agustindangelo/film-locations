import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { FilmsService } from './services/films.service';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Film } from './models/Film';
import mockFilmLocations from './static/mockFilmLocations';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let filmsServiceSpy: jasmine.SpyObj<FilmsService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('FilmsService', ['search']);

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule
      ],
      providers: [{ provide: FilmsService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    filmsServiceSpy = TestBed.inject(FilmsService) as jasmine.SpyObj<FilmsService>;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('setupSearchSubscription', () => {
    it('should call search and set filmLocations and options on valid input', fakeAsync(() => {
      filmsServiceSpy.search.and.returnValue(of(mockFilmLocations));

      component.searchControl.setValue('Inception');
      tick(500);

      expect(filmsServiceSpy.search).toHaveBeenCalledWith('Inception');
      expect(component.filmLocations).toEqual(mockFilmLocations);
      expect(component.options.length).toBe(2);
      expect(component.loading).toBeFalse();
    }));

    it('should handle search errors gracefully', fakeAsync(() => {
      filmsServiceSpy.search.and.returnValue(throwError(() => new Error('error')));

      component.searchControl.setValue('ErrorMovie');
      tick(500);

      expect(filmsServiceSpy.search).toHaveBeenCalledWith('ErrorMovie');
      expect(component.filmLocations).toEqual([]);
      expect(component.options).toEqual([]);
      expect(component.loading).toBeFalse();
    }));

    it('should not call search if input is empty', fakeAsync(() => {
      component.searchControl.setValue('');
      tick(500);

      expect(filmsServiceSpy.search).not.toHaveBeenCalled();
    }));
  });

  describe('getUniqueResults', () => {
    it('should filter out duplicate film titles', () => {
      const results: Film[] = [
        mockFilmLocations[0],
        mockFilmLocations[0],
        mockFilmLocations[0],
        mockFilmLocations[1]
      ];
      const unique = component.getUniqueResults(results);
      expect(unique.length).toBe(2);
      expect(unique.map((f) => f.title)).toEqual(['Inception', 'The Dark Knight']);
    });
  });

  describe('onOptionSelected', () => {
    it('should filter filmLocations based on selected title', () => {
      component.filmLocations = mockFilmLocations;

      const event = { option: { value: 'Inception' } } as any;
      component.onOptionSelected(event);

      expect(component.filteredFilmLocations.length).toBe(1);
      expect(component.filteredFilmLocations[0].title).toBe('Inception');
    });
  });
});
