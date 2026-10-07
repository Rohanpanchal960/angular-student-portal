import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * ====================================================================================
 * AWAITING APPROVAL COMPONENT (Faculty & Student Approval Workflow)
 * ====================================================================================
 * - Students await approval by Faculty or Administrator.
 * - Faculty members await approval by Administrator.
 * - Auto-polling AJAX-style checker (auto-redirects upon approval).
 */
@Component({
  selector: 'app-awaiting-approval',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pending-page">
      <div class="pending-card glass-card">
        <div class="clock-icon-wrapper">
          <i class="fa-solid fa-hourglass-half fa-bounce"></i>
        </div>

        <h1 class="title">
          @if (auth.userProfile()?.role === 'student') {
            Student Admission Approval Pending
          } @else {
            Faculty Verification Pending
          }
        </h1>

        <p class="subtitle">
          Hello <strong>{{ auth.userProfile()?.displayName }}</strong>, your account registration
          has been submitted successfully.
          @if (auth.userProfile()?.role === 'student') {
            Your enrollment is currently pending authorization by your <strong>Subject Faculty</strong> or the <strong>Academic Administrator</strong>.
          } @else {
            Your faculty credentials are currently awaiting review by the <strong>System Administrator</strong>.
          }
        </p>

        <div class="info-box">
          <div class="info-row">
            <span class="label"><i class="fa-regular fa-envelope"></i> Email:</span>
            <span class="val">{{ auth.userProfile()?.email }}</span>
          </div>

          <div class="info-row">
            <span class="label"><i class="fa-solid fa-id-badge"></i> Account Role:</span>
            <span class="val badge" [ngClass]="auth.userProfile()?.role === 'student' ? 'badge-info' : 'badge-primary'">
              {{ auth.userProfile()?.role | uppercase }}
            </span>
          </div>

          @if (auth.userProfile()?.role === 'student') {
            <div class="info-row">
              <span class="label"><i class="fa-solid fa-graduation-cap"></i> Enrolled Course:</span>
              <span class="val">{{ auth.userProfile()?.courseName || 'B.Tech CSE' }}</span>
            </div>
            <div class="info-row">
              <span class="label"><i class="fa-solid fa-hashtag"></i> Temporary Roll No:</span>
              <span class="val font-code">{{ auth.userProfile()?.rollNo || 'Pending' }}</span>
            </div>
          } @else {
            <div class="info-row">
              <span class="label"><i class="fa-solid fa-building-columns"></i> Department:</span>
              <span class="val">{{ auth.userProfile()?.department || 'Computer Science' }}</span>
            </div>
          }

          <div class="info-row">
            <span class="label"><i class="fa-solid fa-shield-halved"></i> Verification Status:</span>
            <span class="badge badge-warning">
              @if (auth.userProfile()?.role === 'student') {
                Awaiting Faculty / Admin Approval
              } @else {
                Awaiting Administrator Approval
              }
            </span>
          </div>
        </div>

        <div class="actions">
          <button type="button" class="gradient-btn" (click)="checkApprovalStatus()">
            <i class="fa-solid fa-arrows-rotate"></i>
            <span>Check Approval Status</span>
          </button>

          <button type="button" class="btn-secondary" (click)="auth.logout()">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pending-page {
      min-height: calc(100vh - var(--header-height));
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }

    .pending-card {
      width: 100%;
      max-width: 540px;
      padding: 2.75rem 2rem;
      border-radius: var(--radius-lg);
      text-align: center;
    }

    .clock-icon-wrapper {
      width: 72px;
      height: 72px;
      margin: 0 auto 1.25rem;
      border-radius: 50%;
      background: var(--warning-light);
      color: var(--warning);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.2rem;
    }

    .title {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .subtitle {
      font-size: 0.925rem;
      color: var(--text-secondary);
      margin-top: 0.5rem;
      line-height: 1.55;
    }

    .info-box {
      background: var(--bg-hover);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      margin: 1.75rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      text-align: left;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
    }

    .label {
      color: var(--text-muted);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .val {
      color: var(--text-primary);
      font-weight: 600;
    }

    .font-code {
      font-family: 'Fira Code', monospace;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }
  `]
})
export class AwaitingApprovalComponent implements OnInit, OnDestroy {
  public auth = inject(AuthService);
  private firestore = inject(FirestoreService);
  private toast = inject(ToastService);
  private pollInterval: any = null;

  ngOnInit(): void {
    // AJAX-style auto reload / polling every 3 seconds to auto-redirect on approval
    this.pollInterval = setInterval(async () => {
      await this.silentCheck();
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private async silentCheck(): Promise<void> {
    const user = this.auth.userProfile();
    if (!user) return;

    const fresh = await this.firestore.getUserProfile(user.uid);
    if (fresh && fresh.approved) {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
      this.toast.success(`Account approved! Welcome, ${fresh.displayName}.`);
      this.auth.userProfile.set(fresh);
      this.auth.redirectAfterLogin(fresh);
    }
  }

  async checkApprovalStatus(): Promise<void> {
    const user = this.auth.userProfile();
    if (!user) return;

    const fresh = await this.firestore.getUserProfile(user.uid);
    if (fresh && fresh.approved) {
      this.toast.success(`Congratulations ${fresh.displayName}! Your account has been approved.`);
      this.auth.userProfile.set(fresh);
      this.auth.redirectAfterLogin(fresh);
    } else {
      this.toast.info('Your registration is still awaiting authorization. Please check back shortly.');
    }
  }
}
