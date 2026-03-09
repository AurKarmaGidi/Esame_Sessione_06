import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie';
import { SeriesService } from '../../services/series';
import { AuthService } from '../../services/auth';
import { Subscription } from 'rxjs';
import { LanguageSelector } from '../language-selector/language-selector';
import { TranslatePipe } from '../../pipes/translate.pipe';

/**
 * Componente per la barra di navigazione principale.
 * Gestisce il menu, la ricerca live, il modal di login e il menu utente.
 * Integrazione completa con il backend reale.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, LanguageSelector, TranslatePipe],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar implements OnInit, OnDestroy {
  isMenuCollapsed = true;
  searchQuery = '';
  userName: string | null = null;
  userRole: string | null = null;
  userCredits: number = 0;
  searchResults: any[] = [];
  showSearchResults = false;
  searchPerformed = false;

  // Variabili per il modal di login
  loginEmail = '';
  loginPassword = '';
  loginError = '';
  isLoggingIn = false;

  private userSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private movieService: MovieService,
    private seriesService: SeriesService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    // Sottoscrive ai cambiamenti dello stato utente
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.userName = `${user.name} ${user.surname}`;
        this.userRole = user.role || 'user';
        this.userCredits = user.credits || 0;
      } else {
        this.userName = null;
        this.userRole = null;
        this.userCredits = 0;
      }
    });
  }

  ngOnDestroy() {
    // pulisce la subscription per evitare memory leak
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  /**
   * Apre il modal di login
   */
  openLoginModal() {
    this.loginEmail = '';
    this.loginPassword = '';
    this.loginError = '';
    
    const modal = document.getElementById('loginModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  /**
   * Chiude il modal di login
   */
  closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
  }

  /**
   * PRIMO STEP DEL LOGIN: Ottiene la sfida e procede al login
   */
  onLogin() {
    if (!this.loginEmail || !this.loginPassword) {
      this.loginError = 'Inserisci email e password';
      return;
    }

    this.isLoggingIn = true;
    this.loginError = '';

    // 1. Ottieni la sfida dal server
    this.authService.getChallenge(this.loginEmail).subscribe({
      next: (challengeResponse) => {
        console.log('Sfida ottenuta:', challengeResponse);
        
        // 2. Procedi con il login usando la sfida ricevuta
        this.authService.login(
          this.loginEmail, 
          this.loginPassword, 
          challengeResponse.sfida
        ).subscribe({
          next: (loginResponse) => {
            console.log('Login riuscito:', loginResponse);
            
            this.closeLoginModal();
            
            // Reindirizza in base al ruolo
            if (loginResponse.role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/account']);
            }
            
            this.isLoggingIn = false;
          },
          error: (error) => {
            console.error('Errore login:', error);
            this.loginError = error.error || 'Email o password non validi';
            this.isLoggingIn = false;
          }
        });
      },
      error: (error) => {
        console.error('Errore ottenimento sfida:', error);
        this.loginError = 'Errore durante il login. Riprova più tardi.';
        this.isLoggingIn = false;
      }
    });
  }

  /**
   * Gestisce il logout dell'utente
   */
  onLogout(event: Event) {
    event.preventDefault();
    
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logout effettuato:', response);
      },
      error: (error) => {
        console.error('Errore logout:', error);
      }
    });
  }

  /**
   * Esegue la ricerca live quando l'utente digita
   */
  onSearch() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showSearchResults = false;
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    console.log('Ricerca per:', query);

    let allResults: any[] = [];
    this.searchPerformed = true;

    // Cerca nei film
    this.movieService.getMovies(100).subscribe({
      next: (movieResponse) => {
        const movieResults = (movieResponse.movies || [])
          .filter((movie: any) => movie.title?.toLowerCase().includes(query))
          .map((movie: any) => ({
            ...movie,
            type: 'movie',
            typeLabel: 'Film'
          }));
        
        allResults = [...movieResults];

        // Cerca nelle serie
        this.seriesService.getSeries(100).subscribe({
          next: (seriesResponse) => {
            const seriesResults = (seriesResponse.series || [])
              .filter((series: any) => series.title?.toLowerCase().includes(query))
              .map((series: any) => ({
                ...series,
                type: 'series',
                typeLabel: 'Serie TV'
              }));
            
            allResults = [...allResults, ...seriesResults];
            this.searchResults = allResults.slice(0, 10);
            this.showSearchResults = this.searchResults.length > 0;
          },
          error: (err) => {
            console.error('Errore ricerca serie:', err);
            this.searchResults = allResults.slice(0, 10);
            this.showSearchResults = this.searchResults.length > 0;
          }
        });
      },
      error: (err) => {
        console.error('Errore ricerca film:', err);
        this.searchResults = [];
        this.showSearchResults = false;
      }
    });
  }

  /**
   * Seleziona un risultato e naviga alla pagina di dettaglio
   */
  selectResult(result: any) {
    console.log('🎬 Selezionato:', result);
    this.showSearchResults = false;
    this.searchQuery = '';
    
    if (result.type === 'movie') {
      this.router.navigate(['/movie', result.id]);
    } else if (result.type === 'series') {
      this.router.navigate(['/serie', result.id]);
    }
  }

  /**
   * Nasconde i risultati della ricerca con un piccolo ritardo
   */
  hideResults() {
    setTimeout(() => {
      this.showSearchResults = false;
    }, 200);
  }

  /**
   * Verifica se l'utente è autenticato
   */
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Ottiene i crediti formattati
   */
  getFormattedCredits(): string {
    return this.userCredits.toFixed(2);
  }
}