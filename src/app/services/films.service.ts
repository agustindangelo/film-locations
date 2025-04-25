import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Film } from '../models/Film';

@Injectable({
  providedIn: 'root'
})
export class FilmsService {
  private apiBaseUrl = environment.apiBaseUrl;
  private filmsUrl = `${this.apiBaseUrl}/films`;
  private searchUrl = `${this.filmsUrl}/search`;
  private http = inject(HttpClient);

  constructor() {}

  fetchTopFilms(): Observable<Film[]> {
    return this.http.get<Film[]>(this.filmsUrl, { params: { pageSize: 100 } });
  }

  search(title: string): Observable<Film[]> {
    if (!title) return new Observable((observer) => observer.next([]));
    return this.http.get<any>(this.searchUrl, { params: { title: title.trim() } });
  }

  fetchLocationDetails(id: string): Observable<Film> {
    return this.http.get<any>(`${this.filmsUrl}/${id}`);
  }
}
