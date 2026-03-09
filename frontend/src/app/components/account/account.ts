import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../services/movie';
import { SeriesService } from '../../services/series';
import { WatchlistService } from '../../services/watchlist.service';
import { AuthService } from '../../services/auth';
import { WatchlistItem } from '../../models/watchlist';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account.html',
  styleUrls: ['./account.scss']
})
export class Account implements OnInit, OnDestroy {
  activeTab: 'watchlist' | 'suggested' = 'watchlist';
  watchlistItems: WatchlistItem[] = [];
  suggestedMovies: any[] = [];
  suggestedSeries: any[] = [];
  loading = true;
  loadingWatchlist = false; // Aggiunto per gestire caricamento separato
  currentUser: any = null;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private movieService: MovieService,
    private seriesService: SeriesService,
    private watchlistService: WatchlistService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const userSub = this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        console.log('👤 Utente corrente:', user);
        this.loadWatchlist(); // Carica watchlist
        this.loadSuggestedContent(); // Carica suggeriti
      } else {
        console.log('Utente non autenticato in Account');
        this.loading = false;
      }
    });
    
    this.subscriptions.push(userSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setActiveTab(tab: 'watchlist' | 'suggested'): void {
    this.activeTab = tab;
  }

  /**
   * Carica la watchlist dell'utente
   */
  loadWatchlist(): void {
    if (!this.currentUser) {
      console.warn('loadWatchlist: currentUser non definito');
      return;
    }
    
    this.loadingWatchlist = true;
    console.log('Caricamento watchlist per user:', this.currentUser.id);
    
    this.watchlistService.getWatchlist(this.currentUser.id).subscribe({
      next: (response) => {
        console.log('Risposta servizio watchlist:', response);
        
        if (response && response.data) {
          this.watchlistItems = response.data;
          console.log('Watchlist items assegnati:', this.watchlistItems.length);
          console.log('Primo elemento:', this.watchlistItems[0]);
        } else {
          console.warn('response.data non presente', response);
          this.watchlistItems = [];
        }
        
        this.loadingWatchlist = false;
        this.checkLoading();
      },
      error: (err) => {
        console.error('Errore caricamento watchlist:', err);
        this.watchlistItems = [];
        this.loadingWatchlist = false;
        this.checkLoading();
      }
    });
  }

  /**
   * Verifica se un contenuto è nella watchlist
   */
  isInWatchlist(contentId: number, contentType: 'movie' | 'series'): boolean {
    return this.watchlistItems.some(item => 
      item.content_id === contentId && 
      item.content_type === contentType
    );
  }

  /**
   * Ottiene l'ID della relazione watchlist
   */
  getWatchlistItemId(contentId: number, contentType: 'movie' | 'series'): number | null {
    const item = this.watchlistItems.find(item => 
      item.content_id === contentId && 
      item.content_type === contentType
    );
    return item ? item.id : null;
  }

  /**
   * Aggiunge o rimuove un contenuto dalla watchlist
   */
  toggleWatchlist(content: any, contentType: 'movie' | 'series', event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.currentUser) return;
    
    const isInList = this.isInWatchlist(content.id, contentType);
    
    if (isInList) {
      const itemId = this.getWatchlistItemId(content.id, contentType);
      if (itemId) {
        this.watchlistService.removeFromWatchlist(this.currentUser.id, itemId).subscribe({
          next: () => {
            console.log(' Rimosso dalla watchlist');
            this.loadWatchlist(); // Ricarica
          },
          error: (err) => console.error('Errore rimozione:', err)
        });
      }
    } else {
      this.watchlistService.addToWatchlist(this.currentUser.id, content.id, contentType).subscribe({
        next: (response) => {
          console.log('✅ Aggiunto alla watchlist');
          this.loadWatchlist(); // Ricarica
        },
        error: (err) => console.error('❌ Errore aggiunta:', err)
      });
    }
  }

  /**
   * Rimuove un elemento dalla watchlist
   */
  removeFromWatchlist(watchlistId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.currentUser) return;
    
    this.watchlistService.removeFromWatchlist(this.currentUser.id, watchlistId).subscribe({
      next: () => {
        console.log('✅ Elemento rimosso dalla watchlist');
        this.watchlistItems = this.watchlistItems.filter(item => item.id !== watchlistId);
      },
      error: (err) => console.error('❌ Errore rimozione:', err)
    });
  }

  /**
   * Carica contenuti suggeriti
   */
  loadSuggestedContent(): void {
    this.movieService.getMovies(100).subscribe({
      next: (response) => {
        const shuffled = [...(response.movies || [])].sort(() => 0.5 - Math.random());
        this.suggestedMovies = shuffled.slice(0, 5);
        this.checkLoading();
      },
      error: (err) => {
        console.error('Errore caricamento film suggeriti:', err);
        this.checkLoading();
      }
    });

    this.seriesService.getSeries().subscribe({
      next: (response) => {
        const shuffled = [...(response.series || [])].sort(() => 0.5 - Math.random());
        this.suggestedSeries = shuffled.slice(0, 5);
        this.checkLoading();
      },
      error: (err) => {
        console.error('Errore caricamento serie suggerite:', err);
        this.checkLoading();
      }
    });
  }

  /**
   * Metodo di utilità per gestire lo stato di caricamento
   */
  checkLoading(): void {
    if (!this.loadingWatchlist && (this.suggestedMovies.length > 0 || this.suggestedSeries.length > 0)) {
      this.loading = false;
    }
  }
}