/**
 * Modello per gli elementi della watchlist
 */
export interface WatchlistItem {
  id: number;               // ID della relazione watchlist
  user_id: number;          // ID dell'utente
  content_id: number;       // ID del film o serie (convertito in numero)
  content_type: 'movie' | 'series';  // Tipo di contenuto
  created_at?: string;      // Data di aggiunta
  updated_at?: string;      // Data di modifica
  
  // Dati del contenuto (popolati dal backend)
  title?: string;           // Titolo del film/serie
  poster?: string;          // URL del poster
  release_year?: number;    // Anno di uscita (per film)
  seasons?: number;         // Numero stagioni (per serie)
  movie_genre?: string;     // Genere (per film)
  series_genre?: string;    // Genere (per serie)
  director?: string;        // Regista
  duration?: number;        // Durata
}

/**
 * Risposta API per watchlist
 */
export interface WatchlistResponse {
  success: boolean;
  data: WatchlistItem[];
  message?: string;
  error?: string;
}