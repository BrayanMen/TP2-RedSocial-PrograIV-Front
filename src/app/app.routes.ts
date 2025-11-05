import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((l) => l.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((r) => r.Register),
  },
  {
    path: 'feed',
    loadComponent: () => import('./features/home/feed/feed').then((f) => f.Feed),
  },
];
