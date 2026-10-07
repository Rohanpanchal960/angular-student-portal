import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { AttendanceRecord, MarksRecord, ExamTimetable, Notice, SemesterResultSheet } from '../../../core/models';

/**
 * ====================================================================================
 * STUDENT COCKPIT DASHBOARD COMPONENT
 * ====================================================================================
 * Comprehensive personal academic overview:
 * - Overall Attendance Percentage with Defaulter Warning Banner (<75%)
 * - Grade Average and Semester SGPA
 * - Countdown to upcoming examinations
 * - Real-time campus announcement feed
 */
@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent],
  template: `
    <div class="student-dash-container">
      <!-- Welcome Header -->
      <div class="dash-header">
        <div class="student-info">
          <h1 class="welcome-title">Welcome, {{ auth.userProfile()?.displayName }}!</h1>
          <p class="welcome-sub">
            Roll No: <strong>{{ auth.userProfile()?.rollNo || 'Pending' }}</strong>
            @if (auth.userProfile()?.courseName) { • {{ auth.userProfile()?.courseName }} }
            @if (auth.userProfile()?.semester) { • Semester {{ auth.userProfile()?.semester }} }
          </p>
        </div>
        <div class="header-actions">
          <a routerLink="/student/results" class="btn-secondary">
            <i class="fa-solid fa-file-invoice"></i>
            <span>View Marksheet</span>
          </a>
          <a routerLink="/student/exams" class="gradient-btn">
            <i class="fa-solid fa-id-card"></i>
            <span>Download Admit Card</span>
          </a>
        </div>
      </div>

      <!-- Critical Defaulter Warning (<75% attendance when classes have taken place) -->
      @if (totalClassesConducted() > 0 && overallAttendance() < 75) {
        <div class="defaulter-alert glass-card">
          <div class="alert-icon-ring">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div class="alert-text">
            <h3>Attendance Shortage Notice: {{ overallAttendance() }}%</h3>
            <p>Your current attendance is below the mandatory 75% threshold required to appear in semester examinations. Please consult your course coordinator immediately.</p>
          </div>
          <a routerLink="/student/attendance" class="btn-danger alert-btn">
            <span>Review Shortfall</span>
            <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      }

      <!-- Key Student Metrics -->
      <div class="stat-grid">
        <app-stat-card 
          label="Attendance Rate" 
          [value]="overallAttendance() + '%'" 
          icon="fa-solid fa-calendar-check" 
          [iconBg]="overallAttendance() >= 75 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'" 
          [iconColor]="overallAttendance() >= 75 ? '#10b981' : '#ef4444'" 
          [subtext]="totalClassesConducted() > 0 ? (overallAttendance() >= 75 ? 'Above 75% requirement' : 'Defaulter Warning') : 'No classes recorded yet'" 
          [subtextClass]="totalClassesConducted() > 0 ? (overallAttendance() >= 75 ? 'positive' : 'negative') : 'warning'" 
          [trendIcon]="totalClassesConducted() > 0 ? (overallAttendance() >= 75 ? 'fa-solid fa-check' : 'fa-solid fa-triangle-exclamation') : 'fa-solid fa-circle-info'">
        </app-stat-card>

        <app-stat-card 
          label="Current SGPA" 
          [value]="latestSgpa()" 
          icon="fa-solid fa-award" 
          iconBg="rgba(124, 58, 237, 0.12)" 
          iconColor="#7c3aed" 
          [subtext]="latestSgpa() !== 'Pending' ? 'Scale: 10.0 Grade Points' : 'Pending Evaluation'" 
          [subtextClass]="latestSgpa() !== 'Pending' ? 'positive' : 'warning'">
        </app-stat-card>

        <app-stat-card 
          label="Upcoming Exams" 
          [value]="upcomingExams().length" 
          icon="fa-solid fa-stopwatch" 
          iconBg="rgba(6, 182, 212, 0.12)" 
          iconColor="#06b6d4" 
          subtext="Autumn Semester 2026">
        </app-stat-card>

        <app-stat-card 
          label="Published Grades" 
          [value]="marksRecords().length" 
          icon="fa-solid fa-square-poll-vertical" 
          iconBg="rgba(245, 158, 11, 0.12)" 
          iconColor="#f59e0b" 
          subtext="Verified by Faculty">
        </app-stat-card>
      </div>

      <!-- Main Columns: Upcoming Exams & Latest Notices -->
      <div class="dash-columns">
        <!-- Upcoming Exams Countdown Card -->
        <div class="column-card glass-card">
          <div class="col-header">
            <div>
              <h3 class="col-title"><i class="fa-solid fa-calendar-days text-primary"></i> Examination Timetable</h3>
              <p class="col-sub">Your scheduled university examinations</p>
            </div>
            <a routerLink="/student/exams" class="link-more">All Exams &rarr;</a>
          </div>

          <div class="exam-list">
            @for (ex of upcomingExams(); track ex.id) {
              <div class="exam-item">
                <div class="exam-date-box">
                  <span class="day">{{ ex.date | date:'dd' }}</span>
                  <span class="month">{{ ex.date | date:'MMM' }}</span>
                </div>
                <div class="exam-details">
                  <h4>{{ ex.subjectName }} ({{ ex.subjectCode }})</h4>
                  <p><i class="fa-regular fa-clock"></i> {{ ex.startTime }} - {{ ex.endTime }} • <i class="fa-solid fa-door-open"></i> {{ ex.roomNo }}</p>
                </div>
              </div>
            } @empty {
              <div class="empty-state">
                <i class="fa-solid fa-calendar-check empty-icon"></i>
                <p>No exams currently scheduled.</p>
              </div>
            }
          </div>
        </div>

        <!-- Latest Notices Card -->
        <div class="column-card glass-card">
          <div class="col-header">
            <div>
              <h3 class="col-title"><i class="fa-solid fa-bullhorn text-warning"></i> Campus Announcements</h3>
              <p class="col-sub">Official notifications from Administration and Faculty</p>
            </div>
            <a routerLink="/student/notices" class="link-more">All Notices &rarr;</a>
          </div>

          <div class="notice-list">
            @for (n of notices(); track n.id) {
              <div class="notice-snippet" [ngClass]="'snippet-' + n.priority">
                <div class="snippet-top">
                  <span class="badge" [ngClass]="'badge-' + (n.priority === 'urgent' ? 'danger' : 'info')">
                    {{ n.priority | uppercase }}
                  </span>
                  <span class="snippet-date">{{ n.createdAt | date:'shortDate' }}</span>
                </div>
                <h4 class="snippet-title">{{ n.title }}</h4>
                <p class="snippet-text">{{ n.content }}</p>
              </div>
            } @empty {
              <div class="empty-state">
                <i class="fa-solid fa-envelope-open empty-icon"></i>
                <p>No announcements at this time.</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .student-dash-container {
      padding: 1.5rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .welcome-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .welcome-sub {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-top: 0.2rem;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .defaulter-alert {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 1.5rem;
      border-left: 5px solid var(--danger);
      background: rgba(239, 68, 68, 0.05);
      border-radius: var(--radius-lg);
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
    }

    .alert-icon-ring {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--danger-light);
      color: var(--danger);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .alert-text {
      flex: 1;
      min-width: 260px;
    }

    .alert-text h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--danger);
    }

    .alert-text p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 0.2rem;
    }

    .alert-btn {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }

    .dash-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-top: 0.5rem;
    }

    @media (max-width: 960px) {
      .dash-columns {
        grid-template-columns: 1fr;
      }
    }

    .column-card {
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
    }

    .col-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1rem;
    }

    .col-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .col-sub {
      font-size: 0.825rem;
      color: var(--text-secondary);
      margin-top: 0.2rem;
    }

    .link-more {
      font-size: 0.825rem;
      font-weight: 600;
    }

    .exam-list, .notice-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .exam-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem;
      background: var(--bg-hover);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
    }

    .exam-date-box {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      background: var(--primary-gradient);
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      line-height: 1.1;
      flex-shrink: 0;
    }

    .exam-date-box .day {
      font-size: 1.1rem;
      font-weight: 800;
    }

    .exam-date-box .month {
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 700;
    }

    .exam-details h4 {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .exam-details p {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-top: 0.2rem;
    }

    .notice-snippet {
      padding: 1rem;
      border-radius: var(--radius-md);
      background: var(--bg-hover);
      border-left: 3px solid var(--border-color);
    }

    .snippet-urgent { border-left-color: var(--danger); }
    .snippet-important { border-left-color: var(--warning); }

    .snippet-top {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.4rem;
    }

    .snippet-date {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .snippet-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .snippet-text {
      font-size: 0.825rem;
      color: var(--text-secondary);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  public auth = inject(AuthService);
  private firestore = inject(FirestoreService);
  private refreshTimer: any = null;

  public overallAttendance = signal<number>(0);
  public totalClassesConducted = signal<number>(0);
  public latestSgpa = signal<string>('Pending');
  public upcomingExams = signal<ExamTimetable[]>([]);
  public marksRecords = signal<MarksRecord[]>([]);
  public notices = signal<Notice[]>([]);

  async ngOnInit(): Promise<void> {
    await this.loadData();

    // AJAX-style background auto-refresh every 4 seconds
    this.refreshTimer = setInterval(async () => {
      await this.loadData();
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  async loadData(): Promise<void> {
    const user = this.auth.userProfile();
    if (!user) return;

    // Load Student Attendance - Real Firestore count
    const attList = await this.firestore.getAttendanceForStudent(user.uid);
    this.totalClassesConducted.set(attList.length);
    if (attList.length > 0) {
      const attended = attList.filter(a => a.status === 'present' || a.status === 'late').length;
      this.overallAttendance.set(Math.round((attended / attList.length) * 100));
    } else {
      this.overallAttendance.set(0);
    }

    // Load Real Marks
    const marks = await this.firestore.getMarksForStudent(user.uid, true);
    this.marksRecords.set(marks);

    // Load Semester Result Sheet or calculate dynamic SGPA from published marks
    const sheet = await this.firestore.getStudentResultSheet(user.uid);
    if (sheet) {
      this.latestSgpa.set(sheet.sgpa.toFixed(2));
    } else if (marks.length > 0) {
      const avgPct = marks.reduce((sum, m) => sum + m.percentage, 0) / marks.length;
      this.latestSgpa.set((avgPct / 10).toFixed(2));
    } else {
      this.latestSgpa.set('Pending');
    }

    // Load Exams (matching student course if available)
    const exams = await this.firestore.getExamTimetables();
    const subjects = await this.firestore.getSubjects();
    const mySubjIds = subjects.filter(s => !user.courseId || s.courseId === user.courseId).map(s => s.id);
    const myExams = exams.filter(e => mySubjIds.includes(e.subjectId));
    this.upcomingExams.set(myExams.length > 0 ? myExams.slice(0, 3) : exams.slice(0, 3));

    // Load Notices
    const noticesList = await this.firestore.getNotices('student');
    this.notices.set(noticesList.slice(0, 3));
  }
}
