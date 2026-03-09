import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/home/home').then(m => m.Home)
  },
  { 
    path: 'registrazione', 
    loadComponent: () => import('./components/registration/registration').then(m => m.Registration)
  },
  { 
    path: 'purchase-tokens', 
    loadComponent: () => import('./components/purchase-tokens/purchase-tokens').then(m => m.PurchaseTokens),
    canActivate: [AuthGuard]
  },
  { 
    path: 'account', 
    loadComponent: () => import('./components/account/account').then(m => m.Account),
    canActivate: [AuthGuard]
  },
  { 
    path: 'movie/:id', 
    loadComponent: () => import('./components/movie-detail/movie-detail').then(m => m.MovieDetail)
  },
  { 
    path: 'serie/:id', 
    loadComponent: () => import('./components/series-detail/series-detail').then(m => m.SeriesDetail)
  },
  { 
    path: 'movies', 
    loadComponent: () => import('./components/movies-list/movies-list').then(m => m.MoviesList),
    canActivate: [AuthGuard]
  },
  { 
    path: 'series', 
    loadComponent: () => import('./components/series-list/series-list').then(m => m.SeriesList),
    canActivate: [AuthGuard]
  },
  { 
    path: 'category/:genre', 
    loadComponent: () => import('./components/category-page/category-page').then(m => m.CategoryPage),
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./components/admin/admin').then(m => m.Admin),
    canActivate: [AuthGuard],
    data: { role: 'admin' }
  }
];