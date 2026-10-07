import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { Subject, UserProfile, MarksRecord, AttendanceRecord } from '../../../core/models';

interface StudentPerformanceRow {
  studentId: string;
  name: string;
  rollNo: string;
  email: string;
  totalClasses: number;
  attendedClasses: number;
  attendancePct: number;
  averageScorePct: number;
  isTopPerformer: boolean;
  isDefaulter: boolean;
}

/**
 * ====================================================================================
 * FACULTY STUDENT PERFORMANCE & ROSTER COMPONENT
 * ====================================================================================
 * Displays:
 * 1. Enrolled student roster with real database attendance and score averages.
 * 2. Pending Student Approvals Section: Allows Faculty to review & approve new student registrations.
 */
@Component({
  selector: 'app-faculty-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fac-students-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Enrolled Students & Performance Roster</h1>
          <p class="page-subtitle">Examine class attendance rates, score averages, and approve newly registered students</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tab-bar">
        <button 
          type="button" 
          class="tab-btn" 
          [class.active]="activeTab() === 'roster'" 
          (click)="activeTab.set('roster')">
          <i class="fa-solid fa-users"></i>
          <span>Enrolled Students ({{ roster().length }})</span>
        </button>

        <button 
          type="button" 
          class="tab-btn" 
          [class.active]="activeTab() === 'approvals'" 
          (click)="activeTab.set('approvals')">
          <i class="fa-solid fa-user-check"></i>
          <span>Student Approvals</span>
          @if (pendingStudents().length > 0) {
            <span class="badge badge-warning count-badge">{{ pendingStudents().length }}</span>
          }
        </button>
      </div>

      <!-- 1. Enrolled Students Tab -->
      @if (activeTab() === 'roster') {
        <!-- Subject & Search Bar -->
        <div class="toolbar glass-card">
          <div class="filter-item">
            <label class="filter-label">Select Subject:</label>
            <select [(ngModel)]="selectedSubjectId" (ngModelChange)="loadRoster()" class="form-control">
              @for (s of subjects(); track s.id) {
                <option [value]="s.id">{{ s.name }} ({{ s.code }})</option>
              }
            </select>
          </div>

          <div class="summary-metrics">
            <div class="metric-chip">
              <span>Active Students:</span>
              <strong>{{ roster().length }}</strong>
            </div>
            <div class="metric-chip">
              <span>Avg Attendance:</span>
              <strong>{{ classAvgAttendance() }}%</strong>
            </div>
            <div class="metric-chip">
              <span>Avg Score:</span>
              <strong class="text-primary">{{ classAvgScore() }}%</strong>
            </div>
          </div>
        </div>

        <!-- Roster Table -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student</th>
                <th>Attendance</th>
                <th>Average Score</th>
                <th>Academic Status</th>
              </tr>
            </thead>
            <tbody>
              @for (row of roster(); track row.studentId) {
                <tr>
                  <td><strong class="roll-badge">{{ row.rollNo }}</strong></td>
                  <td>
                    <div class="student-cell">
                      <div class="avatar-sm">{{ row.name.charAt(0).toUpperCase() }}</div>
                      <div>
                        <div class="st-name">{{ row.name }}</div>
                        <div class="st-email">{{ row.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    @if (row.totalClasses > 0) {
                      <div class="pct-bar-container">
                        <div class="pct-bar">
                          <div class="pct-fill" [style.width.%]="row.attendancePct" [ngClass]="row.attendancePct < 75 ? 'fill-danger' : 'fill-success'"></div>
                        </div>
                        <span class="pct-val" [class.text-danger]="row.attendancePct < 75">{{ row.attendancePct }}%</span>
                        <small class="text-muted">({{ row.attendedClasses }}/{{ row.totalClasses }})</small>
                      </div>
                    } @else {
                      <span class="text-muted">No classes held yet</span>
                    }
                  </td>
                  <td>
                    @if (row.averageScorePct > 0) {
                      <strong class="score-val">{{ row.averageScorePct }}%</strong>
                    } @else {
                      <span class="text-muted">No graded tests</span>
                    }
                  </td>
                  <td>
                    @if (row.isTopPerformer) {
                      <span class="badge badge-success"><i class="fa-solid fa-star"></i> Top Performer</span>
                    } @else if (row.isDefaulter) {
                      <span class="badge badge-danger"><i class="fa-solid fa-triangle-exclamation"></i> Low Attendance (&lt;75%)</span>
                    } @else {
                      <span class="badge badge-info">Regular Enrolled</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5">
                    <div class="empty-state">
                      <i class="fa-solid fa-users-slash empty-icon"></i>
                      <h3 class="empty-title">No Approved Students in Roster</h3>
                      <p class="empty-subtitle">Check the "Student Approvals" tab to authorize newly registered students.</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- 2. Student Approvals Tab -->
      @if (activeTab() === 'approvals') {
        <div class="approvals-section">
          <div class="info-notice glass-card">
            <i class="fa-solid fa-circle-info"></i>
            <div>
              <strong>Faculty Approval Desk</strong>
              <p>As subject faculty, you have authority to review and approve student admissions and account registrations for your department.</p>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Roll Number</th>
                  <th>Degree Course</th>
                  <th>Semester</th>
                  <th>Registered Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (st of pendingStudents(); track st.uid) {
                  <tr>
                    <td><strong>{{ st.displayName }}</strong></td>
                    <td>{{ st.email }}</td>
                    <td><span class="font-code text-primary">{{ st.rollNo || 'Pending' }}</span></td>
                    <td>{{ st.courseName || 'B.Tech Computer Science' }}</td>
                    <td>Semester {{ st.semester || 1 }}</td>
                    <td>{{ st.createdAt | date:'mediumDate' }}</td>
                    <td>
                      <button type="button" class="gradient-btn btn-sm" (click)="approveStudent(st)">
                        <i class="fa-solid fa-user-check"></i>
                        <span>Approve Student</span>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7">
                      <div class="empty-state">
                        <i class="fa-solid fa-clipboard-check empty-icon text-success"></i>
                        <h3 class="empty-title">All Student Applications Cleared</h3>
                        <p class="empty-subtitle">No pending student registrations currently awaiting approval.</p>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .fac-students-container {
      padding: 1.5rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 1.75rem;
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

    .tab-bar {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      border: none;
      background: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      transition: var(--transition);
    }

    .tab-btn.active {
      background: var(--primary-light);
      color: var(--primary);
    }

    .count-badge {
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
    }

    .toolbar {
      padding: 1.25rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .filter-item {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 280px;
    }

    .filter-label {
      font-size: 0.775rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .summary-metrics {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .metric-chip {
      background: var(--bg-hover);
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.825rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .roll-badge {
      font-family: 'Fira Code', monospace;
      color: var(--primary);
    }

    .student-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar-sm {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
    }

    .st-name {
      font-weight: 700;
      color: var(--text-primary);
    }

    .st-email {
      font-size: 0.775rem;
      color: var(--text-muted);
    }

    .pct-bar-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 180px;
    }

    .pct-bar {
      flex: 1;
      height: 8px;
      background: var(--bg-hover);
      border-radius: 4px;
      overflow: hidden;
    }

    .pct-fill {
      height: 100%;
      border-radius: 4px;
    }

    .fill-danger { background: var(--danger); }
    .fill-success { background: var(--success); }

    .pct-val {
      font-size: 0.825rem;
      font-weight: 700;
    }

    .score-val {
      font-size: 0.95rem;
      color: var(--text-primary);
    }

    .font-code {
      font-family: 'Fira Code', monospace;
    }

    .info-notice {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-left: 4px solid var(--info);
      margin-bottom: 1.5rem;
      border-radius: var(--radius-md);
    }

    .info-notice i {
      font-size: 1.5rem;
      color: var(--info);
    }

    .info-notice p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 0.2rem;
    }

    .btn-sm {
      padding: 0.4rem 0.85rem;
      font-size: 0.8rem;
      min-height: 34px;
    }

    .text-muted { color: var(--text-muted); font-size: 0.8rem; }
  `]
})
export class FacultyStudentsComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private firestore = inject(FirestoreService);
  private toast = inject(ToastService);
  private refreshTimer: any = null;

  public activeTab = signal<'roster' | 'approvals'>('roster');
  public subjects = signal<Subject[]>([]);
  public selectedSubjectId = '';
  public roster = signal<StudentPerformanceRow[]>([]);
  public pendingStudents = signal<UserProfile[]>([]);

  public classAvgAttendance = signal<number>(0);
  public classAvgScore = signal<number>(0);

  async ngOnInit(): Promise<void> {
    const user = this.auth.userProfile();
    // Only show subjects taught by this faculty
    const allSubjects = await this.firestore.getSubjects();
    const mySubjects = user ? allSubjects.filter(s => s.facultyId === user.uid) : allSubjects;
    this.subjects.set(mySubjects);
    if (mySubjects.length > 0) {
      this.selectedSubjectId = mySubjects[0].id;
    }
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
    await this.loadPendingStudents();
    await this.loadRoster();
  }

  async loadPendingStudents(): Promise<void> {
    const allUsers = await this.firestore.getAllUsers();
    const pending = allUsers.filter(u => u.role === 'student' && !u.approved);
    this.pendingStudents.set(pending);
  }

  async approveStudent(student: UserProfile): Promise<void> {
    await this.firestore.updateUserStatus(student.uid, 'active', true);
    this.toast.success(`Student ${student.displayName} (${student.rollNo || ''}) has been approved by Faculty!`);
    await this.loadAll();
  }

  async loadRoster(): Promise<void> {
    const allUsers = await this.firestore.getAllUsers();
    // Only approved students appear in official active roster
    const approvedStudents = allUsers.filter(u => u.role === 'student' && u.approved);
    // Scope students to the faculty's subject courses
    const mySubjCourseIds = this.subjects().map(s => s.courseId).filter(Boolean);
    const scopedStudents = mySubjCourseIds.length > 0
      ? approvedStudents.filter(st => !st.courseId || mySubjCourseIds.includes(st.courseId!))
      : approvedStudents;
    const marks = await this.firestore.getAllMarks();
    const attendance = await this.firestore.getAllAttendance();

    let totalAttPcts = 0;
    let totalScorePcts = 0;
    let studentsWithAtt = 0;
    let studentsWithMarks = 0;

    const rows: StudentPerformanceRow[] = scopedStudents.map(st => {
      // Find marks for this student (filtered by selected subject if available)
      const stMarks = marks.filter(m => m.studentId === st.uid && (!this.selectedSubjectId || m.subjectId === this.selectedSubjectId));
      const avgScore = stMarks.length > 0
        ? Math.round(stMarks.reduce((acc, m) => acc + m.percentage, 0) / stMarks.length)
        : 0;

      if (stMarks.length > 0) {
        totalScorePcts += avgScore;
        studentsWithMarks++;
      }

      // Find real attendance records for this student and subject
      const stAtt = attendance.filter(a => a.studentId === st.uid && (!this.selectedSubjectId || a.subjectId === this.selectedSubjectId));
      const totalDays = stAtt.length;
      const presentDays = stAtt.filter(a => a.status === 'present' || a.status === 'late').length;
      const attPct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      if (totalDays > 0) {
        totalAttPcts += attPct;
        studentsWithAtt++;
      }

      return {
        studentId: st.uid,
        name: st.displayName,
        rollNo: st.rollNo || 'Pending',
        email: st.email,
        totalClasses: totalDays,
        attendedClasses: presentDays,
        attendancePct: attPct,
        averageScorePct: avgScore,
        isTopPerformer: avgScore >= 85,
        isDefaulter: totalDays > 0 && attPct < 75
      };
    });

    this.classAvgAttendance.set(studentsWithAtt > 0 ? Math.round(totalAttPcts / studentsWithAtt) : 0);
    this.classAvgScore.set(studentsWithMarks > 0 ? Math.round(totalScorePcts / studentsWithMarks) : 0);
    this.roster.set(rows);
  }
}
