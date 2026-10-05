import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, AuthUser, DemoAccount } from '../../services/auth.service';

/**
 * ====================================================================================
 * Fully-Working Interactive Demo Login Component
 * ====================================================================================
 * 
 * Features:
 * 1. 1-Click Quick Demo Sign-in presets (Admin, Faculty, Student)
 * 2. Manual credentials input with Show/Hide password toggle
 * 3. Real-time validation and animated state feedback (Loading, Success, Errors)
 * 4. Active Session Inspector if already authenticated
 * 5. Forgot Password simulation modal
 * 6. Dynamic redirection with returnUrl support
 */

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = 'admin@eduportal.ac.in';
  password: string = 'admin123';
  rememberMe: boolean = true;
  showPassword: boolean = false;

  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  returnUrl: string = '/dashboard';

  demoAccounts: DemoAccount[] = [];
  currentUser: AuthUser | null = null;

  // Forgot password modal state
  showForgotModal: boolean = false;
  forgotEmail: string = '';
  forgotSuccess: string | null = null;

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.demoAccounts = this.authService.demoAccounts;
  }

  ngOnInit(): void {
    // Read returnUrl from query params if available
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Watch current user status
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Auto-fill demo account details
  fillDemoAccount(demo: DemoAccount): void {
    this.email = demo.email;
    this.password = demo.password;
    this.errorMessage = null;
    this.successMessage = `Selected demo account: ${demo.name} (${demo.role.toUpperCase()})`;
  }

  // Instant 1-click login with demo credentials
  quickLogin(demo: DemoAccount): void {
    this.email = demo.email;
    this.password = demo.password;
    this.onSubmit();
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.email || !this.email.trim()) {
      this.errorMessage = 'Please enter your email or username.';
      return;
    }

    if (!this.password || !this.password.trim()) {
      this.errorMessage = 'Please enter your password.';
      return;
    }

    this.isLoading = true;

    // Simulate authentic network latency for realistic feel
    setTimeout(() => {
      const result = this.authService.login(this.email, this.password);
      this.isLoading = false;

      if (result.success) {
        this.successMessage = result.message;
        setTimeout(() => {
          this.router.navigateByUrl(this.returnUrl);
        }, 600);
      } else {
        this.errorMessage = result.message;
      }
    }, 450);
  }

  onLogout(): void {
    this.authService.logout();
    this.successMessage = 'You have been logged out successfully.';
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  openForgotPassword(): void {
    this.forgotEmail = this.email || 'admin@eduportal.ac.in';
    this.forgotSuccess = null;
    this.showForgotModal = true;
  }

  closeForgotPassword(): void {
    this.showForgotModal = false;
    this.forgotSuccess = null;
  }

  sendPasswordReset(): void {
    if (!this.forgotEmail || !this.forgotEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    this.forgotSuccess = `Demo password reset instructions dispatched to ${this.forgotEmail}! You can always log in with password 'admin123' or 'faculty123'.`;
  }
}
