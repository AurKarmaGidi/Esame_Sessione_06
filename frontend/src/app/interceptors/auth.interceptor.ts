import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = authService.getToken();
  
  // Clona la request e aggiungi l'header Authorization se c'è un token
  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn('Token non valido, effettua il login');
        
        // RIMUOVI IL TENTATIVO DI REFRESH
        // Basta fare logout e reindirizzare
        authService.logout().subscribe();
        router.navigate(['/']);
      }
      
      return throwError(() => error);
    })
  );
};