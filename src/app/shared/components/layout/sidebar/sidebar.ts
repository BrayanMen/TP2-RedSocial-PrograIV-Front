import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth-service';
import { UserRole } from '../../../../core/interfaces/user.interface';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  isAdmin = signal<boolean>(false);
  logo = '/public/logo.png';

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      this.isAdmin.set(true);
    } else {
      this.isAdmin.set(false);
    }
  }
}
