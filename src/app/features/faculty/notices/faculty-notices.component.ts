import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { Notice, NoticePriority } from '../../../core/models';

/**
 * ====================================================================================
 * FACULTY STUDENT ANNOUNCEMENTS COMPONENT
 * ====================================================================================
 * Allows teachers to post urgent assignments, project guidelines, and lecture updates
 * specifically targeted to student class groups.
 */
@Component({
  selector: 'app-faculty-notices',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fac-notices-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Post Student Announcements</h1>
          <p class="page-subtitle">Publish classroom updates, test guidelines, and assignment submission deadlines</p>
        </div>
        <button type="button" class="gradient-btn" (click)="openModal()">
          <i class="fa-solid fa-bullhorn"></i>
          <span>Post Notice</span>
        </button>
      </div>

      <!-- Feed -->
      <div class="notices-list">
        @for (n of notices(); track n.id) {
          <div class="notice-card glass-card">
            <div class="card-head">
              <span class="badge" [ngClass]="'badge-' + (n.priority === 'urgent' ? 'danger' : n.priority === 'important' ? 'warning' : 'info')">
                {{ n.priority | uppercase }}
              </span>
              <span class="date"><i class="fa-regular fa-clock"></i> {{ n.createdAt | date:'mediumDate' }}</span>
            </div>

            <h3 class="notice-title">{{ n.title }}</h3>
            <p class="notice-content">{{ n.content }}</p>

            <div class="card-footer">
              <span class="author"><i class="fa-regular fa-user"></i> {{ n.authorName }}</span>
              @if (n.authorId === auth.userProfile()?.uid) {
                <button type="button" class="btn-delete" (click)="deleteNotice(n.id)" title="Delete Notice">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-state glass-card">
            <i class="fa-solid fa-bullhorn empty-icon"></i>
            <h3 class="empty-title">No Notices Posted</h3>
            <p class="empty-subtitle">Broadcast your first student circular using the button above.</p>
          </div>
        }
      </div>

      <!-- Create Modal -->
      @if (isModalOpen()) {
        <div class="modal-overlay" (click)="isModalOpen.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">New Student Announcement</h2>
              <button type="button" class="btn-icon" (click)="isModalOpen.set(false)"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form [formGroup]="noticeForm" (ngSubmit)="saveNotice()" class="modal-body">
              <div class="form-group">
                <label class="form-label">Title *</label>
                <input type="text" formControlName="title" class="form-control" placeholder="e.g. Lab Project Submission Deadline" />
              </div>

              <div class="form-group">
                <label class="form-label">Priority</label>
                <select formControlName="priority" class="form-control">
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Announcement Content *</label>
                <textarea formControlName="content" rows="4" class="form-control" placeholder="Type instructions for students..."></textarea>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="isModalOpen.set(false)">Cancel</button>
                <button type="submit" class="gradient-btn" [disabled]="noticeForm.invalid">Publish</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .fac-notices-container {
      padding: 1.5rem 2rem;
      max-width: 1000px;
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

    .notices-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .notice-card {
      padding: 1.5rem;
      border-radius: var(--radius-lg);
    }

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .date {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .notice-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .notice-content {
      font-size: 0.925rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 0.85rem;
      border-top: 1px solid var(--border-color);
      font-size: 0.825rem;
      color: var(--text-muted);
    }

    .btn-delete {
      background: none;
      border: none;
      color: var(--danger);
      cursor: pointer;
      padding: 0.3rem;
    }

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
export class FacultyNoticesComponent implements OnInit {
  public auth = inject(AuthService);
  private firestore = inject(FirestoreService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  public notices = signal<Notice[]>([]);
  public isModalOpen = signal<boolean>(false);

  public noticeForm = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    priority: ['normal', Validators.required]
  });

  async ngOnInit(): Promise<void> {
    await this.loadNotices();
  }

  async loadNotices(): Promise<void> {
    const list = await this.firestore.getNotices('student');
    this.notices.set(list);
  }

  openModal(): void {
    this.noticeForm.reset({ priority: 'normal' });
    this.isModalOpen.set(true);
  }

  async saveNotice(): Promise<void> {
    if (this.noticeForm.invalid) return;

    const val = this.noticeForm.value;
    const author = this.auth.userProfile();

    const n: Notice = {
      id: 'not_' + Date.now().toString(36),
      title: val.title!,
      content: val.content!,
      targetRole: 'student',
      authorId: author ? author.uid : 'usr_faculty',
      authorName: author ? author.displayName : 'Faculty Member',
      authorRole: 'faculty',
      priority: val.priority as NoticePriority,
      createdAt: new Date().toISOString()
    };

    await this.firestore.saveNotice(n);
    this.toast.success('Notice published to students.');
    this.isModalOpen.set(false);
    await this.loadNotices();
  }

  async deleteNotice(id: string): Promise<void> {
    await this.firestore.deleteNotice(id);
    this.toast.info('Notice deleted.');
    await this.loadNotices();
  }
}
