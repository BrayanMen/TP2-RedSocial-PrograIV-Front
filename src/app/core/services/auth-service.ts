import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IUser } from '../interfaces/user.interface';
import { catchError, finalize, map, Observable, Subscription, tap, throwError, timer } from 'rxjs';
import { ILoginRequest } from '../interfaces/login-request.interface';
import { IAuthResponse } from '../interfaces/auth.interface';
import { IRegisterRequest } from '../interfaces/register-request.interface';
import { ApiService } from './api-service';
import { LoadingService } from './loading-service';
import { ModalService } from './modal-service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authUrl = `auth/`;
  private readonly userUrl = `users/`;

  currentUser = signal<IUser | null>(null);
  isAuthenticated = signal<boolean>(false);

  private sessionTimer?: Subscription;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private modalService: ModalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkAuth();
    }
  }

  login(credentials: ILoginRequest): Observable<IAuthResponse> {
    this.loadingService.show();

    return this.apiService.post<IAuthResponse>(`${this.authUrl}login`, credentials).pipe(
      map((res) => res.data),
      tap((data) => {
        this.handleAuthSuccess(data);
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }

  register(user: IRegisterRequest, profileImage: File | null): Observable<IAuthResponse> {
    this.loadingService.show();
    const formData = new FormData();

    Object.entries(user).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (profileImage) {
      formData.append('profileImage', profileImage, profileImage.name);
    }

    return this.apiService.post<IAuthResponse>(`${this.authUrl}register`, formData).pipe(
      map((res) => res.data),
      catchError((error) => {
        const errorMessage = error?.error?.message || error.message || 'Error desconocido';
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }

  logout(): void {
    this.loadingService.show();
    this.apiService.post(`${this.authUrl}logout`, {}).pipe(
      finalize(() => {
        this.loadingService.hide();
        this.clearSessionAndRedirect();
      })
    );
  }

  private clearSessionAndRedirect(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<IAuthResponse> {
    return this.apiService.post<IAuthResponse>(`${this.authUrl}refresh`, {}).pipe(
      map((res) => res.data),
      tap((data) => {
        this.startSessionTimer(data.expiresIn);
      })
    );
  }

  private handleAuthSuccess(authResponse: IAuthResponse): void {
    if (authResponse.token && authResponse.user) {
      // No necesitamos, el navegador ya guardó la cookie
      this.currentUser.set(authResponse.user);
      this.isAuthenticated.set(true);
      this.startSessionTimer(authResponse.expiresIn);
      this.router.navigate(['/feed']);
    }
  }

  private checkAuth(): void {
    this.apiService
      .get<IUser>(`${this.userUrl}profile`)
      .pipe(map((res) => res.data))
      .subscribe({
        next: (user) => {
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
          this.startSessionTimer(15 * 60);
        },
        error: () => {
          this.clearSession;
        },
      });
  }

  private startSessionTimer(expiresInSeconds: number): void {
    if (this.sessionTimer) {
      this.sessionTimer.unsubscribe();
    }
    // El TP pide 10 minutos (600s)
    const warningTimeMs = 10 * 60 * 1000;
    // Asegurarnos de no poner un timer negativo si la expiración es menor
    const expiresInMs = expiresInSeconds * 1000;
    if (warningTimeMs > expiresInMs) {
      console.warn('El tiempo de advertencia es mayor que el de expiración.');
      return;
    }

    this.sessionTimer = timer(warningTimeMs).subscribe(() => {
      // this.showSessionWarning();
      console.log('El tiempo expiro');
    });
  }

  // private showSessionWarning(): void {
  //   this.modalService.show({
  //     title: 'Sesión por Expirar',
  //     message: 'Tu sesión expirará en 5 minutos. ¿Deseas extenderla?',
  //     type: 'warning',
  //     confirmText: 'Extender',
  //     cancelText: 'Salir',
  //     onConfirm: () => {
  //       this.refreshToken().subscribe({
  //         next: () => {
  //           this.modalService.show({
  //             title: '¡Sesión Extendida!',
  //             message: 'Tu sesión ha sido renovada.',
  //             type: 'success',
  //           });
  //         },
  //         error: () => this.logout(),
  //       });
  //     },
  //     onCancel: () => {
  //       this.logout();
  //     },
  //   });
  // }

  private clearSession(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);

    if (this.sessionTimer) {
      this.sessionTimer.unsubscribe();
      this.sessionTimer = undefined;
    }
  }

  getCurrentUser(): IUser | null {
    return this.currentUser();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }
}
