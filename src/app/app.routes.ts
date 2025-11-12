import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { publicGuard } from './core/guards/public-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((l) => l.Login),
    canActivate:[publicGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((r) => r.Register),
    canActivate:[publicGuard]

  },
  {
    path: 'feed',
    loadComponent: () => import('./features/home/feed/feed').then((f) => f.Feed),
    canActivate:[authGuard]

  },
  {
    path: 'profile',
    loadComponent: () => import('./features/users/profile/profile').then((p) => p.Profile),
    canActivate:[authGuard]

  },
];
