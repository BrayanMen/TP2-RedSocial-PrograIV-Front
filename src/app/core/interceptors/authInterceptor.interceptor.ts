import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);
const authUrl = 'auth/';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector)
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
      const authService = injector.get(AuthService)
      const isAuthRoute =
        req.url.includes(`${authUrl}login`) ||
        req.url.includes(`${authUrl}register`) ||
        req.url.includes(`${authUrl}refresh`) ||
        req.url.includes(`${authUrl}logout`);
      // Si el error es 401 y no estamos en la ruta de refresh
      if (error.status === 401 && !isAuthRoute) {
        if (isRefreshing) {
          // CASO B: Ya se está refrescando. Esperamos.
          // CÓMO: Nos suscribimos al subject y esperamos a que tenga un valor (el nuevo token o señal de listo)
          return refreshTokenSubject.pipe(
            filter((token) => token !== null), // Esperar hasta que no sea null
            take(1), // Tomar solo el primer valor y completarse
            switchMap(() => next(reqWithCredentials)) // Reintentar la petición original
          );
        } else {
          // CASO A: Somos los primeros. Iniciamos el refresco.
          isRefreshing = true;
          refreshTokenSubject.next(null); // Bloquear a los demás

          return authService.refreshToken().pipe(
            switchMap((response) => {
              isRefreshing = false;
              refreshTokenSubject.next('done'); // Desbloquear la cola
              return next(reqWithCredentials); // Reintentar petición original
            }),
            catchError((refreshError) => {
              // Si falla el refresh, game over.
              isRefreshing = false;
              authService.logout(); // Cierra sesión forzadamente
              // router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        }
      }
      // Si es 401 se envia el error
      return throwError(() => error);
    })
  );
};
