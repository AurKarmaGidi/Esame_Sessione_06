import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { 
  AdminStats, 
  AdminUser, 
  AdminMovie, 
  AdminSeries, 
  ApiResponse 
} from '../models/admin';

/**
 * Servizio per le funzionalità di amministrazione.
 * Gestisce chiamate API per utenti, film, serie, episodi e statistiche.
 * Tutte le rotte sono protette dal middleware 'admin' nel backend.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = '/api/v1/admin';

  constructor(private http: HttpClient) { }

  // ==================== STATISTICHE ====================
  
  /**
   * Ottiene le statistiche per la dashboard admin
   * @returns Observable con le statistiche
   */
  getStats(): Observable<ApiResponse<AdminStats>> {
    return this.http.get<ApiResponse<AdminStats>>(`${this.apiUrl}/stats`).pipe(
      tap(response => console.log('Stats loaded:', response)),
      catchError(this.handleError)
    );
  }

  // ==================== GESTIONE UTENTI ====================
  
  /**
   * Ottiene tutti gli utenti
   * @returns Observable con lista utenti
   */
  getAllUsers(): Observable<ApiResponse<AdminUser[]>> {
    return this.http.get<ApiResponse<AdminUser[]>>(`${this.apiUrl}/users`).pipe(
      tap(response => console.log('Users loaded:', response)),
      catchError(this.handleError)
    );
  }

  /**
   * Ottiene un utente specifico
   * @param id - ID dell'utente
   * @returns Observable con dati utente
   */
  getUser(id: number): Observable<ApiResponse<AdminUser>> {
    return this.http.get<ApiResponse<AdminUser>>(`${this.apiUrl}/users/${id}`).pipe(
      tap(response => console.log(`User ${id} loaded:`, response)),
      catchError(this.handleError)
    );
  }

  /**
   * Aggiunge un nuovo utente
   * @param userData - Dati dell'utente (inclusa password)
   * @returns Observable con risposta (include ID del nuovo utente)
   */
  addUser(userData: Omit<AdminUser, 'id'> & { password: string }): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(`${this.apiUrl}/users`, userData).pipe(
      tap(response => console.log('User added:', response)),
      catchError(this.handleError)
    );
  }

  /**
   * Aggiorna un utente esistente
   * @param id - ID dell'utente
   * @param userData - Dati da aggiornare (password opzionale)
   * @returns Observable con risposta
   */
  updateUser(id: number, userData: Partial<AdminUser>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/users/${id}`, userData).pipe(
      tap(response => console.log(`User ${id} updated:`, response)),
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un utente
   * @param id - ID dell'utente
   * @returns Observable con risposta
   */
  deleteUser(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/users/${id}`).pipe(
      tap(response => console.log(`User ${id} deleted:`, response)),
      catchError(this.handleError)
    );
  }

  // ==================== GESTIONE FILM ====================
  
  /**
   * Ottiene tutti i film
   * @returns Observable con lista film
   */
  getAllMovies(): Observable<ApiResponse<AdminMovie[]>> {
    return this.http.get<ApiResponse<AdminMovie[]>>(`${this.apiUrl}/movies`).pipe(
      tap(response => console.log('Movies loaded:', response)),
      catchError(this.handleError)
    );
  }

  /**
   * Aggiunge un nuovo film
   * @param movieData - Dati del film
   * @returns Observable con risposta (include ID del nuovo film)
   */
  addMovie(movieData: Omit<AdminMovie, 'id'>): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(`${this.apiUrl}/movies`, movieData).pipe(
      tap(response => console.log('Movie added:', response)),
      catchError(this.handleError)
    );
  }

  /**
   * Aggiorna un film esistente
   * @param id - ID del film
   * @param movieData - Dati da aggiornare
   * @returns Observable con risposta
   */
  updateMovie(id: number, movieData: Partial<AdminMovie>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/movies/${id}`, movieData).pipe(
      tap(response => console.log(`Movie ${id} updated:`, response)),
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un film
   * @param id - ID del film
   * @returns Observable con risposta
   */
  deleteMovie(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/movies/${id}`).pipe(
      tap(response => console.log(`Movie ${id} deleted:`, response)),
      catchError(this.handleError)
    );
  }

  // ==================== GESTIONE SERIE ====================
  
  /**
   * Ottiene tutte le serie
   * @returns Observable con lista serie
   */
  getAllSeries(): Observable<ApiResponse<AdminSeries[]>> {
    return this.http.get<ApiResponse<AdminSeries[]>>(`${this.apiUrl}/series`).pipe(
      tap(response => console.log('Series loaded:', response)),
      catchError(this.handleError)
    );
  }

  /**
   * Aggiunge una nuova serie
   * @param seriesData - Dati della serie
   * @returns Observable con risposta (include ID della nuova serie)
   */
  addSeries(seriesData: Omit<AdminSeries, 'id'>): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(`${this.apiUrl}/series`, seriesData).pipe(
      tap(response => console.log('Series added:', response)),
      catchError(this.handleError)
    );
  }

  /**
   * Aggiorna una serie esistente
   * @param id - ID della serie
   * @param seriesData - Dati da aggiornare
   * @returns Observable con risposta
   */
  updateSeries(id: number, seriesData: Partial<AdminSeries>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/series/${id}`, seriesData).pipe(
      tap(response => console.log(`Series ${id} updated:`, response)),
      catchError(this.handleError)
    );
  }

  /**
   * Elimina una serie
   * @param id - ID della serie
   * @returns Observable con risposta
   */
  deleteSeries(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/series/${id}`).pipe(
      tap(response => console.log(`Series ${id} deleted:`, response)),
      catchError(this.handleError)
    );
  }

  // ==================== GESTIONE ERRORI ====================
  
  /**
   * Gestione centralizzata degli errori
   * @param error - Errore ricevuto
   * @returns Observable con errore formattato
   */
  private handleError(error: any): Observable<never> {
    console.error('AdminService error:', error);
    
    let errorMessage = 'Errore sconosciuto';
    
    if (error.error instanceof ErrorEvent) {
      // Errore lato client
      errorMessage = `Errore: ${error.error.message}`;
    } else if (error.error && error.error.error) {
      // Errore dal backend con campo 'error'
      errorMessage = error.error.error;
    } else if (error.error && error.error.message) {
      // Errore dal backend con campo 'message'
      errorMessage = error.error.message;
    } else if (error.status) {
      errorMessage = `Errore ${error.status}: ${error.statusText}`;
      
      if (error.status === 403) {
        errorMessage = 'Accesso negato: non hai i permessi di amministratore';
      } else if (error.status === 401) {
        errorMessage = 'Sessione scaduta: effettua nuovamente il login';
      } else if (error.status === 404) {
        errorMessage = 'Risorsa non trovata';
      } else if (error.status === 422) {
        errorMessage = 'Dati non validi';
      } else if (error.status >= 500) {
        errorMessage = 'Errore del server. Riprova più tardi.';
      }
    }
    
    return throwError(() => ({
      success: false,
      error: errorMessage,
      status: error.status,
      originalError: error
    }));
  }
}