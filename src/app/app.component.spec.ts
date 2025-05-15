import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { FilmsService } from './services/films.service';
import { of, throwError, firstValueFrom } from 'rxjs';
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

  describe('search locations functionality', () => {
    it('should call search and emit film locations on valid input', fakeAsync(async () => {
      filmsServiceSpy.search.and.returnValue(of(mockFilmLocations));

      component.searchControl.setValue('Inception');
      tick(500);

      const result = await firstValueFrom(component.filmLocations$);
      expect(filmsServiceSpy.search).toHaveBeenCalledWith('Inception');
      expect(result).toEqual(mockFilmLocations);
    }));

    it('should handle search errors gracefully', fakeAsync(async () => {
      filmsServiceSpy.search.and.returnValue(throwError(() => new Error('error')));

      component.searchControl.setValue('ErrorMovie');
      tick(500);

      const result = await firstValueFrom(component.filmLocations$);
      expect(filmsServiceSpy.search).toHaveBeenCalledWith('ErrorMovie');
      expect(result).toEqual([]);
    }));

    it('should not call search if input is empty or whitespace', fakeAsync(() => {
      component.searchControl.setValue('');
      tick(500);

      component.searchControl.setValue('   ');
      tick(500);

      expect(filmsServiceSpy.search).not.toHaveBeenCalled();
    }));
  });

  describe('filtering out of duplicates', () => {
    it('should filter out duplicate film titles', () => {
      const results: Film[] = [
        mockFilmLocations[0],
        mockFilmLocations[0],
        mockFilmLocations[0],
        mockFilmLocations[1]
      ];
      const unique = component.filterOutDuplicates(results);
      expect(unique.length).toBe(2);
      expect(unique.map((f) => f.title)).toEqual(['Inception', 'The Dark Knight']);
    });
  });

  describe('option selection functionality', () => {
    it('should update selectedTitle$ and not emit a new search', fakeAsync(async () => {
      filmsServiceSpy.search.and.returnValue(of(mockFilmLocations));
      component.searchControl.setValue('Inception');
      tick(500);

      const event = { option: { value: 'Inception' } } as any;
      spyOn(component['selectedTitle$'], 'next');
      component.onOptionSelected(event);

      expect(component['selectedTitle$'].next).toHaveBeenCalledWith('Inception');
      expect(filmsServiceSpy.search).toHaveBeenCalledTimes(1);
    }));

    it('should filter filmLocations based on selected title', fakeAsync(async () => {
      filmsServiceSpy.search.and.returnValue(of(mockFilmLocations));
      component.searchControl.setValue('Inception');
      tick(500);

      const event = { option: { value: 'Inception' } } as any;
      component.onOptionSelected(event);

      const filtered = await firstValueFrom(component.filteredFilmLocations$);
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('Inception');
    }));
  });
});
