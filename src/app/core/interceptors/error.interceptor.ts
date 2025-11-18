import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error desconocido';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        if (error.status === 403) {
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
