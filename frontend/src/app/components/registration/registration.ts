import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

/**
 * Interfaccia per tipizzare i dati del form di registrazione
 */
interface RegistrationData {
  name: string;
  surname: string;
  email: string;
  password: string;
  password2: string;
  birth_date: string;
  country_code: string;
  region: string;
  city: string;
  address: string;
  zip_code: string;
  telefono?: string;
  termsAccepted: boolean; // Per Termini e Condizioni (obbligatorio)
  marketingConsent: boolean; // Per comunicazioni marketing (opzionale)
}
/**
 * Componente per la pagina di registrazione.
 * Gestisce la validazione del form e l'invio dei dati al backend.
 * Dopo la registrazione, reindirizza alla pagina di acquisto token.
 */
@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registration.html',
  styleUrls: ['./registration.scss'],
})
export class Registration {
  // Modello dati del form
  formData: RegistrationData = {
    name: '',
    surname: '',
    email: '',
    password: '',
    password2: '',
    birth_date: '',
    country_code: '',
    region: '',
    city: '',
    address: '',
    zip_code: '',
    telefono: '',
    termsAccepted: false,
    marketingConsent: false,
  };

  // Modelli per il modal di login (opzionale)
  loginEmail: string = '';
  loginPassword: string = '';

  isLoading = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Stato per la visibilità delle password (toggle occhio)
  passwordFields: { [key: string]: boolean } = {
    password: false,
    password2: false,
  };

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  /**
   * Mappa dei nomi delle nazioni ai codici ISO a due lettere
   */
  private countryCodeMap: { [key: string]: string } = {
    Italia: 'IT',
    Francia: 'FR',
    Germania: 'DE',
    Spagna: 'ES',
    'Regno Unito': 'GB',
    'Stati Uniti': 'US',
    Canada: 'CA',
    Australia: 'AU',
    Brasile: 'BR',
    Argentina: 'AR',
    Cina: 'CN',
    Giappone: 'JP',
    'Corea del Sud': 'KR',
    India: 'IN',
    Russia: 'RU',
    Sudafrica: 'ZA',
    Egitto: 'EG',
    Grecia: 'GR',
    Portogallo: 'PT',
    'Paesi Bassi': 'NL',
    Belgio: 'BE',
    Svizzera: 'CH',
    Austria: 'AT',
    Svezia: 'SE',
    Norvegia: 'NO',
    Danimarca: 'DK',
    Finlandia: 'FI',
    Polonia: 'PL',
    'Repubblica Ceca': 'CZ',
    Ungheria: 'HU',
    Croazia: 'HR',
    Turchia: 'TR',
    Israele: 'IL',
    'Emirati Arabi Uniti': 'AE',
    'Arabia Saudita': 'SA',
  };

  /**
   * Converte il nome della nazione selezionato nel form nel codice ISO a due lettere.
   *
   * @param nazione - Nome della nazione dal datalist
   * @returns Codice paese (default 'IT' se non trovato)
   */
  getCountryCode(nazione: string): string {
    if (!nazione || nazione.trim() === '') {
      return 'IT';
    }

    // Se è già un codice ISO di 2 lettere lo restituisce
    if (/^[A-Z]{2}$/.test(nazione.toUpperCase())) {
      return nazione.toUpperCase();
    }

    // Cerca nella mappa
    const found = Object.entries(this.countryCodeMap).find(
      ([key]) => key.toLowerCase() === nazione.toLowerCase(),
    );

    return found ? found[1] : 'IT';
  }

  /**
   * Gestisce l'invio del form di registrazione.
   */
  onSubmit() {
    // Validazione lato client
    if (this.formData.password !== this.formData.password2) {
      this.errorMessage = 'Le password non coincidono';
      return;
    }

    if (this.formData.password.length < 8) {
      this.errorMessage = 'La password deve contenere almeno 8 caratteri';
      return;
    }

    // Validazione campi obbligatori
    if (!this.formData.name?.trim()) {
      this.errorMessage = 'Il nome è obbligatorio';
      return;
    }

    if (!this.formData.surname?.trim()) {
      this.errorMessage = 'Il cognome è obbligatorio';
      return;
    }

    if (!this.formData.email?.trim()) {
      this.errorMessage = "L'email è obbligatoria";
      return;
    }

    if (!this.isValidEmail(this.formData.email)) {
      this.errorMessage = 'Inserisci un indirizzo email valido';
      return;
    }

    // VALIDAZIONE TERMINI
    if (!this.formData.termsAccepted) {
      this.errorMessage = 'Devi accettare i Termini e Condizioni';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Converte il nome della nazione in codice ISO
    const countryCode = this.getCountryCode(this.formData.country_code);

    // Prepara i dati per il backend
    const registrationData = {
      name: this.formData.name.trim(),
      surname: this.formData.surname.trim(),
      email: this.formData.email.trim().toLowerCase(),
      password: this.formData.password,
      birth_date: this.formData.birth_date || this.getDefaultBirthDate(),
      country_code: countryCode,
      region: this.formData.region.trim() || 'Lombardia',
      city: this.formData.city.trim() || 'Milano',
      address: this.formData.address.trim() || 'Via Default 1',
      zip_code: this.formData.zip_code.trim() || '20100',

      // INVIA ENTRAMBE LE PREFERENZE
      terms_accepted: this.formData.termsAccepted,
      marketing_consent: this.formData.marketingConsent,
    };

    console.log('Dati registrazione inviati:', registrationData);

    this.authService.registerAndLogin(registrationData).subscribe({
      next: (response) => {
        console.log('Registrazione completata:', response);
        this.isLoading = false;
        this.successMessage = 'Registrazione completata con successo! Reindirizzamento...';

        setTimeout(() => {
          this.router.navigate(['/purchase-tokens']);
        }, 1500);
      },
      error: (error) => {
        console.error('Errore durante il processo:', error);
        this.isLoading = false;
        this.errorMessage = error.message || 'Errore durante la registrazione. Riprova più tardi.';
      },
    });
  }

  /**
   * Validazione email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Restituisce una data di nascita di default per i test
   */
  private getDefaultBirthDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18); // 18 anni fa
    return date.toISOString().split('T')[0];
  }

  // ==================== METODI DI UTILITÀ PER LA VALIDAZIONE PASSWORD ====================

  /**
   * Verifica se la password contiene almeno una lettera minuscola
   */
  hasLowerCase(): boolean {
    return /[a-z]/.test(this.formData.password);
  }

  /**
   * Verifica se la password contiene almeno una lettera maiuscola
   */
  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.formData.password);
  }

  /**
   * Verifica se la password contiene almeno un numero
   */
  hasNumber(): boolean {
    return /\d/.test(this.formData.password);
  }

  /**
   * Verifica se la password contiene almeno un carattere speciale
   */
  hasSpecialChar(): boolean {
    return /[!@#$%^&*]/.test(this.formData.password);
  }

  /**
   * Verifica se la password ha almeno 8 caratteri
   */
  hasMinLength(): boolean {
    return this.formData.password.length >= 8;
  }

  /**
   * Verifica la forza complessiva della password
   */
  getPasswordStrength(): number {
    let strength = 0;
    if (this.hasLowerCase()) strength++;
    if (this.hasUpperCase()) strength++;
    if (this.hasNumber()) strength++;
    if (this.hasSpecialChar()) strength++;
    if (this.hasMinLength()) strength++;
    return strength;
  }

  /**
   * Restituisce il colore per l'icona di conferma password in base allo stato di match.
   *
   * @returns Codice colore esadecimale
   */
  getPasswordMatchColor(): string {
    if (!this.formData.password2) {
      return '#6c757d'; // Grigio se non ancora inserita
    }
    if (this.formData.password === this.formData.password2) {
      return '#28a745'; // Verde se coincidono
    }
    return '#dc3545'; // Rosso se non coincidono
  }

  /**
   * Toggle per mostrare/nascondere la password
   *
   * @param field - Nome del campo ('password' o 'password2')
   */
  togglePassword(field: string) {
    const input = document.getElementById(field) as HTMLInputElement;
    if (input) {
      input.type = this.passwordFields[field] ? 'password' : 'text';
      this.passwordFields[field] = !this.passwordFields[field];
    }
  }

  /**
   * Gestisce il tentativo di login dal modal
   */
  onLogin() {
    console.log('Tentativo login con:', this.loginEmail, this.loginPassword);
    // Implementazione login nel modal (opzionale)
  }
}
