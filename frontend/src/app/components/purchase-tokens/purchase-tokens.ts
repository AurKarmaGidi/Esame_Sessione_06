import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PaymentService, PaymentRequest } from '../../services/payment';

/**
 * Componente per lo step 3 della registrazione: acquisto token
 * Permette all'utente di acquistare crediti per vedere film e serie TV
 */
@Component({
  selector: 'app-purchase-tokens',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './purchase-tokens.html',
  styleUrls: ['./purchase-tokens.scss'],
})
export class PurchaseTokens implements OnInit {
  // Opzioni di acquisto predefinite
  tokenPackages = [
    { id: 1, credits: 10, price: 5.99, popular: false },
    { id: 2, credits: 25, price: 12.99, popular: true },
    { id: 3, credits: 50, price: 22.99, popular: false },
    { id: 4, credits: 100, price: 39.99, popular: false },
  ];

  selectedPackage: any = null; // Pacchetto selezionato
  paymentMethod: 'credit_card' | 'paypal' = 'credit_card'; // Metodo di pagamento (tipizzato)
  cardNumber: string = '';
  cardName: string = '';
  cardExpiry: string = '';
  cardCvv: string = '';

  isLoading = false;
  errorMessage: string = '';
  successMessage: string = '';
  purchaseComplete = false; // Flag per abilitare il bottone finale

  constructor(
    private authService: AuthService,
    private paymentService: PaymentService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Verifica che l'utente sia autenticato (dopo la registrazione)
    this.authService.user$.subscribe(user => {
      if (!user) {
        // Se non autenticato, reindirizza alla home
        this.router.navigate(['/']);
      } else {
        console.log('PurchaseTokens caricato per utente:', user.email);
      }
    });
  }

  /**
   * Seleziona un pacchetto di token
   * 
   * @param pkg - Pacchetto selezionato
   */
  selectPackage(pkg: any) {
    this.selectedPackage = pkg;
  }

  /**
   * Gestisce l'acquisto dei token
   */
  onPurchase() {
    if (!this.selectedPackage) {
      this.errorMessage = 'Seleziona un pacchetto di token';
      return;
    }

    // Validazione base dei campi carta
    if (!this.cardNumber || !this.cardName || !this.cardExpiry || !this.cardCvv) {
      this.errorMessage = 'Compila tutti i campi della carta di credito';
      return;
    }

    // Validazione formato carta usando il servizio
    const cardData = {
      number: this.cardNumber,
      expiry: this.cardExpiry,
      cvv: this.cardCvv,
      name: this.cardName
    };

    if (!this.paymentService.validateCard(cardData)) {
      this.errorMessage = 'Dati della carta non validi';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepara i dati per il pagamento - CON TIPO CORRETTO
    const paymentData: PaymentRequest = {
      amount: this.selectedPackage.credits,
      payment_method_id: this.paymentService.generateMockPaymentMethodId(), // ID fittizio
      type: this.paymentMethod // Ora è tipizzato correttamente
    };

    console.log('Elaborazione pagamento:', paymentData);

    // Chiamata al servizio di pagamento
    this.paymentService.addCredits(paymentData).subscribe({
      next: (response) => {
        console.log('Pagamento completato:', response);
        this.isLoading = false;
        
        if (response.success) {
          this.successMessage = 'Acquisto completato con successo!';
          this.purchaseComplete = true; // Abilita il pulsante per andare all'account

          // mostra messaggio di successo per qualche secondo
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        } else {
          this.errorMessage = response.error || 'Errore durante l\'acquisto';
        }
      },
      error: (error) => {
        console.error('Errore pagamento:', error);
        this.isLoading = false;
        this.errorMessage = error.error || 'Errore durante l\'acquisto. Riprova più tardi.';
      },
    });
  }

  /**
   * Naviga alla pagina account
   */
  goToAccount() {
    this.router.navigate(['/account']);
  }

  /**
   * Salta l'acquisto e vai direttamente all'account
   */
  skipPurchase() {
    this.router.navigate(['/account']);
  }

  /**
   * Formatta il numero di carta (aggiunge spazi ogni 4 cifre)
   */
  formatCardNumber() {
    let value = this.cardNumber.replace(/\s/g, '').replace(/[^0-9]/g, '');
    if (value.length > 16) value = value.substr(0, 16);

    // Aggiungi spazi ogni 4 cifre
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substr(i, 4));
    }
    this.cardNumber = parts.join(' ');
  }

  /**
   * Formatta la data di scadenza (MM/YY)
   */
  formatExpiry() {
    let value = this.cardExpiry.replace(/\//g, '').replace(/[^0-9]/g, '');
    if (value.length > 4) value = value.substr(0, 4);

    if (value.length >= 3) {
      this.cardExpiry = value.substr(0, 2) + '/' + value.substr(2, 2);
    } else {
      this.cardExpiry = value;
    }
  }

  /**
   * Calcola il prezzo totale formattato
   */
  getTotalPrice(): string {
    return this.selectedPackage ? this.selectedPackage.price.toFixed(2) : '0.00';
  }
}