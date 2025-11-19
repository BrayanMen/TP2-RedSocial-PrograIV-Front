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
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Navbar, Sidebar, Modal, Splash, Loading],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('social-network-tp2-front');
  showSplash = signal(true); // Controlamos la visibilidad con un Signal
  isLoading!: Observable<boolean>;

  constructor(private authService: AuthService, private loadService: LoadingService) {  
    this.isLoading = this.loadService.loading$;
    console.log('App iniciada - Estado autenticación:', this.authService.isAuthenticated());
    console.log('Usuario actual:', this.authService.currentUser());
  }

  handleSplashComplete() {
    this.showSplash.set(false); // Destruimos el splash cuando termina GSAP
  }
}
