import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { Course } from '../../../core/models';

/**
 * ====================================================================================
 * REGISTRATION COMPONENT (Student & Faculty Onboarding)
 * ====================================================================================
 * Supports Student and Faculty roles with dynamic validation fields.
 * - Students are auto-approved.
 * - Faculty accounts are placed in pending state until Admin review.
 * - Admin registration is strictly disallowed.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card glass-card">
        <div class="auth-header">
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-subtitle">Join EduPortal Academic Management Cloud</p>
        </div>

        <!-- Role Selector Tab -->
        <div class="role-tabs">
          <button 
            type="button" 
            class="role-tab-btn" 
            [class.active]="selectedRole() === 'student'" 
            (click)="setRole('student')">
            <i class="fa-solid fa-user-graduate"></i>
            <span>Student</span>
          </button>
          <button 
            type="button" 
            class="role-tab-btn" 
            [class.active]="selectedRole() === 'faculty'" 
            (click)="setRole('faculty')">
            <i class="fa-solid fa-chalkboard-user"></i>
            <span>Faculty</span>
          </button>
        </div>

        <!-- Role notice message banner -->
        @if (selectedRole() === 'student') {
          <div class="role-banner student-banner">
            <i class="fa-solid fa-user-clock"></i>
            <span>Student registrations require approval by Subject Faculty or Administrator.</span>
          </div>
        } @else {
          <div class="role-banner faculty-banner">
            <i class="fa-solid fa-circle-info"></i>
            <span>Faculty accounts require administrator approval before portal access.</span>
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
          <!-- Full Name -->
          <div class="form-group">
            <label class="form-label" for="reg-name">Full Name</label>
            <div class="input-with-icon">
              <i class="fa-regular fa-user input-icon"></i>
              <input 
                id="reg-name" 
                type="text" 
                formControlName="displayName" 
                class="form-control" 
                placeholder="e.g. Rahul Sharma"
                [class.is-invalid]="f['displayName'].touched && f['displayName'].invalid" />
            </div>
            @if (f['displayName'].touched && f['displayName'].invalid) {
              <div class="invalid-feedback">Full name is required (min 3 characters).</div>
            }
          </div>

          <!-- Email -->
          <div class="form-group">
            <label class="form-label" for="reg-email">Email Address</label>
            <div class="input-with-icon">
              <i class="fa-regular fa-envelope input-icon"></i>
              <input 
                id="reg-email" 
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

          <!-- Password -->
          <div class="form-group">
            <label class="form-label" for="reg-password">Password</label>
            <div class="input-with-icon">
              <i class="fa-solid fa-lock input-icon"></i>
              <input 
                id="reg-password" 
                [type]="showPassword() ? 'text' : 'password'" 
                formControlName="password" 
                class="form-control" 
                placeholder="At least 6 characters"
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
              <div class="invalid-feedback">Password must be at least 6 characters.</div>
            }
          </div>

          <!-- Student-specific fields -->
          @if (selectedRole() === 'student') {
            <div class="form-group">
              <label class="form-label" for="reg-course">Enrolled Course</label>
              <select id="reg-course" formControlName="courseId" class="form-control">
                <option value="">Select Academic Course</option>
                @for (c of courses(); track c.id) {
                  <option [value]="c.id">{{ c.name }} ({{ c.code }})</option>
                }
              </select>
            </div>

            <div class="grid-2-col">
              <div class="form-group">
                <label class="form-label" for="reg-roll">Roll Number (Optional)</label>
                <input 
                  id="reg-roll" 
                  type="text" 
                  formControlName="rollNo" 
                  class="form-control" 
                  placeholder="e.g. 2026-CS-042" />
              </div>
              <div class="form-group">
                <label class="form-label" for="reg-sem">Current Semester</label>
                <select id="reg-sem" formControlName="semester" class="form-control">
                  @for (s of [1,2,3,4,5,6,7,8]; track s) {
                    <option [value]="s">Semester {{ s }}</option>
                  }
                </select>
              </div>
            </div>
          }

          <!-- Faculty-specific fields -->
          @if (selectedRole() === 'faculty') {
            <div class="form-group">
              <label class="form-label" for="reg-dept">Academic Department</label>
              <input 
                id="reg-dept" 
                type="text" 
                formControlName="department" 
                class="form-control" 
                placeholder="e.g. Computer Science & Engineering" />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-desig">Designation</label>
              <input 
                id="reg-desig" 
                type="text" 
                formControlName="designation" 
                class="form-control" 
                placeholder="e.g. Assistant Professor, Lecturer" />
            </div>
          }

          <!-- Phone Number -->
          <div class="form-group">
            <label class="form-label" for="reg-phone">Contact Number (Optional)</label>
            <input 
              id="reg-phone" 
              type="tel" 
              formControlName="phoneNumber" 
              class="form-control" 
              placeholder="+91 98765 43210" />
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="gradient-btn submit-btn" 
            [disabled]="registerForm.invalid || isLoading()">
            @if (isLoading()) {
              <i class="fa-solid fa-spinner fa-spin"></i>
              <span>Creating Account...</span>
            } @else {
              <i class="fa-solid fa-user-plus"></i>
              <span>Register as {{ selectedRole() === 'student' ? 'Student' : 'Faculty' }}</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login" class="login-link">Sign In</a></p>
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
      padding: 2.5rem 1rem;
    }

    .auth-card {
      width: 100%;
      max-width: 520px;
      padding: 2.5rem 2rem;
      border-radius: var(--radius-lg);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 1.5rem;
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

    .role-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      background: var(--bg-input);
      padding: 0.35rem;
      border-radius: var(--radius-md);
      margin-bottom: 1rem;
    }

    .role-tab-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.65rem;
      border: none;
      background: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-secondary);
      cursor: pointer;
      transition: var(--transition);
    }

    .role-tab-btn.active {
      background: var(--bg-surface);
      color: var(--primary);
      box-shadow: var(--shadow-sm);
    }

    .role-banner {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.65rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.8rem;
      font-weight: 500;
      margin-bottom: 1.25rem;
    }

    .student-banner {
      background: var(--success-light);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .faculty-banner {
      background: var(--info-light);
      color: var(--info);
      border: 1px solid rgba(6, 182, 212, 0.2);
    }

    .grid-2-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    @media (max-width: 480px) {
      .grid-2-col {
        grid-template-columns: 1fr;
      }
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

    .login-link {
      font-weight: 700;
    }
  `]
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private firestore = inject(FirestoreService);
  private toast = inject(ToastService);

  public selectedRole = signal<'student' | 'faculty'>('student');
  public isLoading = signal<boolean>(false);
  public showPassword = signal<boolean>(false);
  public courses = signal<Course[]>([]);

  public registerForm = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    courseId: [''],
    rollNo: [''],
    semester: [1],
    department: [''],
    designation: [''],
    phoneNumber: ['']
  });

  get f() {
    return this.registerForm.controls;
  }

  async ngOnInit(): Promise<void> {
    const list = await this.firestore.getCourses();
    this.courses.set(list);
    if (list.length > 0) {
      this.registerForm.patchValue({ courseId: list[0].id });
    }
  }

  setRole(role: 'student' | 'faculty'): void {
    this.selectedRole.set(role);
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formVal = this.registerForm.value;
    const selectedCourse = this.courses().find(c => c.id === formVal.courseId);

    try {
      await this.auth.register({
        displayName: formVal.displayName!,
        email: formVal.email!,
        password: formVal.password!,
        role: this.selectedRole(),
        courseId: formVal.courseId || '',
        courseName: selectedCourse ? selectedCourse.name : '',
        rollNo: formVal.rollNo || '',
        semester: Number(formVal.semester) || 1,
        department: formVal.department || '',
        designation: formVal.designation || '',
        phoneNumber: formVal.phoneNumber || ''
      });
    } catch (err: any) {
      this.toast.error(err.message || 'Registration failed.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
