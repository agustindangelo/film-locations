import { Component, Inject, Input } from '@angular/core';
import { Film } from '../../models/Film';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-details-modal',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './details-modal.component.html',
  styleUrl: './details-modal.component.scss'
})
export class DetailsModalComponent {
  filmLocation: Film;

  get actorList(): (string | undefined)[] {
    return [this.filmLocation!.actor1, this.filmLocation!.actor2, this.filmLocation!.actor3].filter(
      (actor) => !!actor
    );
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: { filmLocation: Film }) {
    this.filmLocation = data.filmLocation;
  }
}
