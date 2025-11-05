import { Component, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ImageCropperComponent],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  registerForm: FormGroup;
  selectedFile = signal<File | null>(null);
  showPassword = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  previewUrl = signal<string | ArrayBuffer | null>(null);
  currentStep = signal<number>(1);
  imageChangedEvent = signal<Event | null>(null);
  croppedImage = signal<string | null>(null);
  isSubmitting = signal<boolean>(false);

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      paso1: this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        birthDate: ['', [Validators.required]],
      }),
      paso2: this.fb.group(
        {
          email: new FormControl('', [Validators.required, Validators.email]),
          username: ['', [Validators.required, Validators.minLength(4)]],
          password: new FormControl('', [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
          ]),
          confirmPassword: new FormControl('', [Validators.required]),
        },
        { validators: this.passwordMatch }
      ),
      paso3: this.fb.group({
        bio: ['', [Validators.maxLength(500)]],
        profileImage: [null],
      }),
    });
  }

  ngOnInit(): void {}

  passwordMatch(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ noMatch: true });
      return { noMatch: true };
    } else {
      if (confirmPassword && confirmPassword.errors?.['noMatch']) {
        delete confirmPassword.errors['noMatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
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
  onFileSelected(event: Event): void {
    console.log('Archivo seleccionado:', event);
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      console.log('Archivo:', input.files[0]);
      this.imageChangedEvent.set(event); // Pasa el evento al cropper

      // Opcional: Mostrar vista previa temporal
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result);
      };
      reader.readAsDataURL(file);
    } // Pasa el evento al cropper
  }

  // 2. Se llama cada vez que el usuario mueve el recortador
  imageCropped(event: ImageCroppedEvent): void {
    console.log('Evento de recorte recibido:', event);

    // Manejar tanto blob como base64
    if (event.blob) {
      // Convertir blob a base64 para la vista previa
      const reader = new FileReader();
      reader.onload = () => {
        this.croppedImage.set(reader.result as string);
      };
      reader.readAsDataURL(event.blob);
    } else if (event.base64) {
      console.log('Imagen recortada: ', event.base64.length);
      this.croppedImage.set(event.base64);
    } else {
      console.log('No funciona mierda!!');
    }
  }

  // 3. Se llama al hacer clic en "Guardar Recorte"
  saveCroppedImage(): void {
    const base64Data = this.croppedImage();
    if (base64Data) {
      // Nombra el archivo
      const originalInput = this.imageChangedEvent()?.target as HTMLInputElement;
      const originalFileName = originalInput?.files?.[0]?.name || 'profile.png';

      // Extraer el nombre sin extensión
      const fileNameWithoutExt = originalFileName.split('.').slice(0, -1).join('.') || 'profile';

      // Convierte el base64 a un archivo 'File'
      try {
        const croppedFile = this.base64ToFile(base64Data, `${fileNameWithoutExt}_cropped.png`);

        this.selectedFile.set(croppedFile); // Guarda el archivo final
        this.previewUrl.set(base64Data); // Pone la imagen recortada en la vista previa
        this.imageChangedEvent.set(null); // Oculta el cropper
        this.croppedImage.set(null);

        console.log('Imagen recortada guardada:', croppedFile);
      } catch (error) {
        console.error('Error al guardar imagen recortada:', error);
        this.errorMessage.set('Error al procesar la imagen');
      }
    } else {
      console.error('No hay imagen recortada para guardar');
      this.errorMessage.set('No hay imagen recortada para guardar');
    }
  }

  // 4. Cancela el recorte
  cancelCrop(): void {
    this.imageChangedEvent.set(null);
    this.croppedImage.set(null);
  }

  // 5. Helper para convertir base64 a File
  private base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      throw new Error('Invalid base64 string');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.errorMessage.set(null);

      const { paso1, paso2, paso3 } = this.registerForm.value;
      const registerData = {
        ...paso1,
        ...paso2,
        ...paso3,
      };

      delete registerData.profileImage;

      this.authService.register(registerData, this.selectedFile()).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Error al registrar el usuario');
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
}
