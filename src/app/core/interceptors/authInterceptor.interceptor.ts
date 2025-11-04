import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { environment } from '../../../environments/environment';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const apiUrl = environment.apiUrl;
  //Si la peticion no va a la api pasa de largo
  if (!req.url.includes(apiUrl)) {
    return next(req);
  }
  //Clono la request para que se reconozcan las cookies en la conexion
  const reqWithCredentials = req.clone({
    withCredentials: true,
  });
  return next(reqWithCredentials).pipe(
    catchError((error) => {
      // Si el error es 401 y no estamos en la ruta de refresh
      if (error.status === 401 && !req.url.includes('auth/refresh')) {
        // Refrescamos el token
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Si el refreshToken funciona mandamos de nuevo la peticion inicial
            return next(reqWithCredentials);
          }),
          catchError((refreshError) => {
            // Si el refreshtoken falla o se vence hacemos el logout
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }
      // Si es 401 se envia el error
      return throwError(() => error);
    })
  );
};
