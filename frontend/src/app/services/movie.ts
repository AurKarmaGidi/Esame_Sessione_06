import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Servizio per interagire con le API relative ai film.
 */
@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = '/api/v1'; // URL base per le API dei film (il proxy reindirizzerà)

  constructor(private http: HttpClient) { }

  /**
   * Recupera una lista di film dal backend.
   * @param limit - Numero massimo di film da recuperare (default 100).
   */
  getMovies(limit: number = 100): Observable<any> {
    return this.http.get(`${this.apiUrl}/movies?limit=${limit}`);
  }

  /**
   * Recupera i dettagli di un singolo film dal backend.
   * @param id - ID del film.
   */
  getMovie(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/movies/${id}`);
  }
}