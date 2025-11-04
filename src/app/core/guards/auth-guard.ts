import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && (state.url === '/login' || state.url === '/register')) {
    router.navigate(['/feed']);
  }

  if (!authService.isAuthenticated() && state.url !== '/login' && state.url !== '/register') {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  return true;
};
