import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth';

/**
 * Interfaccia per la risposta del pagamento
 */
export interface PaymentResponse {
  success: boolean;
  message?: string;
  amount_added?: number;
  new_balance?: number;
  payment_method_id?: number;
  transaction_id?: string;
  error?: string;
}

/**
 * Interfaccia per la richiesta di pagamento
 */
export interface PaymentRequest {
  amount: number;
  payment_method_id: string;
  type?: 'credit_card' | 'paypal';
}

/**
 * Servizio per interagire con le API relative ai pagamenti e crediti.
 * Gestisce l'acquisto di crediti, il saldo e i metodi di pagamento.
 */
@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = '/api/v1/payment';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  /**
   * Aggiunge crediti all'account dell'utente.
   *
   * @param paymentData - Dati del pagamento (amount, payment_method_id, type)
   * @returns Observable con risposta del server
   */
  addCredits(paymentData: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/add-credits`, paymentData).pipe(
      tap((response) => {
        console.log('Pagamento completato:', response);

        // Se il pagamento è andato a buon fine, aggiorna i crediti locali
        if (response.success && response.new_balance !== undefined) {
          this.authService.getCurrentUser().subscribe(); // Ricarica i dati utente
        }
      }),
      catchError(this.handleError),
    );
  }

  /**
   * Recupera il saldo crediti dell'utente.
   *
   * @returns Observable con il saldo corrente
   */
  getBalance(): Observable<{ success: boolean; current_balance: number; error?: string }> {
    return this.http
      .get<{ success: boolean; current_balance: number; error?: string }>(`${this.apiUrl}/balance`)
      .pipe(
        tap((response) => console.log('Saldo crediti:', response)),
        catchError(this.handleError),
      );
  }

  /**
   * Recupera i metodi di pagamento salvati dell'utente.
   *
   * @returns Observable con lista metodi di pagamento
   */
  getPaymentMethods(): Observable<{ success: boolean; payment_methods: any[]; error?: string }> {
    return this.http
      .get<{ success: boolean; payment_methods: any[]; error?: string }>(`${this.apiUrl}/methods`)
      .pipe(
        tap((response) => console.log('Metodi di pagamento:', response)),
        catchError(this.handleError),
      );
  }

  /**
   * Aggiunge un nuovo metodo di pagamento.
   *
   * @param methodData - Dati del metodo di pagamento
   * @returns Observable con risposta
   */
  addPaymentMethod(methodData: {
    type: string;
    details: any;
    is_default?: boolean;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/methods`, methodData).pipe(
      tap((response) => console.log('Metodo di pagamento aggiunto:', response)),
      catchError(this.handleError),
    );
  }

  /**
   * Imposta un metodo di pagamento come predefinito.
   *
   * @param methodId - ID del metodo di pagamento
   * @returns Observable con risposta
   */
  setDefaultPaymentMethod(methodId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/methods/${methodId}/default`, {}).pipe(
      tap((response) => console.log(`Metodo ${methodId} impostato come predefinito:`, response)),
      catchError(this.handleError),
    );
  }

  /**
   * Elimina un metodo di pagamento.
   *
   * @param methodId - ID del metodo di pagamento
   * @returns Observable con risposta
   */
  deletePaymentMethod(methodId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/methods/${methodId}`).pipe(
      tap((response) => console.log(`Metodo ${methodId} eliminato:`, response)),
      catchError(this.handleError),
    );
  }

  /**
   * Verifica se un pagamento è valido (per carte di credito simulate).
   *
   * @param cardData - Dati della carta
   * @returns true se valido, altrimenti false
   */
  validateCard(cardData: { number: string; expiry: string; cvv: string; name: string }): boolean {
    // Validazione base lato client
    const cardNumber = cardData.number.replace(/\s/g, '');

    // Controllo lunghezza carta (16 cifre)
    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
      return false;
    }

    // Controllo expiry (MM/YY)
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(cardData.expiry)) {
      return false;
    }

    // Controllo CVV (3 cifre)
    if (!/^\d{3}$/.test(cardData.cvv)) {
      return false;
    }

    // Controllo nome non vuoto
    if (!cardData.name.trim()) {
      return false;
    }

    return true;
  }

  /**
   * Genera un ID fittizio per metodo di pagamento.
   *
   * @returns ID fittizio
   */
  generateMockPaymentMethodId(): string {
    return (
      'pm_' +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Gestione centralizzata degli errori
   *
   * @param error - Errore ricevuto
   * @returns Observable con errore formattato
   */
  private handleError(error: any): Observable<never> {
    console.error('PaymentService error:', error);

    let errorMessage = 'Errore sconosciuto';

    if (error.error instanceof ErrorEvent) {
      // Errore client-side
      errorMessage = `Errore: ${error.error.message}`;
    } else if (error.error && error.error.error) {
      // Errore dal backend con campo 'error'
      errorMessage = error.error.error;
    } else if (error.error && error.error.message) {
      // Errore dal backend con campo 'message'
      errorMessage = error.error.message;
    } else if (error.status) {
      errorMessage = `Errore ${error.status}: ${error.statusText}`;

      if (error.status === 400) {
        errorMessage = 'Dati di pagamento non validi';
      } else if (error.status === 401) {
        errorMessage = 'Sessione scaduta. Effettua nuovamente il login.';
      } else if (error.status === 402) {
        errorMessage = 'Pagamento rifiutato. Verifica i dati della carta.';
      } else if (error.status === 403) {
        errorMessage = 'Operazione non autorizzata';
      } else if (error.status >= 500) {
        errorMessage = 'Errore del server. Riprova più tardi.';
      }
    }

    return throwError(() => ({
      success: false,
      error: errorMessage,
      status: error.status,
      originalError: error,
    }));
  }
}
