import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, switchMap} from 'rxjs/operators';
import { User } from '../models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/v1';
  private tokenKey = 'auth_token';
  private userSubject = new BehaviorSubject<User | null>(null);
  
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  /**
   * PRIMO STEP DEL LOGIN: Ottiene la sfida per l'autenticazione
   */
  getChallenge(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/accedi/${encodeURIComponent(email)}`);
  }

  /**
   * SECONDO STEP DEL LOGIN: Login con email, password e sfida
   */
  login(email: string, password: string, sfida: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { 
      email, 
      password, 
      sfida 
    }).pipe(
      tap((response: any) => {
        console.log('Risposta login completa:', response); // DEBUG
        if (response.success && response.token) {
          this.handleLoginSuccess(response);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Login semplificato (senza doppio step) dopo la registrazione
   */
  simpleLogin(email: string, password: string): Observable<any> {
    return this.getChallenge(email).pipe(
      switchMap((challengeResponse) => {
        return this.login(email, password, challengeResponse.sfida);
      })
    );
  }

  /**
   * Gestisce il successo del login
   */
  private handleLoginSuccess(response: any): void {
    console.log('handleLoginSuccess - response:', response);
    
    // Salva il token
    localStorage.setItem(this.tokenKey, response.token);
    
    // Costruisci l'oggetto User con tutti i campi necessari
    const user: User = {
      id: response.user_id || response.id, // Prova entrambi i possibili nomi
      email: response.email || '',
      name: response.name || '', // Assicurati che name sia presente
      surname: response.surname || '', // Assicurati che surname sia presente
      role: response.role || 'user',
      subscription_plan: response.subscription_plan || 'free',
      credits: response.credits || 0
    };
    
    console.log('Utente costruito:', user); // DEBUG
    
    this.userSubject.next(user);
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  /**
   * Registrazione nuovo utente
   */
  register(userData: any): Observable<any> {
    const registrationData = {
      name: userData.name?.trim() || '',
      surname: userData.surname?.trim() || '',
      email: userData.email?.trim().toLowerCase() || '',
      password: userData.password || '',
      birth_date: userData.birth_date || this.getDefaultBirthDate(),
      country_code: userData.country_code || 'IT',
      region: userData.region || 'Lombardia',
      city: userData.city || 'Milano',
      address: userData.address || 'Via Default 1',
      zip_code: userData.zip_code || '20100',
    };

    console.log('Invio dati registrazione:', registrationData);

    return this.http.post(`${this.apiUrl}/auth/register`, registrationData).pipe(
      tap((response: any) => {
        console.log('Risposta registrazione:', response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Registrazione COMPLETA con login automatico - MODIFICATO
   */
  registerAndLogin(userData: any): Observable<any> {
    console.log('registerAndLogin - Dati ricevuti:', userData);

    return new Observable((observer) => {
      this.register(userData).subscribe({
        next: (registerResponse) => {
          console.log('Registrazione completata, risposta:', registerResponse);
          
          if (registerResponse.success && registerResponse.token) {
            // COSTRUISCI MANUALMENTE L'OGGETTO UTENTE CON I DATI DEL FORM
            const user: User = {
              id: registerResponse.user_id,
              email: userData.email, // Usa i dati del form, non della response
              name: userData.name,
              surname: userData.surname,
              role: 'user', // Default per nuovo utente
              subscription_plan: 'free', // Default
              credits: 0 // Default
            };
            
            console.log('Utente da salvare:', user);
            
            // Salva token e dati utente
            localStorage.setItem(this.tokenKey, registerResponse.token);
            localStorage.setItem('user_data', JSON.stringify(user));
            this.userSubject.next(user);
            
            observer.next({ 
              success: true,
              message: 'Registrazione completata con successo',
              user_id: registerResponse.user_id,
              token: registerResponse.token,
              user: user // Includi l'utente nella response
            });
          } else {
            observer.error({
              success: false,
              error: 'Registrazione fallita: risposta non valida',
              originalError: registerResponse
            });
          }
          
          observer.complete();
        },
        error: (registerError) => {
          console.error('Errore registrazione:', registerError);
          
          let errorMessage = 'Errore durante la registrazione';
          
          if (registerError.error) {
            if (registerError.error.error) {
              if (typeof registerError.error.error === 'object') {
                const validationErrors = Object.values(registerError.error.error).join(', ');
                errorMessage = `Errore validazione: ${validationErrors}`;
              } else {
                errorMessage = registerError.error.error;
              }
            } else if (registerError.error.message) {
              errorMessage = registerError.error.message;
            }
          } else if (registerError.status === 400) {
            errorMessage = 'Dati non validi. Controlla i campi inseriti.';
          } else if (registerError.status === 500) {
            errorMessage = 'Errore del server. Riprova più tardi.';
          }
          
          observer.error({
            success: false,
            error: errorMessage,
            originalError: registerError
          });
        },
      });
    });
  }

  /**
   * Logout dell'utente
   */
  logout(): Observable<any> {
    if (this.isAuthenticated()) {
      return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
        tap(() => {
          this.clearLocalData();
        }),
        catchError((error) => {
          console.warn('Logout server fallito, pulisco solo localStorage:', error);
          this.clearLocalData();
          return new Observable((observer) => {
            observer.next({ success: true, message: 'Logout locale completato' });
            observer.complete();
          });
        })
      );
    } else {
      this.clearLocalData();
      return new Observable((observer) => {
        observer.next({ success: true, message: 'Logout locale completato' });
        observer.complete();
      });
    }
  }

  /**
   * Pulisce i dati locali
   */
  private clearLocalData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user_data');
    this.userSubject.next(null);
    this.router.navigate(['/']);
  }

  /**
   * Ottiene i dati dell'utente corrente dal server
   */
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/me`).pipe(
      tap((response: any) => {
        console.log('getCurrentUser response:', response);
        if (response.success && response.user) {
          const user: User = {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            surname: response.user.surname,
            role: response.user.role,
            subscription_plan: response.user.subscription_plan,
            credits: response.user.credits
          };
          
          this.userSubject.next(user);
          localStorage.setItem('user_data', JSON.stringify(user));
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Ottiene il token JWT dal localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Verifica se l'utente è autenticato
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Ottiene il ruolo dell'utente corrente
   */
  getUserRole(): string | null {
    return this.userSubject.value?.role || null;
  }

  /**
   * Ottiene i crediti dell'utente corrente
   */
  getUserCredits(): number {
    return this.userSubject.value?.credits || 0;
  }

  /**
   * Ottiene il nome completo dell'utente
   */
  getUserFullName(): string {
    const user = this.userSubject.value;
    return user ? `${user.name} ${user.surname}` : '';
  }

  /**
   * Rinnova il token JWT
   */
  refreshToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/refresh`, {}).pipe(
      tap((response: any) => {
        if (response.success && response.token) {
          localStorage.setItem(this.tokenKey, response.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Restituisce una data di nascita di default
   */
  private getDefaultBirthDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date.toISOString().split('T')[0];
  }

  /**
   * Carica i dati dell'utente dal localStorage all'avvio
   */
  private loadUserFromStorage() {
    const token = this.getToken();
    const savedUser = localStorage.getItem('user_data');
    
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser) as User;
        console.log('Utente caricato da localStorage:', user);
        this.userSubject.next(user);
      } catch (e) {
        console.error('Errore nel parsing dei dati utente salvati', e);
        this.clearLocalData();
      }
    } else if (token) {
      // C'è un token ma non i dati utente, prova a recuperarli
      this.getCurrentUser().subscribe({
        error: () => {
          this.clearLocalData();
        }
      });
    }
  }

  /**
   * Gestione errori centralizzata
   */
  private handleError(error: any): Observable<never> {
    console.error('AuthService error:', error);
    
    let errorMessage = 'Errore sconosciuto';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Errore: ${error.error.message}`;
    } else if (error.status === 401) {
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else {
        errorMessage = 'Email o password non validi';
      }
    } else if (error.error && error.error.error) {
      if (typeof error.error.error === 'object') {
        const messages = Object.values(error.error.error).join(', ');
        errorMessage = `Errore validazione: ${messages}`;
      } else {
        errorMessage = error.error.error;
      }
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.status === 400) {
      errorMessage = 'Dati non validi. Controlla i campi inseriti.';
    } else if (error.status) {
      errorMessage = `Errore ${error.status}: ${error.statusText}`;
    }
    
    return throwError(() => ({
      success: false,
      error: errorMessage,
      status: error.status,
      originalError: error
    }));
  }
}