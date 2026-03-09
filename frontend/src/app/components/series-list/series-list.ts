import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SeriesService } from '../../services/series';
import { AuthService } from '../../services/auth';
import { Subscription } from 'rxjs';

/**
 * Componente per visualizzare l'elenco di tutte le serie TV
 * divise per categorie (genere) con caroselli.
 * Accessibile solo a utenti autenticati.
 */
@Component({
  selector: 'app-series-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './series-list.html',
  styleUrls: ['./series-list.scss']
})
export class SeriesList implements OnInit, OnDestroy {
  seriesByGenre: { [genre: string]: any[] } = {};
  genres: string[] = [];
  loading = true;
  isAuthenticated = false;

  private userSubscription: Subscription | null = null;

  constructor(
    private seriesService: SeriesService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Verifica autenticazione
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.isAuthenticated = !!user;
      if (!this.isAuthenticated) {
        this.router.navigate(['/']);
      }
    });

    this.loadAllSeries();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  /**
   * Carica tutte le serie e le raggruppa per genere
   */
  loadAllSeries() {
    this.loading = true;
    this.seriesService.getSeries(1000).subscribe({
      next: (response) => {
        const series = response.series || [];
        
        this.seriesByGenre = {};
        
        series.forEach((serie: any) => {
          const genre = serie.series_genre || 'Altro';
          if (!this.seriesByGenre[genre]) {
            this.seriesByGenre[genre] = [];
          }
          this.seriesByGenre[genre].push(serie);
        });

        this.genres = Object.keys(this.seriesByGenre).sort();
        
        this.loading = false;
        console.log('Serie raggruppate per genere:', this.seriesByGenre);
      },
      error: (err) => {
        console.error('Errore caricamento serie:', err);
        this.loading = false;
        this.loadMockData();
      }
    });
  }

  /**
   * Dati di esempio per sviluppo
   */
  loadMockData() {
    const mockSeries = [
      { id: 1, title: 'Stranger Things', series_genre: 'Fantascienza', poster: 'https://picsum.photos/300/450?random=11', seasons: 4, episodes: 34 },
      { id: 2, title: 'The Crown', series_genre: 'Drammatico', poster: 'https://picsum.photos/300/450?random=12', seasons: 5, episodes: 50 },
      { id: 3, title: 'Breaking Bad', series_genre: 'Thriller', poster: 'https://picsum.photos/300/450?random=13', seasons: 5, episodes: 62 },
      { id: 4, title: 'The Mandalorian', series_genre: 'Fantascienza', poster: 'https://picsum.photos/300/450?random=14', seasons: 3, episodes: 24 },
      { id: 5, title: 'Game of Thrones', series_genre: 'Fantasy', poster: 'https://picsum.photos/300/450?random=15', seasons: 8, episodes: 73 },
      { id: 6, title: 'The Witcher', series_genre: 'Fantasy', poster: 'https://picsum.photos/300/450?random=16', seasons: 3, episodes: 24 },
    ];

    this.seriesByGenre = {};
    mockSeries.forEach(serie => {
      const genre = serie.series_genre;
      if (!this.seriesByGenre[genre]) {
        this.seriesByGenre[genre] = [];
      }
      this.seriesByGenre[genre].push(serie);
    });

    this.genres = Object.keys(this.seriesByGenre).sort();
    this.loading = false;
  }

  /**
   * Naviga verso la pagina di dettaglio di una serie
   */
  goToSeries(id: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/serie', id]);
  }

  /**
   * Ottiene un ID univoco per il carosello basato sul genere
   */
  getCarouselId(genre: string): string {
    return 'carousel-series-' + genre.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  }

  /**
   * Metodo di utilità per Math.ceil nel template
   */
  calculateSlides(count: number): number[] {
    return new Array(Math.ceil(count / 5));
  }
}