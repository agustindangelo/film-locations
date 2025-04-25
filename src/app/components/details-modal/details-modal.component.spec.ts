import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsModalComponent } from './details-modal.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import mockFilmLocations from '../../static/mockFilmLocations';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

describe('DetailsModalComponent', () => {
  let component: DetailsModalComponent;
  let fixture: ComponentFixture<DetailsModalComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, DetailsModalComponent, MatButtonModule],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: { filmLocation: mockFilmLocations[0] } }]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize filmLocation from MAT_DIALOG_DATA', () => {
    expect(component.filmLocation).toEqual(mockFilmLocations[0]);
  });

  describe('actorList getter', () => {
    it('should return list of defined actors', () => {
      const actors = component.actorList;
      expect(actors.length).toBe(2);
      expect(actors).toContain('Leonardo DiCaprio');
      expect(actors).toContain('Joseph Gordon-Levitt');
    });
  });
});
