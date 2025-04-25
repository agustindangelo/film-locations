import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MapComponent } from './map.component';
import { FilmsService } from '../../services/films.service';
import { GoogleMapsLoaderService } from '../../services/google-maps-loader.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import mockFilmLocations from '../../static/mockFilmLocations';
import { CommonModule } from '@angular/common';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let filmsServiceSpy: jasmine.SpyObj<FilmsService>;
  let mapsLoaderSpy: jasmine.SpyObj<GoogleMapsLoaderService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    const filmSpy = jasmine.createSpyObj('FilmsService', ['fetchLocationDetails']);
    const loaderSpy = jasmine.createSpyObj('GoogleMapsLoaderService', ['load']);
    const dialogRefSpyObj = jasmine.createSpyObj({ close: null });
    const dialogOpenSpy = jasmine.createSpyObj('MatDialog', { open: dialogRefSpyObj });

    await TestBed.configureTestingModule({
      imports: [MapComponent, CommonModule, MatDialogModule],
      providers: [
        { provide: FilmsService, useValue: filmSpy },
        { provide: GoogleMapsLoaderService, useValue: loaderSpy },
        { provide: MatDialog, useValue: dialogOpenSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    filmsServiceSpy = TestBed.inject(FilmsService) as jasmine.SpyObj<FilmsService>;
    mapsLoaderSpy = TestBed.inject(
      GoogleMapsLoaderService
    ) as jasmine.SpyObj<GoogleMapsLoaderService>;
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should update markers and center when filmLocations change', () => {
      component.filmLocations = mockFilmLocations;
      const changes = {
        filmLocations: { currentValue: component.filmLocations, firstChange: false }
      } as any;

      component.ngOnChanges(changes);

      const latAvg =
        mockFilmLocations.reduce((sum, location) => sum + location.latitude!, 0) /
        mockFilmLocations.length;
      const lngAvg =
        mockFilmLocations.reduce((sum, location) => sum + location.longitude!, 0) /
        mockFilmLocations.length;

      expect(component.markers.length).toBe(2);
      expect(component.center.lat).toBeCloseTo(latAvg);
      expect(component.center.lng).toBeCloseTo(lngAvg);
    });
  });

  describe('updateMarkers', () => {
    it('should create markers based on filmLocations', () => {
      component.filmLocations = mockFilmLocations;

      component.updateMarkers();

      expect(component.markers.length).toBe(mockFilmLocations.length);

      mockFilmLocations.forEach((filmLocation, idx) => {
        expect(component.markers[idx].position.lat).toBe(filmLocation.latitude!);
        expect(component.markers[idx].position.lng).toBe(filmLocation.longitude!);
      });
    });
  });

  describe('actorList getter', () => {
    it('should return list of available actors', () => {
      component.selectedLocation = mockFilmLocations[0];

      const actors = component.actorList;

      expect(actors.length).toBe(2);
      expect(actors).toContain('Leonardo DiCaprio');
      expect(actors).toContain('Joseph Gordon-Levitt');
    });
  });
});
