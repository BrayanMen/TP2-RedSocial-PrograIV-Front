import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLogin = signal<boolean>(false);
  showMenu = signal<boolean>(false);
  showDropDown = signal<boolean>(false);
  name = signal<string>('');
  email = signal<string>('');

  private userSub?: Subscription;

  ngOnInit(): void {
    this.initUser();

    this.userSub = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.handlerUserData(user);
      } else {
        this.clearUserData();
      }
    });
  }
  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }

  private initUser() {
    const userData = this.authService.getCurrentUser();
    if (userData) {
      this.handlerUserData(userData);
    } else {
      const userActual = this.authService.currentUser$.subscribe();
      if (userActual) {
        this.handlerUserData(userActual);
      } else {
        this.clearUserData();
      }
    }
  }

  private handlerUserData(user: any): void {
    this.isLogin.set(true);
    this.name.set(user.firstName || user.username || '');
    this.email.set(user.email || '');
  }

  private clearUserData(): void {
    this.isLogin.set(false);
    this.name.set('');
    this.email.set('');
    this.showMenu.set(false);
    this.showDropDown.set(false);
  }

  navigateRoute(route: string): void {
    this.router.navigate([route]);
  }

  activeRoute(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('.nav-container')) {
      this.showMenu.set(false);
      this.showDropDown.set(false);
    }
  }

  @HostListener('window:resize', [])
  onResize() {
    if (window.innerWidth > 1000) {
      this.showMenu.set(false);
    }
  }
}
