import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { WatchlistItem, WatchlistResponse } from '../models/watchlist';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private apiUrl = '/api/v1';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Ottiene tutti gli elementi nella watchlist dell'utente
   * @param userId - ID dell'utente
   * @returns Observable con la lista dei contenuti
   */
  getWatchlist(userId: number): Observable<WatchlistResponse> {
    console.log(`Richiesta watchlist per user ${userId}`);
    
    // Tipizziamo la risposta come any[] perché il backend restituisce un array
    return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/watchlist`).pipe(
      tap(response => console.log('Risposta grezza dal backend:', response)),
      
      // Trasforma l'array nel formato WatchlistResponse
      map(response => {
        // Se la risposta è un array, la trasforma
        if (Array.isArray(response)) {
          console.log('Formato array diretto:', response.length, 'elementi');
          
          // Mappa ogni elemento convertendo content_id in numero
          const enrichedData = response.map(item => ({
            id: item.id,
            user_id: item.user_id,
            content_id: parseInt(item.content_id), // Converti in numero
            content_type: item.content_type,
            created_at: item.created_at,
            updated_at: item.updated_at,
            // Campi arricchiti dal backend
            title: item.title,
            poster: item.poster,
            release_year: item.release_year,
            seasons: item.seasons,
            movie_genre: item.movie_genre,
            series_genre: item.series_genre,
            director: item.director,
            duration: item.duration
          }));
          
          return {
            success: true,
            data: enrichedData
          };
        }
        
        // Se la risposta è già nel formato { data: [...] }
        if (response && (response as any).data && Array.isArray((response as any).data)) {
          console.log('Formato con data:', (response as any).data.length, 'elementi');
          return response as WatchlistResponse;
        }
        
        // Altrimenti restituisce array vuoto
        console.warn('Formato risposta non riconosciuto:', response);
        return {
          success: true,
          data: []
        };
      }),
      
      tap(result => console.log('Watchlist trasformata:', result.data?.length, 'elementi')),
      catchError(this.handleError)
    );
  }

  /**
   * Aggiunge un contenuto alla watchlist
   * @param userId - ID dell'utente
   * @param contentId - ID del contenuto (film o serie)
   * @param contentType - Tipo di contenuto ('movie' o 'series')
   * @returns Observable con la risposta
   */
  addToWatchlist(userId: number, contentId: number, contentType: 'movie' | 'series'): Observable<any> {
    console.log(`Tentativo aggiunta: user ${userId}, content ${contentId}, type ${contentType}`);
    
    return this.http.post(`${this.apiUrl}/users/${userId}/watchlist`, {
      content_id: contentId,
      content_type: contentType
    }).pipe(
      tap(response => console.log('Aggiunto alla watchlist:', response)),
      catchError(this.handleError)
    );
  }

  /**
   * Rimuove un contenuto dalla watchlist
   * @param userId - ID dell'utente
   * @param watchlistId - ID della relazione watchlist
   * @returns Observable con la risposta
   */
  removeFromWatchlist(userId: number, watchlistId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}/watchlist/${watchlistId}`).pipe(
      tap(response => console.log('Rimosso dalla watchlist:', response)),
      catchError(this.handleError)
    );
  }

  /**
   * Verifica se un contenuto è già nella watchlist
   * @param watchlist - Lista completa della watchlist
   * @param contentId - ID del contenuto da cercare
   * @param contentType - Tipo di contenuto
   * @returns true se presente, false altrimenti
   */
  isInWatchlist(watchlist: WatchlistItem[], contentId: number, contentType: 'movie' | 'series'): boolean {
    return watchlist.some(item => 
      item.content_id === contentId && 
      item.content_type === contentType
    );
  }

  /**
   * Ottiene l'ID della relazione watchlist per un contenuto
   * @param watchlist - Lista completa della watchlist
   * @param contentId - ID del contenuto
   * @param contentType - Tipo di contenuto
   * @returns ID della relazione o null se non trovato
   */
  getWatchlistItemId(watchlist: WatchlistItem[], contentId: number, contentType: 'movie' | 'series'): number | null {
    const item = watchlist.find(item => 
      item.content_id === contentId && 
      item.content_type === contentType
    );
    return item ? item.id : null;
  }

  /**
   * Gestione centralizzata degli errori
   */
  private handleError(error: any): Observable<never> {
    console.error('WatchlistService error:', error);
    
    let errorMessage = 'Errore sconosciuto';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Errore: ${error.error.message}`;
    } else if (error.error && error.error.error) {
      errorMessage = error.error.error;
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Devi effettuare il login per gestire la watchlist';
    } else if (error.status === 403) {
      errorMessage = 'Non hai i permessi per questa operazione';
    } else if (error.status === 404) {
      errorMessage = 'Contenuto non trovato';
    } else if (error.status === 409) {
      errorMessage = 'Contenuto già presente nella watchlist';
    }
    
    return throwError(() => ({
      success: false,
      error: errorMessage,
      status: error.status
    }));
  }
}