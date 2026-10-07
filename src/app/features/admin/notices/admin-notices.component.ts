import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { Notice, NoticePriority, NoticeTarget } from '../../../core/models';

/**
 * ====================================================================================
 * ADMIN NOTICES & CAMPUS ANNOUNCEMENTS COMPONENT
 * ====================================================================================
 * Broadcasts urgent campus circulars, targeted notices (Faculty / Student / All),
 * and priority announcements.
 */
@Component({
  selector: 'app-admin-notices',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmModalComponent],
  template: `
    <div class="notices-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Announcements & Campus Circulars</h1>
          <p class="page-subtitle">Publish official university notifications targeted to faculty, students, or campus-wide</p>
        </div>
        <button type="button" class="gradient-btn" (click)="openNoticeModal()">
          <i class="fa-solid fa-bullhorn"></i>
          <span>Post Announcement</span>
        </button>
      </div>

      <!-- Notices Feed List -->
      <div class="notices-feed">
        @for (n of notices(); track n.id) {
          <div class="notice-card glass-card" [ngClass]="'priority-' + n.priority">
            <div class="card-head">
              <div class="badge-row">
                <span class="badge" [ngClass]="'badge-' + (n.priority === 'urgent' ? 'danger' : n.priority === 'important' ? 'warning' : 'info')">
                  {{ n.priority | uppercase }}
                </span>
                <span class="target-tag">
                  <i class="fa-solid fa-users"></i> Target: {{ n.targetRole | uppercase }}
                </span>
              </div>
              <button type="button" class="btn-icon delete-btn" (click)="confirmDelete(n)" title="Delete Announcement">
                <i class="fa-solid fa-trash-can text-danger"></i>
              </button>
            </div>

            <h3 class="notice-title">{{ n.title }}</h3>
            <p class="notice-body">{{ n.content }}</p>

            <div class="notice-meta">
              <div class="author">
                <i class="fa-regular fa-user"></i> Posted by <strong>{{ n.authorName }}</strong> ({{ n.authorRole | uppercase }})
              </div>
              <div class="date">
                <i class="fa-regular fa-clock"></i> {{ n.createdAt | date:'medium' }}
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state glass-card">
            <i class="fa-solid fa-bullhorn empty-icon"></i>
            <h3 class="empty-title">No Active Announcements</h3>
            <p class="empty-subtitle">Click "Post Announcement" to broadcast a notice to students or faculty members.</p>
          </div>
        }
      </div>

      <!-- Post Notice Modal -->
      @if (isModalOpen()) {
        <div class="modal-overlay" (click)="isModalOpen.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">Broadcast Campus Notice</h2>
              <button type="button" class="btn-icon" (click)="isModalOpen.set(false)"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form [formGroup]="noticeForm" (ngSubmit)="saveNotice()" class="modal-body">
              <div class="form-group">
                <label class="form-label">Notice Title *</label>
                <input type="text" formControlName="title" class="form-control" placeholder="e.g. Schedule for Mid-Term Examinations" />
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Target Audience *</label>
                  <select formControlName="targetRole" class="form-control">
                    <option value="all">Campus-Wide (Everyone)</option>
                    <option value="student">Students Only</option>
                    <option value="faculty">Faculty Members Only</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Priority Level *</label>
                  <select formControlName="priority" class="form-control">
                    <option value="normal">Normal Information</option>
                    <option value="important">Important Notification</option>
                    <option value="urgent">Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Notice Description & Details *</label>
                <textarea formControlName="content" rows="4" class="form-control" placeholder="Write full details of the academic circular..."></textarea>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="isModalOpen.set(false)">Cancel</button>
                <button type="submit" class="gradient-btn" [disabled]="noticeForm.invalid">Publish Notice</button>
              </div>
            </form>
          </div>
        </div>
      }

      <app-confirm-modal 
        [isOpen]="isDeleteModalOpen()" 
        title="Delete Announcement" 
        [message]="'Are you sure you want to delete notice: ' + (noticeToDelete()?.title || '') + '?'"
        confirmText="Delete" 
        (confirmed)="executeDelete()" 
        (cancelled)="isDeleteModalOpen.set(false)">
      </app-confirm-modal>
    </div>
  `,
  styles: [`
    .notices-container {
      padding: 1.5rem 2rem;
      max-width: 1100px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .page-subtitle {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-top: 0.2rem;
    }

    .notices-feed {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .notice-card {
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      border-left: 4px solid var(--border-color);
    }

    .notice-card.priority-urgent { border-left-color: var(--danger); }
    .notice-card.priority-important { border-left-color: var(--warning); }
    .notice-card.priority-normal { border-left-color: var(--info); }

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.85rem;
    }

    .badge-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .target-tag {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      background: var(--bg-hover);
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-sm);
    }

    .notice-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .notice-body {
      font-size: 0.925rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .notice-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 1.25rem;
      padding-top: 0.85rem;
      border-top: 1px solid var(--border-color);
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .delete-btn {
      width: 34px;
      height: 34px;
      min-width: 34px;
      min-height: 34px;
    }

    .text-danger { color: var(--danger); }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 800;
    }

    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }
  `]
})
export class AdminNoticesComponent implements OnInit {
  private firestore = inject(FirestoreService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  public notices = signal<Notice[]>([]);
  public isModalOpen = signal<boolean>(false);
  public isDeleteModalOpen = signal<boolean>(false);
  public noticeToDelete = signal<Notice | null>(null);

  public noticeForm = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    targetRole: ['all', Validators.required],
    priority: ['normal', Validators.required]
  });

  async ngOnInit(): Promise<void> {
    await this.loadNotices();
  }

  async loadNotices(): Promise<void> {
    const list = await this.firestore.getNotices();
    this.notices.set(list);
  }

  openNoticeModal(): void {
    this.noticeForm.reset({
      targetRole: 'all',
      priority: 'normal'
    });
    this.isModalOpen.set(true);
  }

  async saveNotice(): Promise<void> {
    if (this.noticeForm.invalid) return;

    const val = this.noticeForm.value;
    const author = this.auth.userProfile();

    const newNotice: Notice = {
      id: 'not_' + Date.now().toString(36),
      title: val.title!,
      content: val.content!,
      targetRole: val.targetRole as NoticeTarget,
      authorId: author ? author.uid : 'usr_admin',
      authorName: author ? author.displayName : 'Administrator',
      authorRole: 'admin',
      priority: val.priority as NoticePriority,
      createdAt: new Date().toISOString()
    };

    await this.firestore.saveNotice(newNotice);
    this.toast.success('Announcement published successfully!');
    this.isModalOpen.set(false);
    await this.loadNotices();
  }

  confirmDelete(n: Notice): void {
    this.noticeToDelete.set(n);
    this.isDeleteModalOpen.set(true);
  }

  async executeDelete(): Promise<void> {
    const n = this.noticeToDelete();
    if (!n) return;

    await this.firestore.deleteNotice(n.id);
    this.toast.success('Notice removed.');
    this.isDeleteModalOpen.set(false);
    this.noticeToDelete.set(null);
    await this.loadNotices();
  }
}
