import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * ====================================================================================
 * USER PROFILE & PASSWORD SECURITY COMPONENT
 * ====================================================================================
 * Allows authenticated students, faculty, and administrators to edit their profile
 * information, view academic attributes, and update security credentials.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="page-header">
        <h1 class="page-title">My Account Settings</h1>
        <p class="page-subtitle">Manage personal profile details and security credentials</p>
      </div>

      <div class="profile-grid">
        <!-- 1. Profile Information Card -->
        <div class="profile-card glass-card">
          <div class="card-header">
            <div class="avatar-large">
              {{ auth.userProfile()?.displayName?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
            <div>
              <h2 class="user-title">{{ auth.userProfile()?.displayName }}</h2>
              <span class="badge" [ngClass]="'badge-' + (auth.userProfile()?.role === 'admin' ? 'primary' : auth.userProfile()?.role === 'faculty' ? 'info' : 'success')">
                {{ auth.userProfile()?.role | uppercase }}
              </span>
            </div>
          </div>

          <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()" class="form-body">
            <div class="form-group">
              <label class="form-label" for="prof-email">Email Address</label>
              <input id="prof-email" type="email" [value]="auth.userProfile()?.email" class="form-control" disabled />
              <small class="text-muted">Email is linked to authentication credentials.</small>
            </div>

            <div class="form-group">
              <label class="form-label" for="prof-name">Display Name</label>
              <input 
                id="prof-name" 
                type="text" 
                formControlName="displayName" 
                class="form-control" 
                [class.is-invalid]="pf['displayName'].touched && pf['displayName'].invalid" />
            </div>

            <div class="form-group">
              <label class="form-label" for="prof-phone">Contact Phone</label>
              <input id="prof-phone" type="tel" formControlName="phoneNumber" class="form-control" placeholder="+91 98765 43210" />
            </div>

            @if (auth.userProfile()?.role === 'student') {
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Roll Number</label>
                  <input type="text" [value]="auth.userProfile()?.rollNo || 'N/A'" class="form-control" disabled />
                </div>
                <div class="form-group">
                  <label class="form-label">Semester</label>
                  <input type="text" [value]="'Semester ' + (auth.userProfile()?.semester || 1)" class="form-control" disabled />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Enrolled Course</label>
                <input type="text" [value]="auth.userProfile()?.courseName || 'B.Tech CSE'" class="form-control" disabled />
              </div>
            }

            @if (auth.userProfile()?.role === 'faculty') {
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Department</label>
                  <input type="text" [value]="auth.userProfile()?.department || 'CSE'" class="form-control" disabled />
                </div>
                <div class="form-group">
                  <label class="form-label">Designation</label>
                  <input type="text" [value]="auth.userProfile()?.designation || 'Professor'" class="form-control" disabled />
                </div>
              </div>
            }

            <button type="submit" class="gradient-btn" [disabled]="profileForm.invalid || isSavingProfile()">
              @if (isSavingProfile()) {
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Updating Profile...</span>
              } @else {
                <i class="fa-solid fa-floppy-disk"></i>
                <span>Save Profile Changes</span>
              }
            </button>
          </form>
        </div>

        <!-- 2. Security & Password Card -->
        <div class="profile-card glass-card">
          <div class="card-header">
            <div class="icon-circle">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <h2 class="user-title">Security & Password</h2>
              <p class="card-desc">Update your login password</p>
            </div>
          </div>

          <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="form-body">
            <div class="form-group">
              <label class="form-label" for="new-pass">New Password</label>
              <input 
                id="new-pass" 
                type="password" 
                formControlName="newPassword" 
                class="form-control" 
                placeholder="At least 6 characters"
                [class.is-invalid]="pw['newPassword'].touched && pw['newPassword'].invalid" />
            </div>

            <div class="form-group">
              <label class="form-label" for="confirm-pass">Confirm New Password</label>
              <input 
                id="confirm-pass" 
                type="password" 
                formControlName="confirmPassword" 
                class="form-control" 
                placeholder="Re-enter new password"
                [class.is-invalid]="pw['confirmPassword'].touched && pw['confirmPassword'].invalid" />
              @if (passwordForm.errors?.['mismatch'] && pw['confirmPassword'].touched) {
                <div class="invalid-feedback">Passwords do not match.</div>
              }
            </div>

            <button type="submit" class="btn-secondary" [disabled]="passwordForm.invalid || isChangingPassword()">
              @if (isChangingPassword()) {
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Changing Password...</span>
              } @else {
                <i class="fa-solid fa-key"></i>
                <span>Change Password</span>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 1.5rem;
      max-width: 1100px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .page-subtitle {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 900px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
    }

    .profile-card {
      padding: 2rem;
      border-radius: var(--radius-lg);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-color);
    }

    .avatar-large {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--primary-gradient);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      font-weight: 800;
      box-shadow: 0 4px 14px var(--primary-glow);
    }

    .icon-circle {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md);
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .user-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .card-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .form-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .text-muted {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
  `]
})
export class ProfileComponent implements OnInit {
  public auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  public isSavingProfile = signal<boolean>(false);
  public isChangingPassword = signal<boolean>(false);

  public profileForm = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(3)]],
    phoneNumber: ['']
  });

  public passwordForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  get pf() { return this.profileForm.controls; }
  get pw() { return this.passwordForm.controls; }

  ngOnInit(): void {
    const user = this.auth.userProfile();
    if (user) {
      this.profileForm.patchValue({
        displayName: user.displayName,
        phoneNumber: user.phoneNumber || ''
      });
    }
  }

  async onSaveProfile(): Promise<void> {
    if (this.profileForm.invalid) return;

    this.isSavingProfile.set(true);
    try {
      await this.auth.updateProfile({
        displayName: this.profileForm.value.displayName!,
        phoneNumber: this.profileForm.value.phoneNumber || ''
      });
    } catch (e: any) {
      this.toast.error(e.message || 'Error updating profile');
    } finally {
      this.isSavingProfile.set(false);
    }
  }

  async onChangePassword(): Promise<void> {
    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.toast.error('New passwords do not match.');
      return;
    }

    this.isChangingPassword.set(true);
    try {
      await this.auth.changePassword(newPassword!);
      this.passwordForm.reset();
    } catch (e: any) {
      this.toast.error(e.message || 'Failed to change password.');
    } finally {
      this.isChangingPassword.set(false);
    }
  }
}
