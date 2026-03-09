import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe'; 
/**
 * Componente per la homepage.
 * Mostra una griglia di immagini e un form per l'inizio della registrazione.
 * Include anche il modal per il login.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home {
  email: string = ''; // Modello per il campo email nella sezione "Registrati"
  loginEmail: string = ''; // Modello per l'email nel modal di login
  loginPassword: string = ''; // Modello per la password nel modal di login

  constructor(private router: Router) {}

  /**
   * Gestisce il click sul pulsante "Registrati".
   * Se l'email è presente, naviga alla pagina di registrazione passando l'email come query param.
   */
  onRegister() {
    if (this.email) {
      this.router.navigate(['/registrazione'], { queryParams: { email: this.email } });
    }
  }

  /**
   * Gestisce il tentativo di login dal modal.
   */
  onLogin() {
    console.log('Login tentativo', this.loginEmail, this.loginPassword);
    // Chiudi il modal
    const modal = document.getElementById('modalAccedi');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      bootstrapModal?.hide();
    }
  }
}