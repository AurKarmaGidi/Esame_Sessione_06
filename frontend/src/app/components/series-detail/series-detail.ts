import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SeriesService } from '../../services/series';
import { AuthService } from '../../services/auth';
import { WatchlistService } from '../../services/watchlist.service';
import { WatchlistItem } from '../../models/watchlist';
import { Subscription } from 'rxjs';

/**
 * Componente per visualizzare i dettagli di una serie TV specifica.
 * Mostra le informazioni della serie e una lista di serie correlate (stesso genere).
 * Il bottone "Guarda trailer" è disabilitato se l'utente non è autenticato.
 * Aggiunge la funzionalità watchlist.
 */
@Component({
  selector: 'app-series-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './series-detail.html',
  styleUrls: ['./series-detail.scss']
})
export class SeriesDetail implements OnInit, OnDestroy {
  series: any = null; // Dati della serie corrente
  relatedSeries: any[] = []; // Array per le serie correlate
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
    private seriesService: SeriesService,
    private router: Router,
    public authService: AuthService,
    private watchlistService: WatchlistService
  ) {}

  ngOnInit() {
    // Sottoscrive allo stato di autenticazione
    const userSub = this.authService.user$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUser = user;
      
      if (this.isAuthenticated && this.series) {
        this.loadWatchlistStatus();
      }
    });
    this.subscriptions.push(userSub);

    // Sottoscrive ai parametri della rotta
    const routeSub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadSeries(parseInt(id));
      }
    });
    this.subscriptions.push(routeSub);
  }

  ngOnDestroy() {
    // Pulisce tutte le subscription
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Carica i dettagli della serie usando il SeriesService.
   * @param id - ID della serie da caricare.
   */
  loadSeries(id: number) {
    this.loading = true;
    this.seriesService.getSeriesById(id).subscribe({
      next: (data) => {
        this.series = data;
        this.loadRelatedSeries(this.series.series_genre, id);
        this.loading = false;
        
        // Se l'utente è autenticato, carica lo stato watchlist
        if (this.isAuthenticated && this.currentUser) {
          this.loadWatchlistStatus();
        }
      },
      error: (err) => {
        console.error('Errore caricamento serie:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Carica le serie correlate in base al genere, escludendo la serie corrente.
   * @param genre - Genere della serie corrente.
   * @param currentId - ID della serie corrente da escludere.
   */
  loadRelatedSeries(genre: string, currentId: number) {
    this.seriesService.getSeries(100).subscribe({
      next: (response) => {
        this.relatedSeries = response.series
          .filter((s: any) => s.series_genre === genre && s.id !== currentId)
          .slice(0, 15);
        console.log(`Serie dello stesso genere (${genre}):`, this.relatedSeries.length);
      },
      error: (err) => {
        console.error('Errore caricamento serie correlate:', err);
      }
    });
  }

  /**
   * Naviga verso la pagina di dettaglio di un'altra serie.
   * @param id - ID della serie di destinazione.
   * @param event - Evento del click per prevenire il comportamento predefinito del link.
   */
  goToSeries(id: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Navigazione verso serie ID:', id);
    this.router.navigate(['/serie', id]).then(() => {
      console.log('Navigazione completata');
    });
  }

  /**
   * Carica lo stato della watchlist per questa serie
   */
  loadWatchlistStatus(): void {
    if (!this.currentUser || !this.series) return;
    
    this.watchlistService.getWatchlist(this.currentUser.id).subscribe({
      next: (response) => {
        this.watchlistItems = response.data || [];
        this.isInWatchlist = this.watchlistService.isInWatchlist(
          this.watchlistItems, 
          this.series.id, 
          'series'
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
  
  if (!this.currentUser || !this.series) return;
  
  this.watchlistLoading = true;
  
  // CONTROLLO PRELIMINARE: se è già in watchlist, rimuovi
  if (this.isInWatchlist) {
    // Rimuovi dalla watchlist
    const itemId = this.watchlistService.getWatchlistItemId(
      this.watchlistItems, 
      this.series.id, 
      'series'
    );
    
    if (itemId) {
      console.log(`Tentativo rimozione film ID ${this.series.id}, watchlist item ID ${itemId}`);
      
      this.watchlistService.removeFromWatchlist(this.currentUser.id, itemId).subscribe({
        next: (response) => {
          console.log('Film rimosso dalla watchlist:', response);
          this.isInWatchlist = false;
          
          // Rimuovi dall'array locale
          this.watchlistItems = this.watchlistItems.filter(item => item.id !== itemId);
          
          // AGGIORNA LA VISTA - mostra messaggio
          this.showTemporaryMessage('Rimosso dalla watchlist');
          
          this.watchlistLoading = false;
        },
        error: (err) => {
          console.error('Errore rimozione:', err);
          
          // Se c'è errore, ricarica la watchlist per sincronizzare
          this.loadWatchlistStatus();
          
          this.watchlistLoading = false;
        }
      });
    } else {
      // Caso particolare: dice di essere in watchlist ma non troviamo l'ID
      console.warn('Film segnato come in watchlist ma ID relazione non trovato');
      this.isInWatchlist = false;
      this.watchlistLoading = false;
    }
  } else {
    // NON è in watchlist → Aggiungi
    console.log(`Tentativo aggiunta film ID ${this.series.id}`);
    
    this.watchlistService.addToWatchlist(this.currentUser.id, this.series.id, 'series').subscribe({
      next: (response) => {
        console.log('Film aggiunto alla watchlist:', response);
        this.isInWatchlist = true;
        
        // AGGIORNA LA VISTA - mostra messaggio
        this.showTemporaryMessage('Aggiunto alla watchlist');
        
        // Ricarica la watchlist per ottenere l'ID della relazione
        this.loadWatchlistStatus();
        this.watchlistLoading = false;
      },
      error: (err) => {
        console.error('Errore aggiunta:', err);
        
        // GESTIONE SPECIFICA PER ERRORI 409 (già presente)
        if (err.status === 409) {
          console.log('⚠️ Film già in watchlist, aggiorno stato');
          this.isInWatchlist = true;
          this.loadWatchlistStatus(); // Ricarica per sincronizzare
        }
        
        this.watchlistLoading = false;
      }
    });
  }
}

/**
 * Mostra un messaggio temporaneo
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
   * Gestisce il click sul bottone "Guarda trailer"
   * Se l'utente non è autenticato, apre il modal di login
   */
  playTrailer() {
    if (!this.isAuthenticated) {
      // Apri il modal di login (presente nella navbar)
      const loginButton = document.querySelector('[data-bs-target="#loginModal"]') as HTMLElement;
      if (loginButton) {
        loginButton.click();
      }
      return;
    }
    
    // Se autenticato, procedi con la riproduzione del trailer
    console.log('Riproduzione trailer serie:', this.series?.title);
    window.open(this.series?.youtube_link, '_blank');
  }
}