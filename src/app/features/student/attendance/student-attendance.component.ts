import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { Subject, AttendanceRecord } from '../../../core/models';

interface SubjectAttendanceCard {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  isDefaulter: boolean;
}

/**
 * ====================================================================================
 * STUDENT ATTENDANCE MONITOR & PROGRESS RINGS COMPONENT
 * ====================================================================================
 * Provides subject-by-subject attendance analytics with:
 * - Animated SVG Circular Progress Rings
 * - Color-coded compliance levels (Green >=75%, Red <75%)
 * - Chronological session attendance history log
 */
@Component({
  selector: 'app-student-attendance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="attendance-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">My Attendance & Compliance Tracker</h1>
          <p class="page-subtitle">Subject-wise presence records, progress rings, and mandatory 75% criteria tracking</p>
        </div>
      </div>

      <!-- Warning if any subject has attendance <75% -->
      @if (hasDefaulterSubject()) {
        <div class="defaulter-banner glass-card">
          <div class="banner-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div class="banner-content">
            <h4>Attendance Warning (&lt;75% Detected)</h4>
            <p>You have fallen below the mandatory 75% attendance criterion in one or more subjects. Attend upcoming lectures to recover compliance.</p>
          </div>
        </div>
      }

      <!-- Progress Rings Grid -->
      <div class="rings-grid">
        @for (item of subjectCards(); track item.subjectId) {
          <div class="ring-card glass-card" [class.card-defaulter]="item.isDefaulter">
            <div class="ring-wrapper">
              <svg class="progress-ring" width="110" height="110" viewBox="0 0 120 120">
                <circle 
                  cx="60" cy="60" r="50" 
                  fill="transparent" 
                  stroke="var(--bg-hover)" 
                  stroke-width="10" />
                <circle 
                  cx="60" cy="60" r="50" 
                  fill="transparent" 
                  [attr.stroke]="item.totalClasses === 0 ? 'var(--border-color)' : (item.isDefaulter ? '#ef4444' : '#10b981')" 
                  stroke-width="10" 
                  stroke-linecap="round"
                  class="progress-ring-circle"
                  [attr.stroke-dasharray]="circumference"
                  [attr.stroke-dashoffset]="getStrokeOffset(item.percentage)" />
              </svg>
              <div class="ring-percentage">
                <span class="pct-num" [class.text-danger]="item.isDefaulter">{{ item.percentage }}%</span>
              </div>
            </div>

            <div class="card-details">
              <span class="code-badge">{{ item.subjectCode }}</span>
              <h3 class="subject-title">{{ item.subjectName }}</h3>
              <div class="meta-row">
                <span>Classes: <strong>{{ item.attendedClasses }} / {{ item.totalClasses }}</strong></span>
                @if (item.totalClasses > 0) {
                  <span class="badge" [ngClass]="item.isDefaulter ? 'badge-danger' : 'badge-success'">
                    {{ item.isDefaulter ? 'Defaulter' : 'Compliant' }}
                  </span>
                } @else {
                  <span class="badge badge-info">No Classes Yet</span>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Chronological Attendance History Table -->
      <div class="history-section">
        <h3 class="section-title"><i class="fa-solid fa-clock-rotate-left text-primary"></i> Attendance Session History</h3>
        
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Session Date</th>
                <th>Subject</th>
                <th>Recorded Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              @for (rec of attendanceLog(); track rec.id) {
                <tr>
                  <td><strong>{{ rec.date }}</strong></td>
                  <td>{{ rec.subjectName || 'Computer Science Module' }}</td>
                  <td>
                    @if (rec.status === 'present') {
                      <span class="badge badge-success"><i class="fa-solid fa-check"></i> Present</span>
                    } @else if (rec.status === 'late') {
                      <span class="badge badge-warning"><i class="fa-regular fa-clock"></i> Late</span>
                    } @else {
                      <span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> Absent</span>
                    }
                  </td>
                  <td><span class="text-muted">{{ rec.remarks || 'Regular class conducted' }}</span></td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4">
                    <div class="empty-state">
                      <p>No historical attendance records available yet.</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .attendance-page {
      padding: 1.5rem 2rem;
      max-width: 1400px;
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

    .defaulter-banner {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 1.5rem;
      border-left: 4px solid var(--danger);
      background: rgba(239, 68, 68, 0.05);
      border-radius: var(--radius-lg);
      margin-bottom: 2rem;
    }

    .banner-icon {
      font-size: 1.75rem;
      color: var(--danger);
    }

    .banner-content h4 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--danger);
    }

    .banner-content p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 0.2rem;
    }

    .rings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .ring-card {
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .ring-card.card-defaulter {
      border-color: rgba(239, 68, 68, 0.3);
    }

    .ring-wrapper {
      position: relative;
      width: 110px;
      height: 110px;
      margin-bottom: 1.25rem;
    }

    .ring-percentage {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pct-num {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .code-badge {
      font-family: 'Fira Code', monospace;
      font-size: 0.775rem;
      background: var(--bg-hover);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
    }

    .subject-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0.4rem 0 0.85rem;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      font-size: 0.825rem;
      color: var(--text-secondary);
      border-top: 1px solid var(--border-color);
      padding-top: 0.85rem;
    }

    .history-section {
      margin-top: 2rem;
    }

    .section-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .text-danger { color: var(--danger); }
  `]
})
export class StudentAttendanceComponent implements OnInit, OnDestroy {
  public auth = inject(AuthService);
  private firestore = inject(FirestoreService);
  private refreshTimer: any = null;

  public subjectCards = signal<SubjectAttendanceCard[]>([]);
  public attendanceLog = signal<AttendanceRecord[]>([]);
  public hasDefaulterSubject = signal<boolean>(false);

  // Circumference of SVG circle with radius 50: 2 * PI * 50 = 314.159
  public readonly circumference = 314.159;

  async ngOnInit(): Promise<void> {
    await this.loadAttendance();

    // AJAX-style background auto-refresh every 4 seconds
    this.refreshTimer = setInterval(async () => {
      await this.loadAttendance();
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  async loadAttendance(): Promise<void> {
    const user = this.auth.userProfile();
    if (!user) return;

    const allSubjects = await this.firestore.getSubjects();
    const subjects = (user.courseId && allSubjects.some(s => s.courseId === user.courseId))
      ? allSubjects.filter(s => s.courseId === user.courseId)
      : allSubjects;

    const records = await this.firestore.getAttendanceForStudent(user.uid);
    this.attendanceLog.set(records);

    let foundDefaulter = false;

    const cards: SubjectAttendanceCard[] = subjects.map(sub => {
      const subRecords = records.filter(r => r.subjectId === sub.id);
      const total = subRecords.length;
      const attended = subRecords.filter(r => r.status === 'present' || r.status === 'late').length;
      const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
      const isDef = total > 0 && pct < 75;

      if (isDef) foundDefaulter = true;

      return {
        subjectId: sub.id,
        subjectCode: sub.code,
        subjectName: sub.name,
        totalClasses: total,
        attendedClasses: attended,
        percentage: pct,
        isDefaulter: isDef
      };
    });

    this.subjectCards.set(cards);
    this.hasDefaulterSubject.set(foundDefaulter);
  }

  getStrokeOffset(percentage: number): number {
    const progress = Math.min(100, Math.max(0, percentage));
    return this.circumference - (progress / 100) * this.circumference;
  }
}
