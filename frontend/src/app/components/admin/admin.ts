import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { MovieService } from '../../services/movie';
import { SeriesService } from '../../services/series';
import { AdminService } from '../../services/admin.service';
import { Subscription } from 'rxjs';
/**
 * Interfaccia per tipizzare i dati utente
 */
interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  password?: string; // Solo per nuovo utente
  role: 'guest' | 'user' | 'admin';
  subscription_plan: 'free' | 'premium' | 'vip';
  credits: number;
  birth_date?: string;
  country_code?: string;
  region?: string;
  city?: string;
  address?: string;
  zip_code?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interfaccia per i film
 */
interface Movie {
  id: number;
  title: string;
  movie_genre: string;
  description: string;
  director: string;
  release_year: number;
  duration: number;
  poster: string;
  youtube_link: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interfaccia per le serie
 */
interface Series {
  id: number;
  title: string;
  series_genre: string;
  description: string;
  director: string;
  release_year: number;
  duration: number;
  poster: string;
  youtube_link: string;
  seasons: number;
  episodes: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Componente per il pannello di amministrazione.
 * Gestisce CRUD completo per utenti, film e serie TV.
 * Accessibile solo a utenti con ruolo 'admin'.
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class Admin implements OnInit, OnDestroy {
  // ==================== STATO DELL'INTERFACCIA ====================
  
  activeTab: 'users' | 'movies' | 'series' = 'users';
  loading = false;
  errorMessage = '';
  successMessage = '';

  // ==================== DATI UTENTI ====================
  
  users: User[] = [];
  selectedUser: User | null = null;
  userSearchTerm = '';
  showUserForm = false;
  showDeleteUserModal = false;
  userToDelete: User | null = null;
  
  userFormData: Partial<User> = {
    name: '',
    surname: '',
    email: '',
    password: '',
    role: 'user',
    subscription_plan: 'free',
    credits: 0,
    birth_date: '',
    country_code: 'IT',
    region: '',
    city: '',
    address: '',
    zip_code: ''
  };

  // ==================== DATI FILM ====================
  
  movies: Movie[] = [];
  selectedMovie: Movie | null = null;
  movieSearchTerm = '';
  showMovieForm = false;
  
  movieFormData: Partial<Movie> = {
    title: '',
    movie_genre: '',
    description: '',
    director: '',
    release_year: new Date().getFullYear(),
    duration: 120,
    poster: '',
    youtube_link: ''
  };

  // ==================== DATI SERIE ====================
  
  seriesList: Series[] = [];
  selectedSeries: Series | null = null;
  seriesSearchTerm = '';
  showSeriesForm = false;
  
  seriesFormData: Partial<Series> = {
    title: '',
    series_genre: '',
    description: '',
    director: '',
    release_year: new Date().getFullYear(),
    duration: 45,
    poster: '',
    youtube_link: '',
    seasons: 1,
    episodes: 10
  };

  // ==================== MODAL ELIMINAZIONE GENERICO ====================
  
  showDeleteModal = false;
  itemToDelete: { type: string; id: number; title: string } | null = null;

  // ==================== GENERI DISPONIBILI ====================
  
  genres = [
    'Azione', 'Avventura', 'Animazione', 'Biografico', 'Commedia',
    'Comico', 'Documentario', 'Drammatico', 'Erotico', 'Fantascienza',
    'Fantasy', 'Giallo', 'Guerra', 'Horror', 'Mitologico', 'Musicale',
    'Noir', 'Politico', 'Poliziesco', 'Religioso', 'Sentimentale',
    'Spionaggio', 'Sportivo', 'Storico', 'Thriller', 'Western'
  ];

  private userSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private movieService: MovieService,
    private seriesService: SeriesService,
    private router: Router
  ) {}

  /**
   * Inizializzazione del componente
   * Verifica che l'utente sia admin e carica i dati
   */
  ngOnInit() {
    // Verifica che l'utente sia admin (reindirizza se non lo è)
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (!user || user.role !== 'admin') {
        console.log('Accesso negato: utente non autorizzato');
        this.router.navigate(['/']);
        return;
      }
    });

    this.loadAllData();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // ==================== CARICAMENTO DATI ====================

  /**
   * Carica tutti i dati necessari per il pannello admin
   */
  loadAllData() {
    this.loading = true;
    
    // Carica gli utenti
    this.loadUsers();
    
    // Carica i film
    this.loadMovies();
    
    // Carica le serie
    this.loadSeries();
  }

  /**
   * Carica la lista degli utenti
   */
  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        if (response.data) {
          this.users = response.data;
        } else {
          this.showError('Nessun dato utente ricevuto');
        }
        this.checkLoading();
      },
      error: (err) => {
        console.error('Errore caricamento utenti:', err);
        this.showError(err.error || 'Errore nel caricamento degli utenti');
        this.checkLoading();
      }
    });
  }

  /**
   * Carica la lista dei film
   */
  loadMovies() {
    this.movieService.getMovies(1000).subscribe({
      next: (response) => {
        this.movies = response.movies || [];
        this.checkLoading();
      },
      error: (err) => {
        console.error('Errore caricamento film:', err);
        this.showError('Errore nel caricamento dei film');
        this.checkLoading();
      }
    });
  }

  /**
   * Carica la lista delle serie
   */
  loadSeries() {
    this.seriesService.getSeries(1000).subscribe({
      next: (response) => {
        this.seriesList = response.series || [];
        this.checkLoading();
      },
      error: (err) => {
        console.error('Errore caricamento serie:', err);
        this.showError('Errore nel caricamento delle serie');
        this.checkLoading();
      }
    });
  }

  /**
   * Verifica se tutti i caricamenti sono completati
   */
  checkLoading() {
    if (this.users.length > 0 || this.movies.length > 0 || this.seriesList.length > 0) {
      this.loading = false;
    }
  }

  // ==================== GESTIONE TAB ====================

  /**
   * Cambia la tab attiva
   * @param tab - Nome della tab
   */
  setTab(tab: 'users' | 'movies' | 'series') {
    this.activeTab = tab;
    this.showMovieForm = false;
    this.showSeriesForm = false;
    this.showUserForm = false;
    this.selectedMovie = null;
    this.selectedSeries = null;
    this.selectedUser = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ==================== GESTIONE UTENTI ====================

  /**
   * Apre il form per aggiungere/modificare un utente
   * @param user - Utente da modificare (opzionale)
   */
  openUserForm(user?: User) {
    if (user) {
      this.selectedUser = user;
      this.userFormData = { ...user };
      // Non includere la password nella modifica
      delete this.userFormData.password;
    } else {
      this.selectedUser = null;
      this.userFormData = {
        name: '',
        surname: '',
        email: '',
        password: '',
        role: 'user',
        subscription_plan: 'free',
        credits: 0,
        birth_date: this.getDefaultBirthDate(),
        country_code: 'IT',
        region: '',
        city: '',
        address: '',
        zip_code: ''
      };
    }
    this.showUserForm = true;
  }

  /**
   * Annulla il form utente
   */
  cancelUserForm() {
    this.showUserForm = false;
    this.selectedUser = null;
    this.userFormData = {};
  }

  /**
   * Salva un utente (nuovo o modificato)
   */
  saveUser() {
    // Validazione campi obbligatori
    if (!this.userFormData.name || !this.userFormData.surname || !this.userFormData.email) {
      this.showError('Nome, cognome ed email sono obbligatori');
      return;
    }

    // Per nuovo utente, password obbligatoria
    if (!this.selectedUser && !this.userFormData.password) {
      this.showError('La password è obbligatoria per i nuovi utenti');
      return;
    }

    this.loading = true;

    if (this.selectedUser) {
      // MODIFICA UTENTE ESISTENTE
      const updateData: Partial<User> = {
        name: this.userFormData.name,
        surname: this.userFormData.surname,
        email: this.userFormData.email,
        role: this.userFormData.role,
        subscription_plan: this.userFormData.subscription_plan,
        credits: this.userFormData.credits,
        birth_date: this.userFormData.birth_date,
        country_code: this.userFormData.country_code,
        region: this.userFormData.region,
        city: this.userFormData.city,
        address: this.userFormData.address,
        zip_code: this.userFormData.zip_code
      };

      this.adminService.updateUser(this.selectedUser.id, updateData).subscribe({
        next: (response) => {
          if (response.data) {
            // Aggiorna l'utente nella lista locale
            const index = this.users.findIndex(u => u.id === this.selectedUser?.id);
            if (index !== -1) {
              this.users[index] = { 
                ...this.users[index], 
                ...updateData,
                id: this.selectedUser!.id
              } as User;
            }
            this.showSuccess('Utente modificato con successo');
            this.cancelUserForm();
          } else {
            this.showError('Errore: ' + (response.error || 'Risposta non valida'));
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Errore modifica utente:', err);
          this.loading = false;
          this.showError(err.error || 'Errore nella modifica dell\'utente');
        }
      });
    } else {
      // NUOVO UTENTE
const newUserData: any = {
  name: this.userFormData.name,
  surname: this.userFormData.surname,
  email: this.userFormData.email,
  role: this.userFormData.role || 'user',
  subscription_plan: this.userFormData.subscription_plan || 'free',
  credits: this.userFormData.credits || 0,
  birth_date: this.userFormData.birth_date,
  country_code: this.userFormData.country_code || 'IT',
  region: this.userFormData.region,
  city: this.userFormData.city,
  address: this.userFormData.address,
  zip_code: this.userFormData.zip_code
};

// Aggiungi password solo se presente
if (this.userFormData.password) {
  newUserData.password = this.userFormData.password;
}

this.adminService.addUser(newUserData).subscribe({
  next: (response) => {
    if (response.data?.id) {
      const newUser = {
        ...newUserData,
        id: response.data.id
      } as User;
      // Rimuovi la password dai dati visualizzati
      delete newUser.password;
      this.users.unshift(newUser); // Aggiunge all'inizio della lista
      this.showSuccess('Utente aggiunto con successo');
      this.cancelUserForm();
    } else {
      this.showError('Errore: ' + (response.error || 'Risposta non valida'));
    }
    this.loading = false;
  },
  error: (err) => {
    console.error('Errore aggiunta utente:', err);
    this.loading = false;
    this.showError(err.error || 'Errore nell\'aggiunta dell\'utente');
  }
});
    }
  }

  /**
   * Conferma l'eliminazione di un utente
   * @param user - Utente da eliminare
   */
  confirmDeleteUser(user: User) {
    this.userToDelete = user;
    this.showDeleteUserModal = true;
  }

  /**
   * Annulla l'eliminazione dell'utente
   */
  cancelDeleteUser() {
    this.showDeleteUserModal = false;
    this.userToDelete = null;
  }

  /**
   * Elimina l'utente selezionato
   */
  deleteUser() {
    if (!this.userToDelete) return;

    this.loading = true;
    this.adminService.deleteUser(this.userToDelete.id).subscribe({
      next: (response) => {
        if (response.data) {
          this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
          this.showSuccess('Utente eliminato con successo');
        } else {
          this.showError('Errore: ' + (response.error || 'Risposta non valida'));
        }
        this.loading = false;
        this.showDeleteUserModal = false;
        this.userToDelete = null;
      },
      error: (err) => {
        console.error('Errore eliminazione utente:', err);
        this.loading = false;
        this.showDeleteUserModal = false;
        this.showError(err.error || 'Errore nell\'eliminazione dell\'utente');
      }
    });
  }

  // ==================== GESTIONE FILM ====================

  /**
   * Apre il form per aggiungere/modificare un film
   * @param movie - Film da modificare (opzionale)
   */
  openMovieForm(movie?: Movie) {
    if (movie) {
      this.selectedMovie = movie;
      this.movieFormData = { ...movie };
    } else {
      this.selectedMovie = null;
      this.movieFormData = {
        title: '',
        movie_genre: '',
        description: '',
        director: '',
        release_year: new Date().getFullYear(),
        duration: 120,
        poster: '',
        youtube_link: ''
      };
    }
    this.showMovieForm = true;
  }

  /**
   * Annulla il form film
   */
  cancelMovieForm() {
    this.showMovieForm = false;
    this.selectedMovie = null;
    this.movieFormData = {};
  }

  /**
   * Salva un film (nuovo o modificato)
   */
  saveMovie() {
    if (!this.movieFormData.title || !this.movieFormData.movie_genre || !this.movieFormData.director) {
      this.showError('Compila tutti i campi obbligatori');
      return;
    }

    this.loading = true;

    if (this.selectedMovie) {
      // Modifica film esistente
      this.adminService.updateMovie(this.selectedMovie.id, this.movieFormData).subscribe({
        next: (response) => {
          if (response.data) {
            const index = this.movies.findIndex(m => m.id === this.selectedMovie?.id);
            if (index !== -1) {
              this.movies[index] = { ...this.movies[index], ...this.movieFormData };
            }
            this.showSuccess('Film modificato con successo');
            this.cancelMovieForm();
          } else {
            this.showError('Errore: ' + (response.error || 'Risposta non valida'));
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Errore modifica film:', err);
          this.loading = false;
          this.showError(err.error || 'Errore nella modifica del film');
        }
      });
    } else {
      // Nuovo film
      this.adminService.addMovie(this.movieFormData as Omit<Movie, 'id'>).subscribe({
        next: (response) => {
          if (response.data?.id) {
            const newMovie = {
              ...this.movieFormData,
              id: response.data.id
            } as Movie;
            this.movies.push(newMovie);
            this.showSuccess('Film aggiunto con successo');
            this.cancelMovieForm();
          } else {
            this.showError('Errore: ' + (response.error || 'Risposta non valida'));
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Errore aggiunta film:', err);
          this.loading = false;
          this.showError(err.error || 'Errore nell\'aggiunta del film');
        }
      });
    }
  }

  // ==================== GESTIONE SERIE ====================

  /**
   * Apre il form per aggiungere/modificare una serie
   * @param series - Serie da modificare (opzionale)
   */
  openSeriesForm(series?: Series) {
    if (series) {
      this.selectedSeries = series;
      this.seriesFormData = { ...series };
    } else {
      this.selectedSeries = null;
      this.seriesFormData = {
        title: '',
        series_genre: '',
        description: '',
        director: '',
        release_year: new Date().getFullYear(),
        duration: 45,
        poster: '',
        youtube_link: '',
        seasons: 1,
        episodes: 10
      };
    }
    this.showSeriesForm = true;
  }

  /**
   * Annulla il form serie
   */
  cancelSeriesForm() {
    this.showSeriesForm = false;
    this.selectedSeries = null;
    this.seriesFormData = {};
  }

  /**
   * Salva una serie (nuova o modificata)
   */
  saveSeries() {
    if (!this.seriesFormData.title || !this.seriesFormData.series_genre || !this.seriesFormData.director) {
      this.showError('Compila tutti i campi obbligatori');
      return;
    }

    this.loading = true;

    if (this.selectedSeries) {
      // Modifica serie esistente
      this.adminService.updateSeries(this.selectedSeries.id, this.seriesFormData).subscribe({
        next: (response) => {
          if (response.data) {
            const index = this.seriesList.findIndex(s => s.id === this.selectedSeries?.id);
            if (index !== -1) {
              this.seriesList[index] = { ...this.seriesList[index], ...this.seriesFormData };
            }
            this.showSuccess('Serie modificata con successo');
            this.cancelSeriesForm();
          } else {
            this.showError('Errore: ' + (response.error || 'Risposta non valida'));
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Errore modifica serie:', err);
          this.loading = false;
          this.showError(err.error || 'Errore nella modifica della serie');
        }
      });
    } else {
      // Nuova serie
      this.adminService.addSeries(this.seriesFormData as Omit<Series, 'id'>).subscribe({
        next: (response) => {
          if (response.data?.id) {
            const newSeries = {
              ...this.seriesFormData,
              id: response.data.id
            } as Series;
            this.seriesList.push(newSeries);
            this.showSuccess('Serie aggiunta con successo');
            this.cancelSeriesForm();
          } else {
            this.showError('Errore: ' + (response.error || 'Risposta non valida'));
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Errore aggiunta serie:', err);
          this.loading = false;
          this.showError(err.error || 'Errore nell\'aggiunta della serie');
        }
      });
    }
  }

  // ==================== GESTIONE ELIMINAZIONE GENERICA ====================

  /**
   * Conferma l'eliminazione di un elemento (film o serie)
   * @param type - Tipo di elemento ('movie' o 'series')
   * @param id - ID dell'elemento
   * @param title - Titolo dell'elemento
   */
  confirmDelete(type: string, id: number, title: string) {
    this.itemToDelete = { type, id, title };
    this.showDeleteModal = true;
  }

  /**
   * Annulla l'eliminazione
   */
  cancelDelete() {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  /**
   * Elimina l'elemento selezionato
   */
  deleteItem() {
    if (!this.itemToDelete) return;

    this.loading = true;

    if (this.itemToDelete.type === 'movie') {
      this.adminService.deleteMovie(this.itemToDelete.id).subscribe({
        next: (response) => {
          if (response.data) {
            this.movies = this.movies.filter(m => m.id !== this.itemToDelete!.id);
            this.showSuccess('Film eliminato con successo');
            this.finishDelete();
          } else {
            this.showError('Errore: ' + (response.error || 'Risposta non valida'));
            this.loading = false;
            this.showDeleteModal = false;
          }
        },
        error: (err) => {
          console.error('Errore eliminazione film:', err);
          this.loading = false;
          this.showDeleteModal = false;
          this.showError(err.error || 'Errore nell\'eliminazione del film');
        }
      });
    } else if (this.itemToDelete.type === 'series') {
      this.adminService.deleteSeries(this.itemToDelete.id).subscribe({
        next: (response) => {
          if (response.data) {
            this.seriesList = this.seriesList.filter(s => s.id !== this.itemToDelete!.id);
            this.showSuccess('Serie eliminata con successo');
            this.finishDelete();
          } else {
            this.showError('Errore: ' + (response.error || 'Risposta non valida'));
            this.loading = false;
            this.showDeleteModal = false;
          }
        },
        error: (err) => {
          console.error('Errore eliminazione serie:', err);
          this.loading = false;
          this.showDeleteModal = false;
          this.showError(err.error || 'Errore nell\'eliminazione della serie');
        }
      });
    }
  }

  /**
   * Completa l'eliminazione
   */
  private finishDelete() {
    this.loading = false;
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  // ==================== UTILITY ====================

  /**
   * Mostra un messaggio di successo
   * @param message - Messaggio da mostrare
   */
  showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
  }

  /**
   * Mostra un messaggio di errore
   * @param message - Messaggio da mostrare
   */
  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 3000);
  }

  /**
   * Restituisce una data di nascita di default (18 anni fa)
   */
  private getDefaultBirthDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date.toISOString().split('T')[0];
  }

  /**
   * Formatta una data
   * @param date - Data da formattare
   * @returns Data formattata
   */
  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('it-IT');
  }

  // ==================== STATISTICHE ====================

  /**
   * Totale utenti
   */
  get totalUsersCount(): number {
    return this.users.length;
  }

  /**
   * Numero di admin
   */
  get adminUsersCount(): number {
    return this.users.filter(u => u.role === 'admin').length;
  }

  /**
   * Numero di utenti con abbonamento premium/vip
   */
  get premiumUsersCount(): number {
    return this.users.filter(u => u.subscription_plan !== 'free').length;
  }

  /**
   * Somma totale dei crediti
   */
  get totalCreditsSum(): number {
    return this.users.reduce((sum, u) => sum + Number(u.credits || 0), 0);
  }

  // ==================== FILTRI ====================

  /**
   * Film filtrati per termine di ricerca
   */
  get filteredMovies(): Movie[] {
    if (!this.movieSearchTerm) return this.movies;
    const term = this.movieSearchTerm.toLowerCase();
    return this.movies.filter(m => 
      m.title.toLowerCase().includes(term) ||
      m.director.toLowerCase().includes(term) ||
      m.movie_genre.toLowerCase().includes(term)
    );
  }

  /**
   * Serie filtrate per termine di ricerca
   */
  get filteredSeries(): Series[] {
    if (!this.seriesSearchTerm) return this.seriesList;
    const term = this.seriesSearchTerm.toLowerCase();
    return this.seriesList.filter(s => 
      s.title.toLowerCase().includes(term) ||
      s.director.toLowerCase().includes(term) ||
      s.series_genre.toLowerCase().includes(term)
    );
  }

  /**
   * Utenti filtrati per termine di ricerca
   */
  get filteredUsers(): User[] {
    if (!this.userSearchTerm) return this.users;
    const term = this.userSearchTerm.toLowerCase();
    return this.users.filter(u => 
      u.name.toLowerCase().includes(term) ||
      u.surname.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  }
}