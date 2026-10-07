import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../core/services/firestore.service';
import { Notice } from '../../../core/models';

/**
 * ====================================================================================
 * STUDENT CAMPUS NOTICE BOARD COMPONENT
 * ====================================================================================
 * Displays university and department circulars targeted to students,
 * categorized by priority (Urgent, Important, Normal).
 */
@Component({
  selector: 'app-student-notices',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notices-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Notice Board & Announcements</h1>
          <p class="page-subtitle">Academic circulars, syllabus updates, exam schedules, and holiday notifications</p>
        </div>
      </div>

      <div class="notices-grid">
        @for (n of notices(); track n.id) {
          <div class="notice-card glass-card" [ngClass]="'card-' + n.priority">
            <div class="card-head">
              <span class="badge" [ngClass]="'badge-' + (n.priority === 'urgent' ? 'danger' : n.priority === 'important' ? 'warning' : 'info')">
                {{ n.priority | uppercase }}
              </span>
              <span class="date"><i class="fa-regular fa-clock"></i> {{ n.createdAt | date:'mediumDate' }}</span>
            </div>

            <h3 class="notice-title">{{ n.title }}</h3>
            <p class="notice-body">{{ n.content }}</p>

            <div class="card-footer">
              <span class="author">
                <i class="fa-regular fa-user"></i> {{ n.authorName }} ({{ n.authorRole | uppercase }})
              </span>
            </div>
          </div>
        } @empty {
          <div class="empty-state glass-card">
            <i class="fa-solid fa-bullhorn empty-icon"></i>
            <h3 class="empty-title">No Active Announcements</h3>
            <p class="empty-subtitle">Check back regularly for updates from academic faculty and the university administration.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .notices-page {
      padding: 1.5rem 2rem;
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
      margin-top: 0.2rem;
    }

    .notices-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .notice-card {
      padding: 1.5rem 1.75rem;
      border-radius: var(--radius-lg);
      border-left: 4px solid var(--border-color);
    }

    .notice-card.card-urgent { border-left-color: var(--danger); }
    .notice-card.card-important { border-left-color: var(--warning); }
    .notice-card.card-normal { border-left-color: var(--info); }

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

    .card-footer {
      margin-top: 1.25rem;
      padding-top: 0.85rem;
      border-top: 1px solid var(--border-color);
      font-size: 0.825rem;
      color: var(--text-muted);
    }
  `]
})
export class StudentNoticesComponent implements OnInit {
  private firestore = inject(FirestoreService);

  public notices = signal<Notice[]>([]);

  async ngOnInit(): Promise<void> {
    const list = await this.firestore.getNotices('student');
    this.notices.set(list);
  }
}
