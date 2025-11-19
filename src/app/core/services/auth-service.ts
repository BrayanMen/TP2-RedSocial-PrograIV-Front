import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { IUser } from '../interfaces/user.interface';
import {
  catchError,
  finalize,
  firstValueFrom,
  lastValueFrom,
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

  private authCheckCompleted = signal<boolean>(false);

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
      this.initializeAuth();
      console.log(this.checkAuth())
    }
  }

  private async initializeAuth(): Promise<void> {
    try {
      await this.checkAuth();
    } catch (error) {
      console.error('Error al verificar autenticación inicial:', error);
    } finally {
      this.authCheckCompleted.set(true);
    }
  }

  async waitForAuthCheck(): Promise<void> {
    if (this.authCheckCompleted()) {
      return Promise.resolve();
    }

    // Esperar hasta que authCheckCompleted sea true
    return new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.authCheckCompleted()) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);

      // Timeout de seguridad (1 segundos)
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 1000);
    });
  }

  login(credentials: ILoginRequest): Observable<IAuthResponse> {
    this.loadingService.show();

    return this.apiService.post<IAuthResponse>(`${this.authUrl}login`, credentials).pipe(
      map((res) => res.data),
      tap((data) => {
        this.handleAuthSuccess(data);
      }),
      catchError((error) => {
        const errorMessage = error?.error.error || error.message || 'Error en el inicio de sesión';

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
        const errorMessage = error?.error?.error || error.message || 'Error en el registro';
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }

  async logout(): Promise<void> {
    const confirmLogout = await this.onModalConfirm(
      '¿Seguro quieres cerrar sesion?',
      'Cerrar Sesión',
      'Cerrando sesión...',
      'Mantiene la sesión.'
    );
    if (!confirmLogout) {
      return;
    }
    this.loadingService.show();

    try {
      await lastValueFrom(this.apiService.post(`${this.authUrl}logout`, {}));
    } catch (err) {
      console.error('Error en logout backend', err);
    } finally {
      this.clearSessionAndRedirect(); // Esto actualiza el Signal -> El Navbar reacciona.
      this.loadingService.hide();
    }
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

    return this.apiService.put<IUser>(`${this.userUrl}profile`, formData).pipe(
      //Chequear ruta
      map((res) => res.data),
      tap((data) => {
        this.currentUser.set(data);
      }),
      catchError((error) => {
        const errorMessage =
          error?.error?.message || error.message || 'Error al actualizar el perfil';
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

  private async checkAuth(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.apiService.get<IUser>(`${this.userUrl}profile`).pipe(
          map((res) => res.data),
          catchError((error) => {
            this.clearSession();
            throw error;
          })
        )
      );

      this.currentUser.set(response);
      this.isAuthenticated.set(true);
      this.startSessionTimer(15 * 60);
    } catch (error) {
      this.clearSession();
      throw error;
    }
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
