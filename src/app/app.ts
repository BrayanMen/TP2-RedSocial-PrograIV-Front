import { Component, signal } from '@angular/core';
import { Navbar } from './shared/components/layout/navbar/navbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Sidebar } from './shared/components/layout/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { Loading } from './shared/components/loading/loading';
import { Modal } from './shared/components/modal/modal';
import { Splash } from './shared/components/splash/splash';
import { LoadingService } from './core/services/loading-service';
import { AuthService } from './core/services/auth-service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    Navbar,
    Sidebar,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('social-network-tp2-front');
  constructor(private authService: AuthService) {
    // Verificar estado de autenticación al iniciar
    console.log('App iniciada - Estado autenticación:', this.authService.isAuthenticated());
    console.log('Usuario actual:', this.authService.currentUser());
  }
}
