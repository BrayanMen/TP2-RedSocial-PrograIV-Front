import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit{
  private authService = inject(AuthService);
  private router = inject(Router);
  isAdmin = signal<boolean>(false);
  logo = '/public/logo.png'
  
  ngOnInit(): void {
      this.authService.currentUser$.subscribe(user=>{
        if(user && user.role ==='admin'){
          this.isAdmin.set(true)
        }else{
          this.isAdmin.set(false)
        }
      })
  }
}
