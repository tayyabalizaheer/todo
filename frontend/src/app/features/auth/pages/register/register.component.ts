import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthFacade } from '../../services/auth.facade';
import { environment } from '../../../../../environments/environment';


function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const passwordConfirmation = control.get('password_confirmation');

  if (!password || !passwordConfirmation) {
    return null;
  }

  if (password.value !== passwordConfirmation.value) {
    passwordConfirmation.setErrors({ ...passwordConfirmation.errors, passwordMismatch: true });
    return { passwordMismatch: true };
  }

  if (passwordConfirmation.errors) {
    delete passwordConfirmation.errors['passwordMismatch'];
    if (Object.keys(passwordConfirmation.errors).length === 0) {
      passwordConfirmation.setErrors(null);
    }
  }

  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnDestroy {
  registerForm: FormGroup;
  private destroy$ = new Subject<void>();
  appName = environment.appName;

  // State observables
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  constructor(
    private fb: FormBuilder,
    private authFacade: AuthFacade,
    private router: Router
  ) {
    this.loading$ = this.authFacade.loading$;
    this.error$ = this.authFacade.error$;
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get passwordConfirmation() {
    return this.registerForm.get('password_confirmation');
  }


  shouldShowError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.formatFieldName(fieldName)} is required.`;
    }
    if (field.errors['email']) {
      return 'Please enter a valid email address.';
    }
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `${this.formatFieldName(fieldName)} must be at least ${minLength} characters.`;
    }
    if (field.errors['passwordMismatch']) {
      return 'Passwords do not match.';
    }

    return 'Invalid value.';
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      return;
    }

    this.authFacade.clearError();

    this.authFacade.register(this.registerForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Registration error:', err);
        }
      });
  }

  /**
   * Format field name for display
   */
  private formatFieldName(fieldName: string): string {
    if (fieldName === 'password_confirmation') {
      return 'Password confirmation';
    }
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }
}
