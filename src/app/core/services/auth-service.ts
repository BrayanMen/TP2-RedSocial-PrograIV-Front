import {  Injectable,  signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { IUser } from "../interfaces/user.interface";
import { BehaviorSubject, catchError, Observable, tap, throwError, timer } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { TokenService } from "./token-service";
import { ILoginRequest } from "../interfaces/login-request.interface";
import { IApiResponse } from "../interfaces/api-response-interface";
import { IAuthResponse } from "../interfaces/auth.interface";


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}auth`;
  
  // Signals para estado reactivo (Angular 20)
  currentUser = signal<IUser | null>(null);
  isAuthenticated = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  
  // Observable para compatibilidad
  private currentUserSubject = new BehaviorSubject<IUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private sessionTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,
  ) {
    this.checkAuth();
  }

  login(credentials: ILoginRequest): Observable<IApiResponse<IAuthResponse>> {
    this.isLoading.set(true);
    
    return this.http.post<IApiResponse<IAuthResponse>>(
      `${this.apiUrl}/login`,
      credentials,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.handleAuthSuccess(response.data);
      }),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .subscribe({
        complete: () => {
          this.clearSession();
          this.router.navigate(['/login']);
        },
        error: () => {
          this.clearSession();
          this.router.navigate(['/login']);
        }
      });
  }

  refreshToken(): Observable<IApiResponse<IAuthResponse>> {
    return this.http.post<IApiResponse<IAuthResponse>>(
      `${this.apiUrl}/auth/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.data.token && response.data.refreshToken) {
          this.tokenService.saveTokens(
            response.data.token,
            response.data.refreshToken,
            response.data.expiresIn
          );
          this.startSessionTimer(response.data.expiresIn);
        }
      })
    );
  }

  authorize(): Observable<any> {
    const token = this.tokenService.getToken();
    return this.http.post(
      `${this.apiUrl}/authorize`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      }
    ).pipe(
      tap((response: any) => {
        if (response.valid && response.user) {
          this.isAuthenticated.set(true);
        }
      }),
      catchError(error => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  private handleAuthSuccess(authResponse: IAuthResponse): void {
    if (authResponse.token && authResponse.refreshToken && authResponse.user) {
      this.tokenService.saveTokens(
        authResponse.token,
        authResponse.refreshToken,
        authResponse.expiresIn
      );

      this.currentUser.set(authResponse.user);
      this.currentUserSubject.next(authResponse.user);
      this.isAuthenticated.set(true);
      this.isLoading.set(false);

      this.startSessionTimer(authResponse.expiresIn);
      this.router.navigate(['/feed']);
    }
  }

  private startSessionTimer(expiresIn: number): void {
    if (this.sessionTimer) {
      this.sessionTimer.unsubscribe();
    }

    // 10 minutos antes de expirar, mostrar advertencia
    const warningTime = (expiresIn - 300) * 1000; // 5 minutos antes
    
    this.sessionTimer = timer(warningTime).subscribe(() => {
      this.showSessionWarning();
    });
  }

  private showSessionWarning(): void {
    const shouldRefresh = confirm(
      'Tu sesión está por expirar en 5 minutos. ¿Deseas extender tu sesión?'
    );

    if (shouldRefresh) {
      this.refreshToken().subscribe({
        next: () => console.log('Sesión extendida'),
        error: () => this.logout()
      });
    }
  }

  private checkAuth(): void {
    const token = this.tokenService.getToken();
    
    if (token && !this.tokenService.isTokenExpired()) {
      this.authorize().subscribe({
        next: (response: any) => {
          if (response.user) {
            this.currentUser.set(response.user);
            this.currentUserSubject.next(response.user);
            this.isAuthenticated.set(true);
          }
        },
        error: () => {
          this.clearSession();
        }
      });
    } else {
      this.clearSession();
    }
  }

  private clearSession(): void {
    this.tokenService.removeTokens();
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    
    if (this.sessionTimer) {
      this.sessionTimer.unsubscribe();
    }
  }

  getCurrentUser(): IUser | null {
    return this.currentUser();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }
}