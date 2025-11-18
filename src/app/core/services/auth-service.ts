import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { IUser } from '../interfaces/user.interface';
import {
  catchError,
  finalize,
  map,
  Observable,
  Subscription,
  take,
  tap,
  throwError,
  timer,
} from 'rxjs';
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
  private refreshModalShow = false;

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
        const errorMessage =
          error?.error?.message || error.message || 'Error en el inicio de sesión';
        return throwError(() => new Error(errorMessage));
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
      tap((data) => {
        this.handleAuthSuccess(data);
      }),
      catchError((error) => {
        const errorMessage = error?.error?.message || error.message || 'Error en el registro';
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }

  async logout(): Promise<void> {
    this.loadingService.show();

    const confirmLogout = await this.onModalConfirm(
      '¿Seguro quieres cerrar sesion?',
      'Cerrar Sesión',
      'Cerrando sesión...',
      'Mantiene la sesión.'
    );

    if (!confirmLogout) {
      this.loadingService.hide();
      this.checkAuth();
      return;
    }

    this.apiService
      .post(`${this.authUrl}logout`, {})
      .pipe(
        tap(() => {
          this.clearSessionAndRedirect();
        }),
        catchError((error) => {
          this.clearSessionAndRedirect();
          return throwError(() => error);
        }),
        finalize(() => {
          this.loadingService.hide();
        })
      )
      .subscribe();
  }

  updateProfile(user: IUser, profileImage: File | null): Observable<IUser> {
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

    return this.apiService.put<IUser>(`${this.userUrl}profile`, formData).pipe( //Chequear ruta
      map((res) => res.data),
      tap((data) => {
        this.currentUser.set(data);
      }),
      catchError((error) => {
        const errorMessage = error?.error?.message || error.message || 'Error al actualizar el perfil';
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }

  private clearSessionAndRedirect(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<IAuthResponse> {
    return this.apiService.post<IAuthResponse>(`${this.authUrl}refresh`, {}).pipe(
      tap((data) => {
        this.handleAuthSuccess(data.data);
        this.refreshModalShow = false;
      }),
      map((res) => res.data),
      catchError((error) => {
        this.performCleanLogout();
        return throwError(() => error);
      })
    );
  }

  private performCleanLogout(): void {
    this.apiService
      .post(`${this.authUrl}logout`, {})
      .pipe(
        take(1),
        finalize(() => {
          this.clearSessionAndRedirect();
        })
      )
      .subscribe({
        error: () => this.clearSessionAndRedirect(),
      });
  }

  private handleAuthSuccess(authResponse: IAuthResponse): void {
    if (authResponse.token && authResponse.user) {
      this.currentUser.set(authResponse.user);
      this.isAuthenticated.set(true);

      const expiresIn = authResponse.expiresIn || 15 * 60;
      this.startSessionTimer(expiresIn);

      const currentUrl = this.router.url;
      if (currentUrl === '/login' || currentUrl === '/register') {
        this.router.navigate(['/feed']);
      }
    }
  }

  private checkAuth(): void {
    this.apiService
      .get<IUser>(`${this.userUrl}profile`)
      .pipe(
        take(1),
        map((res) => res.data),
        catchError((error) => {
          this.clearSession();
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (user) => {
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
          this.startSessionTimer(15 * 60);
        },
        error: () => {
          this.clearSession();
        },
      });
  }

  private showRefreshTokenModal(): void {
    if (this.refreshModalShow) return;
    this.refreshModalShow = true;

    this.modalService.confirmModal(
      'Tu sesión está a punto de expirar. ¿Deseas extenderla?',
      'Extender Sesión',
      () => {
        this.refreshToken().subscribe({
          next: () => {
            this.modalService.successModal('Tu sesión ha sido extendida.', '¡Listo!');
          },
          error: () => {
            this.modalService.errorModal(
              'No se pudo extender tu sesión. Por favor, inicia sesión de nuevo.'
            );
            this.apiService
              .post(`${this.authUrl}logout`, {})
              .pipe(
                tap(() => {
                  this.clearSessionAndRedirect();
                }),
                catchError((error) => {
                  this.clearSessionAndRedirect();
                  return throwError(() => error);
                }),
                finalize(() => {
                  this.loadingService.hide();
                })
              )
              .subscribe();
            this.refreshModalShow = false;
          },
        });
      },
      () => {
        this.modalService.infoModal('Serás desconectado cuando tu sesión expire.', 'Aviso');
        this.refreshModalShow = false;
      }
    );
  }

  private startSessionTimer(expiresInSeconds: number): void {
    this.clearSessionTimer(); // Limpiar cualquier timer anterior

    const warningTime = Math.max(expiresInSeconds - 600, 60);

    this.sessionTimer = timer(warningTime * 1000).subscribe(() => {
      this.showRefreshTokenModal();
    });
  }

  private clearSessionTimer(): void {
    if (this.sessionTimer) {
      this.sessionTimer.unsubscribe();
      this.sessionTimer = undefined;
    }
    this.refreshModalShow = false;
  }

  private clearSession(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.clearSessionTimer();
  }

  getCurrentUser(): IUser | null {
    return this.currentUser();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  onModalConfirm(
    titleMsj: string,
    message: string,
    infoTrue: string,
    infoFalse: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.modalService.confirmModal(
        message,
        titleMsj,
        () => {
          this.modalService.infoModal(infoTrue);
          resolve(true); // Usuario confirmó
          this.checkAuth();
        },
        () => {
          this.modalService.infoModal(infoFalse);
          resolve(false); //  Usuario canceló
          this.checkAuth();
        }
      );
    });
  }
}
