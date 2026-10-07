import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * ====================================================================================
 * LOGIN AUTHENTICATION COMPONENT
 * ====================================================================================
 * Modern login interface supporting Firebase Auth, demo quick-fill presets,
 * reactive form validations, and seamless role redirection.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card glass-card">
        <div class="auth-header">
          <div class="brand-badge-icon">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <h1 class="auth-title">Welcome to EduPortal</h1>
          <p class="auth-subtitle">Sign in to your academic account to continue</p>
        </div>

        <!-- Quick Demo Account Fillers for Testing -->
        <div class="demo-helpers">
          <span class="demo-label"><i class="fa-solid fa-bolt"></i> Quick Demo Fill:</span>
          <div class="demo-chips">
            <button type="button" class="chip chip-admin" (click)="fillCredentials('admin@eduportal.com', 'admin123')">
              Admin
            </button>
            <button type="button" class="chip chip-faculty" (click)="fillCredentials('arvind.sharma@eduportal.com', 'faculty123')">
              Faculty
            </button>
            <button type="button" class="chip chip-student" (click)="fillCredentials('rahul.sharma@eduportal.com', 'student123')">
              Student
            </button>
          </div>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
          <!-- Email field -->
          <div class="form-group">
            <label class="form-label" for="login-email">Email Address</label>
            <div class="input-with-icon">
              <i class="fa-regular fa-envelope input-icon"></i>
              <input 
                id="login-email" 
                type="email" 
                formControlName="email" 
                class="form-control" 
                placeholder="name@eduportal.com"
                [class.is-invalid]="f['email'].touched && f['email'].invalid" />
            </div>
            @if (f['email'].touched && f['email'].invalid) {
              <div class="invalid-feedback">
                @if (f['email'].errors?.['required']) { Please enter your email address. }
                @if (f['email'].errors?.['email']) { Please enter a valid email format. }
              </div>
            }
          </div>

          <!-- Password field -->
          <div class="form-group">
            <div class="field-label-row">
              <label class="form-label" for="login-password">Password</label>
              <a routerLink="/forgot-password" class="forgot-link">Forgot password?</a>
            </div>
            <div class="input-with-icon">
              <i class="fa-solid fa-lock input-icon"></i>
              <input 
                id="login-password" 
                [type]="showPassword() ? 'text' : 'password'" 
                formControlName="password" 
                class="form-control" 
                placeholder="Enter your password"
                [class.is-invalid]="f['password'].touched && f['password'].invalid" />
              <button 
                type="button" 
                class="toggle-pass-btn" 
                (click)="showPassword.set(!showPassword())"
                aria-label="Toggle password visibility">
                <i [class]="showPassword() ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
              </button>
            </div>
            @if (f['password'].touched && f['password'].invalid) {
              <div class="invalid-feedback">Password is required (minimum 6 characters).</div>
            }
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="gradient-btn submit-btn" 
            [disabled]="loginForm.invalid || isLoading()">
            @if (isLoading()) {
              <i class="fa-solid fa-spinner fa-spin"></i>
              <span>Authenticating...</span>
            } @else {
              <i class="fa-solid fa-arrow-right-to-bracket"></i>
              <span>Sign In to Portal</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account yet? <a routerLink="/register" class="register-link">Create Account</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - var(--header-height));
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: radial-gradient(circle at 50% 20%, rgba(124, 58, 237, 0.08) 0%, transparent 70%);
    }

    .auth-card {
      width: 100%;
      max-width: 460px;
      padding: 2.5rem 2rem;
      border-radius: var(--radius-lg);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .brand-badge-icon {
      width: 58px;
      height: 58px;
      margin: 0 auto 1rem;
      border-radius: 16px;
      background: var(--primary-gradient);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      box-shadow: 0 8px 24px var(--primary-glow);
    }

    .auth-title {
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }

    .auth-subtitle {
      font-size: 0.885rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .demo-helpers {
      background: var(--bg-hover);
      border: 1px dashed var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.75rem 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .demo-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .demo-chips {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .chip {
      padding: 0.3rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.775rem;
      font-weight: 700;
      border: 1px solid var(--border-color);
      background: var(--bg-surface);
      cursor: pointer;
      transition: var(--transition);
    }

    .chip-admin { color: #8b5cf6; border-color: rgba(139, 92, 246, 0.4); }
    .chip-faculty { color: #06b6d4; border-color: rgba(6, 182, 212, 0.4); }
    .chip-student { color: #10b981; border-color: rgba(16, 185, 129, 0.4); }

    .chip:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    .field-label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .forgot-link {
      font-size: 0.8rem;
      font-weight: 500;
    }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      color: var(--text-muted);
      pointer-events: none;
    }

    .input-with-icon .form-control {
      padding-left: 2.75rem;
      padding-right: 2.75rem;
    }

    .toggle-pass-btn {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.3rem;
      display: flex;
      align-items: center;
    }

    .submit-btn {
      width: 100%;
      margin-top: 0.5rem;
    }

    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: var(--text-secondary);
      border-top: 1px solid var(--border-color);
      padding-top: 1.25rem;
    }

    .register-link {
      font-weight: 700;
    }

    .seed-hint {
      margin-top: 0.85rem;
    }

    .btn-text-seed {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 0.775rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .btn-text-seed:hover {
      color: var(--primary);
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  public isLoading = signal<boolean>(false);
  public showPassword = signal<boolean>(false);

  public loginForm = this.fb.group({
    email: ['admin@eduportal.com', [Validators.required, Validators.email]],
    password: ['admin123', [Validators.required, Validators.minLength(6)]]
  });

  get f() {
    return this.loginForm.controls;
  }

  fillCredentials(email: string, pass: string): void {
    this.loginForm.patchValue({ email, password: pass });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { email, password } = this.loginForm.value;

    try {
      await this.auth.login(email!, password!);
    } catch (err: any) {
      this.toast.error(err.message || 'Invalid email or password.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
