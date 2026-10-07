import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * ====================================================================================
 * FORGOT PASSWORD COMPONENT
 * ====================================================================================
 * Dispatches password reset emails via Firebase Auth with instant status confirmation.
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card glass-card">
        <div class="auth-header">
          <div class="lock-icon-badge">
            <i class="fa-solid fa-key"></i>
          </div>
          <h1 class="auth-title">Reset Password</h1>
          <p class="auth-subtitle">Enter your registered email to receive recovery instructions</p>
        </div>

        @if (emailSent()) {
          <div class="success-banner">
            <i class="fa-solid fa-circle-check"></i>
            <div>
              <strong>Recovery link dispatched!</strong>
              <p>Please check your inbox (and spam folder) for the password reset instructions.</p>
            </div>
          </div>
        }

        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="forgot-email">Account Email</label>
            <div class="input-with-icon">
              <i class="fa-regular fa-envelope input-icon"></i>
              <input 
                id="forgot-email" 
                type="email" 
                formControlName="email" 
                class="form-control" 
                placeholder="name@eduportal.com"
                [class.is-invalid]="f['email'].touched && f['email'].invalid" />
            </div>
            @if (f['email'].touched && f['email'].invalid) {
              <div class="invalid-feedback">A valid email address is required.</div>
            }
          </div>

          <button 
            type="submit" 
            class="gradient-btn submit-btn" 
            [disabled]="forgotForm.invalid || isLoading()">
            @if (isLoading()) {
              <i class="fa-solid fa-spinner fa-spin"></i>
              <span>Sending Instructions...</span>
            } @else {
              <i class="fa-solid fa-paper-plane"></i>
              <span>Send Password Reset Link</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          <a routerLink="/login" class="back-link">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Back to Login</span>
          </a>
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
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 2.5rem 2rem;
      border-radius: var(--radius-lg);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .lock-icon-badge {
      width: 52px;
      height: 52px;
      margin: 0 auto 1rem;
      border-radius: 14px;
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .auth-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .auth-subtitle {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .success-banner {
      display: flex;
      gap: 0.75rem;
      background: var(--success-light);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: var(--success);
      padding: 1rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
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
    }

    .input-with-icon .form-control {
      padding-left: 2.75rem;
    }

    .submit-btn {
      width: 100%;
      margin-top: 0.5rem;
    }

    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      border-top: 1px solid var(--border-color);
      padding-top: 1.25rem;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .back-link:hover {
      color: var(--primary);
    }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  public isLoading = signal<boolean>(false);
  public emailSent = signal<boolean>(false);

  public forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get f() {
    return this.forgotForm.controls;
  }

  async onSubmit(): Promise<void> {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    try {
      await this.auth.forgotPassword(this.forgotForm.value.email!);
      this.emailSent.set(true);
    } catch (err: any) {
      this.toast.error(err.message || 'Failed to dispatch reset email.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
