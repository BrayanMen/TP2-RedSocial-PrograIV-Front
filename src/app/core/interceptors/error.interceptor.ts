import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error desconocido';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        if (error.status === 401) {
          authService.logout();
          router.navigate(['/login']);
          errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente.';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos para realizar esta acción.';
        } else if (error.status === 404) {
          errorMessage = 'Recurso no encontrado.';
        } else if (error.status === 500) {
          errorMessage = 'Error del servidor. Intenta nuevamente más tarde.';
        } else if (error.error?.error) {
          if (Array.isArray(error.error.error)) {
            errorMessage = error.error.error.join(', ');
          } else {
            errorMessage = error.error.error;
          }
        }
      }

      console.error('Error interceptado:', errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};