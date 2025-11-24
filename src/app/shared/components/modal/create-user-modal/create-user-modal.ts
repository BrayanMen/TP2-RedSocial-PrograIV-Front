import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AnalyticsService } from '../../../../core/services/analytics-service';
import { LoadingService } from '../../../../core/services/loading-service';
import { Router, RouterLink } from '@angular/router';
import { UserRole } from '../../../../core/interfaces/user.interface';
import { ModalService } from '../../../../core/services/modal-service';

@Component({
  selector: 'app-create-user-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-user-modal.html',
  styleUrl: './create-user-modal.css',
})
export class CreateUserModal {
  private fb = inject(FormBuilder);
  private analyticsService = inject(AnalyticsService);
  private loadingService = inject(LoadingService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  @Output() close = new EventEmitter<void>();
  @Output() userCreated = new EventEmitter<void>();

  registerForm: FormGroup;
  roles = Object.values(UserRole);
  showPassword = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  currentStep = signal<number>(1);

  constructor() {
    this.registerForm = this.fb.group({
      paso1: this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
      }),
      paso2: this.fb.group({
        email: new FormControl('', [Validators.required, Validators.email]),
        username: ['', [Validators.required, Validators.minLength(4)]],
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
        ]),
      }),
      paso3: this.fb.group({
        role: [UserRole.USER, Validators.required],
        birthDate: [''],
      }),
    });
  }
  get paso1() {
    return this.registerForm.get('paso1') as FormGroup;
  }
  get paso2() {
    return this.registerForm.get('paso2') as FormGroup;
  }
  get paso3() {
    return this.registerForm.get('paso3') as FormGroup;
  }

  nextStep(): void {
    if (this.currentStep() === 1 && this.paso1.valid) {
      this.currentStep.set(2);
    } else if (this.currentStep() === 2 && this.paso2.valid) {
      this.currentStep.set(3);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((val) => val - 1);
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const { paso1, paso2, paso3 } = this.registerForm.value;
      const registerData = {
        ...paso1,
        ...paso2,
        ...paso3,
      };

      this.analyticsService.createUser(registerData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.userCreated.emit();
          this.close.emit();          
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(error || 'Error al crear el usuario');
          setTimeout(() => this.errorMessage.set(null), 5000);
        },
      });
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  hasError(fieldName: string, step: 'paso1' | 'paso2' | 'paso3'): boolean {
    const control = this.registerForm.get(step)?.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(fieldName: string, step: 'paso1' | 'paso2' | 'paso3'): string {
    const control = this.registerForm.get(step)?.get(fieldName);

    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }

    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }

    if (control.errors['email']) {
      return 'Por favor, introduce un email válido';
    }
    if (control.errors['pattern']) {
      return 'Debe tener al menos 8 caracteres, 1 mayúscula y 1 número';
    }
    if (fieldName === 'confirmPassword' && this.registerForm.errors?.['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }
    return 'Campo inválido';
  }
  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }
}
