import { Component, effect, HostListener, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth-service';
import { IUser } from '../../../../core/interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLogin = signal<boolean>(false);
  showMenu = signal<boolean>(false);
  showDropDown = signal<boolean>(false);
  name = signal<string>('');
  email = signal<string>('');

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.handlerUserData(user);
      } else {
        this.clearUserData();
      }
    });
  }

  async logout() {
    this.authService.logout();
  }

  private handlerUserData(user: IUser): void {
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
