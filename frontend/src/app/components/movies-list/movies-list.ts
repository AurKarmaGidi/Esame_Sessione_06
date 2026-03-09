import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MovieService } from '../../services/movie';
import { AuthService } from '../../services/auth';
import { Subscription } from 'rxjs';

/**
 * Componente per visualizzare l'elenco di tutti i film
 * divisi per categorie (genere) con caroselli.
 * Accessibile solo a utenti autenticati.
 */
@Component({
  selector: 'app-movies-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movies-list.html',
  styleUrls: ['./movies-list.scss']
})
export class MoviesList implements OnInit, OnDestroy {
  moviesByGenre: { [genre: string]: any[] } = {};
  genres: string[] = [];
  loading = true;
  isAuthenticated = false;

  private userSubscription: Subscription | null = null;

  constructor(
    private movieService: MovieService,
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

    this.loadAllMovies();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  /**
   * Carica tutti i film e li raggruppa per genere
   */
  loadAllMovies() {
    this.loading = true;
    this.movieService.getMovies(1000).subscribe({
      next: (response) => {
        const movies = response.movies || [];
        
        this.moviesByGenre = {};
        
        movies.forEach((movie: any) => {
          const genre = movie.movie_genre || 'Altro';
          if (!this.moviesByGenre[genre]) {
            this.moviesByGenre[genre] = [];
          }
          this.moviesByGenre[genre].push(movie);
        });

        this.genres = Object.keys(this.moviesByGenre).sort();
        this.loading = false;
        console.log('Film raggruppati per genere:', this.moviesByGenre);
      },
      error: (err) => {
        console.error('Errore caricamento film:', err);
        this.loading = false;
        this.loadMockData();
      }
    });
  }

  /**
   * Dati di esempio per sviluppo
   */
  loadMockData() {
    const mockMovies = [
      { id: 1, title: 'Inception', movie_genre: 'Fantascienza', poster: 'https://picsum.photos/300/450?random=1', release_year: 2010 },
      { id: 2, title: 'Interstellar', movie_genre: 'Fantascienza', poster: 'https://picsum.photos/300/450?random=2', release_year: 2014 },
      { id: 3, title: 'The Dark Knight', movie_genre: 'Azione', poster: 'https://picsum.photos/300/450?random=3', release_year: 2008 },
      { id: 4, title: 'Pulp Fiction', movie_genre: 'Thriller', poster: 'https://picsum.photos/300/450?random=4', release_year: 1994 },
      { id: 5, title: 'Fight Club', movie_genre: 'Thriller', poster: 'https://picsum.photos/300/450?random=5', release_year: 1999 },
      { id: 6, title: 'Forrest Gump', movie_genre: 'Drammatico', poster: 'https://picsum.photos/300/450?random=6', release_year: 1994 },
      { id: 7, title: 'The Matrix', movie_genre: 'Fantascienza', poster: 'https://picsum.photos/300/450?random=7', release_year: 1999 },
      { id: 8, title: 'Goodfellas', movie_genre: 'Poliziesco', poster: 'https://picsum.photos/300/450?random=8', release_year: 1990 },
    ];

    this.moviesByGenre = {};
    mockMovies.forEach(movie => {
      const genre = movie.movie_genre;
      if (!this.moviesByGenre[genre]) {
        this.moviesByGenre[genre] = [];
      }
      this.moviesByGenre[genre].push(movie);
    });

    this.genres = Object.keys(this.moviesByGenre).sort();
    this.loading = false;
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
   * Ottiene un ID univoco per il carosello basato sul genere
   */
  getCarouselId(genre: string): string {
    return 'carousel-' + genre.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  }

  /**
   * Metodo di utilità per Math.ceil nel template
   */
  calculateSlides(count: number): number[] {
    return new Array(Math.ceil(count / 5));
  }
}