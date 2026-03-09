import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Servizio per interagire con le API relative alle serie TV.
 */
@Injectable({
  providedIn: 'root'
})
export class SeriesService {
  private apiUrl = '/api/v1'; // URL base per le API delle serie (il proxy reindirizzerà)

  constructor(private http: HttpClient) { }

  /**
   * Recupera una lista di serie TV dal backend.
   * @param limit - Numero massimo di serie da recuperare
   */
  getSeries(limit?: number): Observable<any> {
    const url = limit ? `${this.apiUrl}/series?limit=${limit}` : `${this.apiUrl}/series`;
    return this.http.get(url);
  }

  /**
   * Recupera i dettagli di una singola serie TV dal backend.
   * @param id - ID della serie.
   */
  getSeriesById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/series/${id}`);
  }
}