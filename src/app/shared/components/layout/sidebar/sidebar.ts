import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth-service';
import { IUser, UserRole } from '../../../../core/interfaces/user.interface';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  user = signal<IUser | null>(null);
  constructor() {
    effect(() => {
      this.user.set(this.authService.currentUser());
    });
  }

  ngOnInit(): void {}

  isLogin = computed(() => !!this.user());
  isAdmin = computed(() => this.authService.isAdmin());
  userName = computed(() => this.user()?.username || this.user()?.firstName || '');
  userEmail = computed(() => this.user()?.email || '');
  userImage = computed(() => this.user()?.profileImage || '');
  userMartialArts= computed(()=>this.user()?.martialArts?.map(m=>m.martialArt))
}
