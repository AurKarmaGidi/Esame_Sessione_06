import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../services/movie';
import { SeriesService } from '../../services/series';
import { AuthService } from '../../services/auth';
import { Subscription } from 'rxjs';

/**
 * Componente unificato per visualizzare film e serie TV di una specifica categoria/genere.
 * Mostra due caroselli separati: uno per i film e uno per le serie TV.
 * Accessibile solo a utenti autenticati.
 */
@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-page.html',
  styleUrls: ['./category-page.scss']
})
export class CategoryPage implements OnInit, OnDestroy {
  genre: string = '';
  
  movies: any[] = [];
  moviesLoading = true;
  moviesEmpty = false;
  
  series: any[] = [];
  seriesLoading = true;
  seriesEmpty = false;
  
  loading = true;
  isAuthenticated = false;

  private userSubscription: Subscription | null = null;
  private routeSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private seriesService: SeriesService,
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

    // Ottieni il genere dalla rotta
    this.routeSubscription = this.route.params.subscribe(params => {
      this.genre = params['genre'];
      this.loadContentByGenre(this.genre);
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  /**
   * Carica film e serie del genere specificato
   */
  loadContentByGenre(genre: string) {
    this.loading = true;
    this.moviesLoading = true;
    this.seriesLoading = true;
    
    // Carica film
    this.movieService.getMovies(1000).subscribe({
      next: (response) => {
        const allMovies = response.movies || [];
        this.movies = allMovies.filter((movie: any) => 
          movie.movie_genre?.toLowerCase() === genre.toLowerCase()
        );
        this.moviesEmpty = this.movies.length === 0;
        this.moviesLoading = false;
        this.checkLoading();
      },
      error: (err) => {
        console.error('Errore caricamento film:', err);
        this.loadMockMovies(genre);
      }
    });

    // Carica serie
    this.seriesService.getSeries(1000).subscribe({
      next: (response) => {
        const allSeries = response.series || [];
        this.series = allSeries.filter((serie: any) => 
          serie.series_genre?.toLowerCase() === genre.toLowerCase()
        );
        this.seriesEmpty = this.series.length === 0;
        this.seriesLoading = false;
        this.checkLoading();
      },
      error: (err) => {
        console.error('Errore caricamento serie:', err);
        this.loadMockSeries(genre);
      }
    });
  }

  /**
   * Dati di esempio per film (sviluppo)
   */
  loadMockMovies(genre: string) {
    const mockMovies: any[] = [];
    
    if (genre === 'Azione') {
      mockMovies.push(
        { id: 3, title: 'The Dark Knight', movie_genre: 'Azione', poster: 'https://picsum.photos/300/450?random=3', release_year: 2008 },
        { id: 9, title: 'Mad Max: Fury Road', movie_genre: 'Azione', poster: 'https://picsum.photos/300/450?random=9', release_year: 2015 },
        { id: 10, title: 'John Wick', movie_genre: 'Azione', poster: 'https://picsum.photos/300/450?random=10', release_year: 2014 }
      );
    } else if (genre === 'Fantascienza') {
      mockMovies.push(
        { id: 1, title: 'Inception', movie_genre: 'Fantascienza', poster: 'https://picsum.photos/300/450?random=1', release_year: 2010 },
        { id: 2, title: 'Interstellar', movie_genre: 'Fantascienza', poster: 'https://picsum.photos/300/450?random=2', release_year: 2014 },
        { id: 7, title: 'The Matrix', movie_genre: 'Fantascienza', poster: 'https://picsum.photos/300/450?random=7', release_year: 1999 }
      );
    } else if (genre === 'Thriller') {
      mockMovies.push(
        { id: 4, title: 'Pulp Fiction', movie_genre: 'Thriller', poster: 'https://picsum.photos/300/450?random=4', release_year: 1994 },
        { id: 5, title: 'Fight Club', movie_genre: 'Thriller', poster: 'https://picsum.photos/300/450?random=5', release_year: 1999 }
      );
    } else if (genre === 'Drammatico') {
      mockMovies.push(
        { id: 6, title: 'Forrest Gump', movie_genre: 'Drammatico', poster: 'https://picsum.photos/300/450?random=6', release_year: 1994 }
      );
    } else if (genre === 'Poliziesco') {
      mockMovies.push(
        { id: 8, title: 'Goodfellas', movie_genre: 'Poliziesco', poster: 'https://picsum.photos/300/450?random=8', release_year: 1990 }
      );
    }

    this.movies = mockMovies;
    this.moviesEmpty = this.movies.length === 0;
    this.moviesLoading = false;
    this.checkLoading();
  }

  /**
   * Dati di esempio per serie TV (sviluppo)
   */
  loadMockSeries(genre: string) {
    const mockSeries: any[] = [];
    
    if (genre === 'Fantascienza') {
      mockSeries.push(
        { id: 1, title: 'Stranger Things', series_genre: 'Fantascienza', poster: 'https://picsum.photos/300/450?random=11', seasons: 4 },
        { id: 4, title: 'The Mandalorian', series_genre: 'Fantascienza', poster: 'https://picsum.photos/300/450?random=14', seasons: 3 }
      );
    } else if (genre === 'Drammatico') {
      mockSeries.push(
        { id: 2, title: 'The Crown', series_genre: 'Drammatico', poster: 'https://picsum.photos/300/450?random=12', seasons: 5 }
      );
    } else if (genre === 'Thriller') {
      mockSeries.push(
        { id: 3, title: 'Breaking Bad', series_genre: 'Thriller', poster: 'https://picsum.photos/300/450?random=13', seasons: 5 }
      );
    } else if (genre === 'Fantasy') {
      mockSeries.push(
        { id: 5, title: 'Game of Thrones', series_genre: 'Fantasy', poster: 'https://picsum.photos/300/450?random=15', seasons: 8 },
        { id: 6, title: 'The Witcher', series_genre: 'Fantasy', poster: 'https://picsum.photos/300/450?random=16', seasons: 3 }
      );
    }

    this.series = mockSeries;
    this.seriesEmpty = this.series.length === 0;
    this.seriesLoading = false;
    this.checkLoading();
  }

  /**
   * Verifica se entrambi i caricamenti sono completati
   */
  checkLoading() {
    if (!this.moviesLoading && !this.seriesLoading) {
      this.loading = false;
    }
  }

  /**
   * Naviga verso la pagina di dettaglio di un film
   */
  goToMovie(id: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/movie', id]);
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
   * Calcola le slide per il carosello dei film
   */
  calculateMovieSlides(): number[] {
    return new Array(Math.ceil(this.movies.length / 5));
  }

  /**
   * Calcola le slide per il carosello delle serie
   */
  calculateSeriesSlides(): number[] {
    return new Array(Math.ceil(this.series.length / 5));
  }

  /**
   * Formatta il nome del genere per il titolo
   */
  formatGenreName(genre: string): string {
    return genre;
  }

  /**
   * Ottiene ID univoco per il carosello film
   */
  getMoviesCarouselId(): string {
    return 'movies-carousel-' + this.genre.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  }

  /**
   * Ottiene ID univoco per il carosello serie
   */
  getSeriesCarouselId(): string {
    return 'series-carousel-' + this.genre.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  }
}