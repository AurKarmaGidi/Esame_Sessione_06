import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      console.log('Accesso negato: devi essere loggato');
      this.router.navigate(['/']);
      return false;
    }

    // Se la rotta richiede un ruolo specifico
    const requiredRole = route.data['role'];
    if (requiredRole) {
      const userRole = this.authService.getUserRole();
      
      if (userRole !== requiredRole) {
        console.log('Accesso negato: ruolo non autorizzato');
        this.router.navigate(['/']);
        return false;
      }
    }

    return true;
  }
}