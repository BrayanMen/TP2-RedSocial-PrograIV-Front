import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { publicGuard } from './core/guards/public-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((l) => l.Login),
    canActivate: [publicGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((r) => r.Register),
    canActivate: [publicGuard],
  },
  {
    path: 'feed',
    loadComponent: () => import('./features/home/feed/feed').then((f) => f.Feed),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/users/profile/profile').then((p) => p.Profile),
    canActivate: [authGuard],
  },
  {
    path: 'posts/:id',
    loadComponent: () =>
      import('./features/home/post-detail/post-detail').then((p) => p.PostDetail),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/users/admin/dashboard/dashboard').then((u) => u.Dashboard),
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/admin/user/user').then((u) => u.User),
      },
      {
        path: 'stats',
        loadComponent: () => import('./features/users/admin/stats/stats').then((s) => s.Stats),
      },
    ],
  },
];


