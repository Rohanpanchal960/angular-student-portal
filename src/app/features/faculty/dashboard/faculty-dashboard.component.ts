import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { Subject, Assessment, UserProfile, AttendanceRecord, ExamTimetable } from '../../../core/models';

/**
 * ====================================================================================
 * FACULTY DASHBOARD COMPONENT (CRM ACCURATE & DYNAMIC)
 * ====================================================================================
 * Displays 100% real database metrics for the logged-in faculty member:
 * - Real assigned subjects (with capability to claim/assign unassigned subjects)
 * - Actual students enrolled
 * - Real active assessments created by this faculty
 * - Actual attendance percentage calculated from real class registers
 * - Real examination & lecture schedule
 */
@Component({
  selector: 'app-faculty-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent],
  template: `
    <div class="faculty-dash-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Faculty Academic Workspace</h1>
          <p class="page-subtitle">Welcome back, <strong>{{ auth.userProfile()?.displayName }}</strong> ({{ auth.userProfile()?.department || 'Faculty Member' }})</p>
        </div>
        <div class="header-actions">
          <a routerLink="/faculty/attendance" class="gradient-btn">
            <i class="fa-solid fa-clipboard-user"></i>
            <span>Take Class Attendance</span>
          </a>
        </div>
      </div>

      <!-- Real Dynamic Metrics Cards -->
      <div class="stat-grid">
        <app-stat-card 
          label="My Assigned Subjects" 
          [value]="assignedSubjects().length" 
          icon="fa-solid fa-book-open" 
          iconBg="rgba(79, 70, 229, 0.12)" 
          iconColor="#4f46e5" 
          subtext="Active in curriculum">
        </app-stat-card>

        <app-stat-card 
          label="Approved Students" 
          [value]="enrolledStudentCount()" 
          icon="fa-solid fa-users" 
          iconBg="rgba(16, 185, 129, 0.12)" 
          iconColor="#10b981" 
          subtext="Under your courses">
        </app-stat-card>

        <app-stat-card 
          label="My Assessments" 
          [value]="assessments().length" 
          icon="fa-solid fa-pen-ruler" 
          iconBg="rgba(6, 182, 212, 0.12)" 
          iconColor="#06b6d4" 
          subtext="Tests & Quizzes created">
        </app-stat-card>

        <app-stat-card 
          label="Class Attendance Rate" 
          [value]="avgAttendanceRate() + '%'" 
          icon="fa-solid fa-chart-line" 
          [iconBg]="avgAttendanceRate() >= 75 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)'" 
          [iconColor]="avgAttendanceRate() >= 75 ? '#10b981' : '#f59e0b'" 
          [subtext]="totalClassesMarked() > 0 ? (totalClassesMarked() + ' registers recorded') : 'No classes marked yet'" 
          [subtextClass]="avgAttendanceRate() >= 75 ? 'positive' : 'warning'" 
          [trendIcon]="avgAttendanceRate() >= 75 ? 'fa-solid fa-check' : 'fa-solid fa-circle-info'">
        </app-stat-card>
      </div>

      <!-- Assigned Subjects Section -->
      <div class="section-header-row">
        <div class="section-title">
          <i class="fa-solid fa-layer-group"></i>
          <span>My Teaching Subjects ({{ assignedSubjects().length }})</span>
        </div>
        <button type="button" class="btn-claim" (click)="toggleClaimModal()">
          <i class="fa-solid fa-plus"></i>
          <span>Assign / Link Subject</span>
        </button>
      </div>

      <div class="subjects-grid">
        @for (s of assignedSubjects(); track s.id) {
          <div class="subject-card glass-card">
            <div class="sub-header">
              <span class="code-badge">{{ s.code }}</span>
              <span class="credits-badge">{{ s.credits }} Credits</span>
            </div>

            <h3 class="sub-name">{{ s.name }}</h3>
            <p class="sub-course">{{ s.courseName || 'Degree Course' }} - Semester {{ s.semester }}</p>

            <div class="sub-actions">
              <a [routerLink]="['/faculty/attendance']" [queryParams]="{ subjectId: s.id }" class="btn-sub">
                <i class="fa-solid fa-clipboard-user"></i> Attendance
              </a>
              <a [routerLink]="['/faculty/assessments']" [queryParams]="{ subjectId: s.id }" class="btn-sub">
                <i class="fa-solid fa-pen-to-square"></i> Marks Grid
              </a>
              <a [routerLink]="['/faculty/students']" [queryParams]="{ subjectId: s.id }" class="btn-sub">
                <i class="fa-solid fa-users"></i> Students
              </a>
            </div>
          </div>
        } @empty {
          <div class="empty-state glass-card no-subjects-box">
            <i class="fa-solid fa-book-open-reader empty-icon"></i>
            <h3 class="empty-title">No Subjects Linked To Your Profile Yet</h3>
            <p class="empty-subtitle">You have registered recently! Click "Assign / Link Subject" above to select a curriculum subject to teach.</p>
            <button type="button" class="gradient-btn mt-3" (click)="toggleClaimModal()">
              <i class="fa-solid fa-link"></i>
              <span>Link Available Subject</span>
            </button>
          </div>
        }
      </div>

      <!-- Schedule Timeline (From Real Exam & Subject Timetable) -->
      <div class="section-title mt-4">
        <i class="fa-regular fa-calendar-check"></i>
        <span>Scheduled Sessions & Examination Duties</span>
      </div>

      <div class="schedule-timeline glass-card">
        @for (item of upcomingDuties(); track item.id) {
          <div class="schedule-item">
            <div class="time-col">
              <span class="duty-date">{{ item.date }}</span>
              <span class="duty-time">{{ item.startTime }} - {{ item.endTime }}</span>
            </div>
            <div class="line-dot"></div>
            <div class="details-col">
              <h4>{{ item.subjectName }} ({{ item.subjectCode }})</h4>
              <p><i class="fa-solid fa-door-open"></i> {{ item.roomNo }} • {{ item.examName }}</p>
            </div>
          </div>
        } @empty {
          <div class="empty-schedule">
            <i class="fa-solid fa-calendar-check text-success"></i>
            <span>No upcoming invigilation or exam duties scheduled for your subjects.</span>
          </div>
        }
      </div>

      <!-- Subject Claiming Modal -->
      @if (isClaimModalOpen()) {
        <div class="modal-overlay" (click)="isClaimModalOpen.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">Link Subject to Your Teaching Profile</h2>
              <button type="button" class="btn-icon" (click)="isClaimModalOpen.set(false)"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="modal-body">
              <p class="modal-instruction">Select any available academic subject from the curriculum to teach:</p>
              
              <div class="subject-picker-list">
                @for (sub of allAvailableSubjects(); track sub.id) {
                  <div class="picker-item">
                    <div class="picker-meta">
                      <strong>{{ sub.name }} ({{ sub.code }})</strong>
                      <small>{{ sub.courseName || 'Curriculum' }} - Semester {{ sub.semester }} • Current: {{ sub.facultyName || 'Unassigned' }}</small>
                    </div>
                    <button type="button" class="gradient-btn btn-claim-action" (click)="claimSubject(sub)">
                      <i class="fa-solid fa-check"></i> Teach This Subject
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .faculty-dash-container {
      padding: 1.5rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.75rem;
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

    .section-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .btn-claim {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.8rem;
      font-weight: 600;
      background: var(--primary-light);
      color: var(--primary);
      border: 1px solid rgba(79, 70, 229, 0.3);
      cursor: pointer;
      transition: var(--transition);
    }

    .btn-claim:hover {
      background: rgba(79, 70, 229, 0.2);
    }

    .mt-4 { margin-top: 2rem; }
    .mt-3 { margin-top: 1rem; }

    .subjects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    .no-subjects-box {
      grid-column: 1 / -1;
      padding: 2.5rem;
      text-align: center;
    }

    .subject-card {
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
    }

    .sub-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .code-badge {
      font-family: 'Fira Code', monospace;
      font-weight: 700;
      font-size: 0.8rem;
      background: var(--primary-light);
      color: var(--primary);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
    }

    .credits-badge {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .sub-name {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .sub-course {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 0.2rem;
      margin-bottom: 1.25rem;
    }

    .sub-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: auto;
      flex-wrap: wrap;
    }

    .btn-sub {
      flex: 1;
      min-width: 80px;
      padding: 0.45rem 0.65rem;
      border-radius: var(--radius-md);
      font-size: 0.775rem;
      font-weight: 600;
      background: var(--bg-hover);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      border: 1px solid var(--border-color);
      transition: var(--transition);
    }

    .btn-sub:hover {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }

    .schedule-timeline {
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .schedule-item {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
    }

    .time-col {
      width: 170px;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .duty-date {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--primary);
    }

    .duty-time {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .line-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--primary);
      margin-top: 0.3rem;
      box-shadow: 0 0 8px var(--primary-glow);
    }

    .details-col h4 {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .details-col p {
      font-size: 0.825rem;
      color: var(--text-secondary);
      margin-top: 0.15rem;
    }

    .empty-schedule {
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title { font-size: 1.2rem; font-weight: 800; }
    .modal-body { padding: 1.5rem; }
    .modal-instruction { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem; }

    .subject-picker-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 380px;
      overflow-y: auto;
    }

    .picker-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-hover);
    }

    .picker-meta {
      display: flex;
      flex-direction: column;
    }

    .picker-meta strong { font-size: 0.9rem; color: var(--text-primary); }
    .picker-meta small { font-size: 0.75rem; color: var(--text-muted); }

    .btn-claim-action {
      padding: 0.4rem 0.85rem;
      font-size: 0.775rem;
      min-height: 34px;
    }
  `]
})
export class FacultyDashboardComponent implements OnInit, OnDestroy {
  public auth = inject(AuthService);
  private firestore = inject(FirestoreService);
  private toast = inject(ToastService);
  private refreshTimer: any = null;

  public assignedSubjects = signal<Subject[]>([]);
  public allAvailableSubjects = signal<Subject[]>([]);
  public enrolledStudentCount = signal<number>(0);
  public assessments = signal<Assessment[]>([]);
  public upcomingDuties = signal<ExamTimetable[]>([]);

  public avgAttendanceRate = signal<number>(0);
  public totalClassesMarked = signal<number>(0);

  public isClaimModalOpen = signal<boolean>(false);

  async ngOnInit(): Promise<void> {
    await this.loadAll();

    // AJAX-style background auto-refresh every 4 seconds
    this.refreshTimer = setInterval(async () => {
      await this.loadAll();
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  async loadAll(): Promise<void> {
    const user = this.auth.userProfile();
    if (!user) return;

    // 1. Fetch real subjects linked to this faculty
    const subjects = await this.firestore.getSubjects();
    this.allAvailableSubjects.set(subjects);

    const mySubjects = subjects.filter(s => s.facultyId === user.uid);
    this.assignedSubjects.set(mySubjects);

    // 2. Fetch real approved students under faculty's subjects/courses
    const allUsers = await this.firestore.getAllUsers();
    const approvedStudents = allUsers.filter(u => u.role === 'student' && u.approved);
    if (mySubjects.length > 0) {
      const myCourseIds = mySubjects.map(s => s.courseId).filter(Boolean);
      const myStudents = approvedStudents.filter(st => !st.courseId || myCourseIds.includes(st.courseId));
      this.enrolledStudentCount.set(myStudents.length);
    } else {
      this.enrolledStudentCount.set(0);
    }

    // 3. Fetch real assessments created by this faculty member
    const asmtList = await this.firestore.getAssessments();
    const myAssessments = asmtList.filter(a => a.facultyId === user.uid);
    this.assessments.set(myAssessments);

    // 4. Calculate actual real attendance marked by this faculty
    const allAttendance = await this.firestore.getAllAttendance();
    const myAttendance = allAttendance.filter(a => a.facultyId === user.uid);
    this.totalClassesMarked.set(myAttendance.length);

    if (myAttendance.length > 0) {
      const presentCount = myAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
      this.avgAttendanceRate.set(Math.round((presentCount / myAttendance.length) * 100));
    } else {
      this.avgAttendanceRate.set(0);
    }

    // 5. Fetch real exam schedule for faculty's subjects (no mock duties from other teachers)
    const exams = await this.firestore.getExamTimetables();
    const myDuties = exams.filter(e => mySubjects.some(s => s.id === e.subjectId));
    this.upcomingDuties.set(myDuties);
  }

  toggleClaimModal(): void {
    this.isClaimModalOpen.update(v => !v);
  }

  async claimSubject(subject: Subject): Promise<void> {
    const user = this.auth.userProfile();
    if (!user) return;

    const updated: Subject = {
      ...subject,
      facultyId: user.uid,
      facultyName: user.displayName
    };

    await this.firestore.saveSubject(updated);
    this.toast.success(`You are now the instructor for ${subject.name} (${subject.code})!`);
    this.isClaimModalOpen.set(false);
    await this.loadAll();
  }
}
