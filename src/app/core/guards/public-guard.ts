import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';

export const publicGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  await authService.waitForAuthCheck();
  const isAuth = authService.isAuthenticated()

  if (isAuth) {
    return router.createUrlTree(['/feed']);
  }
  return true;
};
