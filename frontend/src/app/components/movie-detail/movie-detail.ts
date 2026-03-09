import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../services/movie';
import { AuthService } from '../../services/auth';
import { WatchlistService } from '../../services/watchlist.service';
import { WatchlistItem } from '../../models/watchlist';
import { Subscription } from 'rxjs';

/**
 * Componente per visualizzare i dettagli di un film specifico.
 * Mostra le informazioni del film e una lista di film correlati (stesso genere).
 * Il bottone "Riproduci" è disabilitato se l'utente non è autenticato.
 * Aggiunge la funzionalità watchlist.
 */
@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-detail.html',
  styleUrls: ['./movie-detail.scss']
})
export class MovieDetail implements OnInit, OnDestroy {
  movie: any = null; // Dati del film corrente
  relatedMovies: any[] = []; // Array per i film correlati
  loading = true; // Stato di caricamento
  isAuthenticated = false; // Flag per autenticazione
  currentUser: any = null; // Utente corrente
  
  // Watchlist
  watchlistItems: WatchlistItem[] = [];
  isInWatchlist = false;
  watchlistLoading = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private router: Router,
    public authService: AuthService,
    private watchlistService: WatchlistService
  ) {}

  ngOnInit() {
    // Sottoscriviti allo stato di autenticazione
    const userSub = this.authService.user$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUser = user;
      
      if (this.isAuthenticated && this.movie) {
        this.loadWatchlistStatus();
      }
    });
    this.subscriptions.push(userSub);

    // Sottoscriviti ai parametri della rotta
    const routeSub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadMovie(parseInt(id));
      }
    });
    this.subscriptions.push(routeSub);
  }

  ngOnDestroy() {
    // Pulisci tutte le subscription
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Carica i dettagli del film usando il MovieService.
   * @param id - ID del film da caricare.
   */
  loadMovie(id: number) {
    this.loading = true;
    this.movieService.getMovie(id).subscribe({
      next: (data) => {
        this.movie = data;
        this.loadRelatedMovies(this.movie.movie_genre, id);
        this.loading = false;
        
        // Se l'utente è autenticato, carica lo stato watchlist
        if (this.isAuthenticated && this.currentUser) {
          this.loadWatchlistStatus();
        }
      },
      error: (err) => {
        console.error('Errore caricamento film:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Carica i film correlati in base al genere, escludendo il film corrente.
   * @param genre - Genere del film corrente.
   * @param currentId - ID del film corrente da escludere.
   */
  loadRelatedMovies(genre: string, currentId: number) {
    this.movieService.getMovies(100).subscribe({
      next: (response) => {
        this.relatedMovies = response.movies
          .filter((m: any) => m.movie_genre === genre && m.id !== currentId)
          .slice(0, 15);
        console.log(`Film dello stesso genere (${genre}):`, this.relatedMovies.length);
      },
      error: (err) => {
        console.error('Errore caricamento film correlati:', err);
      }
    });
  }

  /**
   * Naviga verso la pagina di dettaglio di un altro film.
   * @param id - ID del film di destinazione.
   * @param event - Evento del click per prevenire il comportamento predefinito del link.
   */
  goToMovie(id: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Navigazione verso film ID:', id);
    this.router.navigate(['/movie', id]).then(() => {
      console.log('Navigazione completata');
    });
  }

  /**
   * Carica lo stato della watchlist per questo film
   */
  loadWatchlistStatus(): void {
    if (!this.currentUser || !this.movie) return;
    
    this.watchlistService.getWatchlist(this.currentUser.id).subscribe({
      next: (response) => {
        this.watchlistItems = response.data || [];
        this.isInWatchlist = this.watchlistService.isInWatchlist(
          this.watchlistItems, 
          this.movie.id, 
          'movie'
        );
      },
      error: (err) => {
        console.error('Errore caricamento watchlist:', err);
      }
    });
  }

/**
 * Aggiunge o rimuove il film dalla watchlist
 */
toggleWatchlist(event: Event): void {
  event.preventDefault();
  event.stopPropagation();
  
  if (!this.currentUser || !this.movie) return;
  
  this.watchlistLoading = true;
  
  // CONTROLLO PRELIMINARE: se è già in watchlist, rimuovi
  if (this.isInWatchlist) {
    // Rimuovi dalla watchlist
    const itemId = this.watchlistService.getWatchlistItemId(
      this.watchlistItems, 
      this.movie.id, 
      'movie'
    );
    
    if (itemId) {
      console.log(`🎬 Tentativo rimozione film ID ${this.movie.id}, watchlist item ID ${itemId}`);
      
      this.watchlistService.removeFromWatchlist(this.currentUser.id, itemId).subscribe({
        next: (response) => {
          console.log('✅ Film rimosso dalla watchlist:', response);
          this.isInWatchlist = false;
          
          // Rimuovi dall'array locale
          this.watchlistItems = this.watchlistItems.filter(item => item.id !== itemId);
          
          // 🔄 AGGIORNA LA VISTA (opzionale - mostra messaggio)
          this.showTemporaryMessage('Rimosso dalla watchlist');
          
          this.watchlistLoading = false;
        },
        error: (err) => {
          console.error('❌ Errore rimozione:', err);
          
          // Se c'è errore, ricarica la watchlist per sincronizzare
          this.loadWatchlistStatus();
          
          this.watchlistLoading = false;
        }
      });
    } else {
      // Caso strano: dice di essere in watchlist ma non troviamo l'ID
      console.warn('⚠️ Film segnato come in watchlist ma ID relazione non trovato');
      this.isInWatchlist = false;
      this.watchlistLoading = false;
    }
  } else {
    // NON è in watchlist → Aggiungi
    console.log(`Tentativo aggiunta film ID ${this.movie.id}`);
    
    this.watchlistService.addToWatchlist(this.currentUser.id, this.movie.id, 'movie').subscribe({
      next: (response) => {
        console.log('Film aggiunto alla watchlist:', response);
        this.isInWatchlist = true;
        
        // 🔄 AGGIORNA LA VISTA - mostra messaggio
        this.showTemporaryMessage('Aggiunto alla watchlist');
        
        // Ricarica la watchlist per ottenere l'ID della relazione
        this.loadWatchlistStatus();
        this.watchlistLoading = false;
      },
      error: (err) => {
        console.error('Errore aggiunta:', err);
        
        // GESTIONE SPECIFICA PER ERRORI 409 (già presente)
        if (err.status === 409) {
          console.log('Film già in watchlist, aggiorno stato');
          this.isInWatchlist = true;
          this.loadWatchlistStatus(); // Ricarica per sincronizzare
        }
        
        this.watchlistLoading = false;
      }
    });
  }
}

/**
 * Mostra un messaggio temporaneo (opzionale)
 */
private showTemporaryMessage(message: string): void {
  console.log(`${message}`);
  
  // Opzione 1: Alert temporaneo
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
  alertDiv.style.zIndex = '9999';
  alertDiv.style.backgroundColor = '#ff0066';
  alertDiv.style.color = 'white';
  alertDiv.style.border = 'none';
  alertDiv.style.padding = '10px 20px';
  alertDiv.style.borderRadius = '4px';
  alertDiv.innerText = message;
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 2000);
}
  /**
   * Gestisce il click sul bottone "Riproduci"
   * Se l'utente non è autenticato, apre il modal di login
   */
  playContent() {
    if (!this.isAuthenticated) {
      // Apri il modal di login (presente nella navbar)
      const loginButton = document.querySelector('[data-bs-target="#loginModal"]') as HTMLElement;
      if (loginButton) {
        loginButton.click();
      }
      return;
    }
    
    // Se autenticato, procedi con la riproduzione
    console.log('🎬 Riproduzione film:', this.movie?.title);
    window.open(this.movie?.youtube_link, '_blank');
  }
}