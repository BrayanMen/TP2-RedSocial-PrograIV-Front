import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  registerForm: FormGroup;
  selectedFile = signal<File | null>(null);
  showPassword = signal<boolean>(false);
  errorMessage = signal<string | null>(null);


  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      
    })
  }

  ngOnInit(): void {}

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }
}
