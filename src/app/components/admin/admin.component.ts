import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { passwordStrengthValidator } from '../../validators/password-strength.validator';
import { StudentService } from '../../services/student.service';

/**
 * ====================================================================================
 * [EXPERIMENT 20] - Protected Admin Dashboard & AuthGuard
 * [EXPERIMENT 22] - Reactive Form for user login with validations (required email, min length)
 * [EXPERIMENT 23] - Custom validator for password strength (capital letter, number, special char)
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * 1. Exp 22 (Reactive Login Form):
 *    `FormBuilder.group({ email: ['', [Validators.required, Validators.email]], password: [...] })`
 *    se strictly validated reactive form banata hai.
 * 2. Exp 23 (Custom Password Strength Validator):
 *    Humara banaya custom function `passwordStrengthValidator()` pass kiya gaya hai jo check karta hai:
 *    - At least 1 Capital letter (A-Z)
 *    - At least 1 Number (0-9)
 *    - At least 1 Special character (@$!%*?&#)
 * 3. Exp 20 (Route Guard Protection):
 *    Admin section login ke bina guarded rehta hai. Jab user successful credentials deta hai,
 *    `authService.login()` session establish karta hai jisse guard allow kar deta hai.
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * College Admin panel, system reset, aur faculty settings ko unauthorized public access se
 * protect karta hai.
 */

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  // [EXPERIMENT 22]: Reactive Form Group
  loginForm!: FormGroup;

  isSubmitted = false;
  loginError: string | null = null;
  loginSuccess: string | null = null;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    public studentService: StudentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initLoginForm();
  }

  /**
   * [EXPERIMENT 22 & 23]:
   * Initialize Reactive Form with built-in and custom validators
   */
  private initLoginForm(): void {
    this.loginForm = this.fb.group({
      // Exp 22: Required email with standard email validator
      email: [
        'admin@college.edu',
        [Validators.required, Validators.email]
      ],
      // Exp 22 & 23: Required, minLength(6), and custom passwordStrengthValidator
      password: [
        'Admin@2025!', // Sample strong password fulfilling Exp 23 criteria
        [
          Validators.required,
          Validators.minLength(6),
          passwordStrengthValidator() // [EXPERIMENT 23 Custom Validator]
        ]
      ]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  get passwordStrengthErrors() {
    return this.f['password'].errors?.['passwordStrength'];
  }

  /**
   * [EXPERIMENT 22 & 23]: Login Form Submission
   */
  onSubmit(): void {
    this.isSubmitted = true;
    this.loginError = null;

    if (this.loginForm.invalid) {
      this.loginError = 'Please satisfy all email and password strength requirements.';
      return;
    }

    const { email, password } = this.loginForm.value;
    const result = this.authService.login(email, password);

    if (result.success) {
      this.loginSuccess = result.message;
      setTimeout(() => {
        this.loginSuccess = null;
      }, 3000);
    } else {
      this.loginError = result.message;
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.isSubmitted = false;
    this.initLoginForm();
  }
}
