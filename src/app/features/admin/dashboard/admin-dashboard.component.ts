import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { UserProfile, Course, Subject, AttendanceRecord, MarksRecord } from '../../../core/models';

/**
 * ====================================================================================
 * ADMIN ANALYTICS DASHBOARD COMPONENT
 * ====================================================================================
 * Primary cockpit for academic administrators:
 * - Real-time statistics: Total Students, Total Faculty, Active Courses, Pending Approvals
 * - Dynamic SVG Charts: Attendance Trend & Grade Distribution
 * - Immediate Action Panel for pending faculty verification
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent],
  template: `
    <div class="dashboard-container">
      <!-- Dashboard Header -->
      <div class="dash-header">
        <div>
          <h1 class="dash-title">Academic Administration Cockpit</h1>
          <p class="dash-subtitle">Overview of campus analytics, user accounts, and institutional metrics</p>
        </div>
        <div class="dash-actions">
          <a routerLink="/admin/students" class="btn-secondary">
            <i class="fa-solid fa-user-plus"></i>
            <span>Add Student</span>
          </a>
          <a routerLink="/admin/courses" class="gradient-btn">
            <i class="fa-solid fa-plus"></i>
            <span>New Course</span>
          </a>
        </div>
      </div>

      <!-- KPI Stat Cards Grid -->
      <div class="stat-grid">
        <app-stat-card 
          label="Total Students" 
          [value]="studentCount()" 
          icon="fa-solid fa-user-graduate" 
          iconBg="rgba(16, 185, 129, 0.12)" 
          iconColor="#10b981" 
          subtext="Active Enrolled" 
          subtextClass="positive" 
          trendIcon="fa-solid fa-circle-check">
        </app-stat-card>

        <app-stat-card 
          label="Faculty Members" 
          [value]="facultyCount()" 
          icon="fa-solid fa-chalkboard-user" 
          iconBg="rgba(6, 182, 212, 0.12)" 
          iconColor="#06b6d4" 
          subtext="Assigned to courses" 
          trendIcon="fa-solid fa-book">
        </app-stat-card>

        <app-stat-card 
          label="Active Courses" 
          [value]="courseCount()" 
          icon="fa-solid fa-graduation-cap" 
          iconBg="rgba(124, 58, 237, 0.12)" 
          iconColor="#7c3aed" 
          subtext="UG & PG Programs">
        </app-stat-card>

        <app-stat-card 
          label="Pending Approvals" 
          [value]="pendingFaculty().length + pendingStudents().length" 
          icon="fa-solid fa-user-clock" 
          iconBg="rgba(245, 158, 11, 0.12)" 
          iconColor="#f59e0b" 
          [subtext]="(pendingFaculty().length + pendingStudents().length) > 0 ? 'Action Required' : 'All Approved'" 
          [subtextClass]="(pendingFaculty().length + pendingStudents().length) > 0 ? 'warning' : 'positive'" 
          [trendIcon]="(pendingFaculty().length + pendingStudents().length) > 0 ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-check'">
        </app-stat-card>
      </div>

      <!-- Analytical Charts Section -->
      <div class="charts-grid">
        <!-- 1. Campus Attendance Trends -->
        <div class="chart-card glass-card">
          <div class="card-head">
            <div>
              <h3 class="card-title">Campus Attendance Analytics</h3>
              <p class="card-desc">Overall student attendance records recorded across all departments</p>
            </div>
            <span class="badge badge-success">Avg Presence: {{ campusAttendanceRate() }}%</span>
          </div>

          <div class="chart-wrapper">
            <div class="attendance-summary-box">
              <div class="att-stat">
                <span class="att-num">{{ campusAttendanceRate() }}%</span>
                <span class="att-sub">Overall Presence Rate</span>
              </div>
              <div class="att-meta">
                <p><i class="fa-solid fa-clipboard-check text-success"></i> <strong>{{ totalAttendanceRecords() }}</strong> total student session registers</p>
                <p><i class="fa-solid fa-circle-check text-primary"></i> Minimum required target is 75% for exam eligibility</p>
              </div>
            </div>

            <div class="chart-labels">
              <span>Status: {{ campusAttendanceRate() >= 75 ? 'Optimal Compliance' : (totalAttendanceRecords() > 0 ? 'Shortage Alert' : 'No registers logged') }}</span>
              <span class="text-primary font-code">{{ totalAttendanceRecords() }} records</span>
            </div>
          </div>
        </div>

        <!-- 2. Academic Performance Distribution (CSS Bar Chart) -->
        <div class="chart-card glass-card">
          <div class="card-head">
            <div>
              <h3 class="card-title">Grade Performance Breakdown</h3>
              <p class="card-desc">Assessment score distribution across all tests ({{ totalGraded() }} graded)</p>
            </div>
            <span class="badge badge-primary">Current Session</span>
          </div>

          <div class="distribution-bars">
            @if (totalGraded() > 0) {
              <div class="bar-row">
                <span class="bar-label">Grade A+ (90-100%)</span>
                <div class="bar-track">
                  <div class="bar-fill fill-aplus" [style.width.%]="pctAplus()"></div>
                </div>
                <span class="bar-val">{{ pctAplus() }}%</span>
              </div>

              <div class="bar-row">
                <span class="bar-label">Grade A (80-89%)</span>
                <div class="bar-track">
                  <div class="bar-fill fill-a" [style.width.%]="pctA()"></div>
                </div>
                <span class="bar-val">{{ pctA() }}%</span>
              </div>

              <div class="bar-row">
                <span class="bar-label">Grade B (60-79%)</span>
                <div class="bar-track">
                  <div class="bar-fill fill-b" [style.width.%]="pctB()"></div>
                </div>
                <span class="bar-val">{{ pctB() }}%</span>
              </div>

              <div class="bar-row">
                <span class="bar-label">Grade C (40-59%)</span>
                <div class="bar-track">
                  <div class="bar-fill fill-c" [style.width.%]="pctC()"></div>
                </div>
                <span class="bar-val">{{ pctC() }}%</span>
              </div>

              <div class="bar-row">
                <span class="bar-label">Grade F (&lt;40% Fail)</span>
                <div class="bar-track">
                  <div class="bar-fill fill-f" [style.width.%]="pctF()"></div>
                </div>
                <span class="bar-val text-danger">{{ pctF() }}%</span>
              </div>
            } @else {
              <div class="empty-state py-4">
                <i class="fa-solid fa-square-poll-vertical empty-icon"></i>
                <p>No assessment grades recorded yet. Scores will populate as faculty publish test marks.</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Pending Faculty Approvals Section -->
      @if (pendingFaculty().length > 0) {
        <div class="pending-section glass-card">
          <div class="section-header">
            <div>
              <h3 class="card-title text-warning">
                <i class="fa-solid fa-user-clock"></i> Faculty Applications Requiring Approval
              </h3>
              <p class="card-desc">These faculty members registered and are awaiting authorization to access their teacher portal.</p>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Faculty Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Registered On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (f of pendingFaculty(); track f.uid) {
                  <tr>
                    <td><strong>{{ f.displayName }}</strong></td>
                    <td>{{ f.email }}</td>
                    <td>{{ f.department || 'Computer Science' }}</td>
                    <td>{{ f.designation || 'Lecturer' }}</td>
                    <td>{{ f.createdAt | date:'mediumDate' }}</td>
                    <td>
                      <button type="button" class="gradient-btn approve-btn" (click)="approveFaculty(f)">
                        <i class="fa-solid fa-check"></i>
                        <span>Approve Faculty</span>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Pending Student Registrations Section -->
      @if (pendingStudents().length > 0) {
        <div class="pending-section student-pending glass-card mt-4">
          <div class="section-header">
            <div>
              <h3 class="card-title text-info">
                <i class="fa-solid fa-user-graduate"></i> Student Registrations Requiring Approval
              </h3>
              <p class="card-desc">Students registered online. Administrator or Subject Faculty can approve their accounts.</p>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Roll No</th>
                  <th>Course</th>
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
                    <td><span class="font-code">{{ st.rollNo || 'Pending' }}</span></td>
                    <td>{{ st.courseName || 'B.Tech CSE' }}</td>
                    <td>Semester {{ st.semester || 1 }}</td>
                    <td>{{ st.createdAt | date:'mediumDate' }}</td>
                    <td>
                      <button type="button" class="gradient-btn approve-btn" (click)="approveStudent(st)">
                        <i class="fa-solid fa-user-check"></i>
                        <span>Approve Student</span>
                      </button>
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
    .dashboard-container {
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

    .dash-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .dash-subtitle {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-top: 0.2rem;
    }

    .dash-actions {
      display: flex;
      gap: 0.75rem;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 960px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }

    .chart-card {
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
    }

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .card-desc {
      font-size: 0.825rem;
      color: var(--text-secondary);
      margin-top: 0.2rem;
    }

    .chart-wrapper {
      margin-top: auto;
    }

    .trend-chart-svg {
      width: 100%;
      height: 150px;
      overflow: visible;
    }

    .chart-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-top: 0.75rem;
    }

    .distribution-bars {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .bar-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.825rem;
    }

    .bar-label {
      width: 150px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .bar-track {
      flex: 1;
      height: 10px;
      background: var(--bg-hover);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: var(--radius-full);
      transition: width 1s ease-in-out;
    }

    .fill-aplus { background: linear-gradient(90deg, #10b981, #059669); }
    .fill-a { background: linear-gradient(90deg, #4f46e5, #7c3aed); }
    .fill-b { background: linear-gradient(90deg, #06b6d4, #0284c7); }
    .fill-c { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .fill-f { background: linear-gradient(90deg, #ef4444, #dc2626); }

    .bar-val {
      width: 40px;
      text-align: right;
      font-weight: 700;
      color: var(--text-primary);
    }

    .pending-section {
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      border-left: 4px solid var(--warning);
    }

    .section-header {
      margin-bottom: 1.25rem;
    }

    .approve-btn {
      padding: 0.4rem 0.85rem;
      font-size: 0.8rem;
      min-height: 36px;
    }

    .attendance-summary-box {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem 0;
      flex-wrap: wrap;
    }

    .att-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem 1.5rem;
      background: var(--bg-hover);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      min-width: 140px;
    }

    .att-num {
      font-size: 2.2rem;
      font-weight: 900;
      color: var(--primary);
      line-height: 1;
    }

    .att-sub {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-top: 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .att-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .att-meta p {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private firestore = inject(FirestoreService);
  private toast = inject(ToastService);
  private refreshTimer: any = null;

  public studentCount = signal<number>(0);
  public facultyCount = signal<number>(0);
  public courseCount = signal<number>(0);
  public pendingFaculty = signal<UserProfile[]>([]);
  public pendingStudents = signal<UserProfile[]>([]);

  // Real Database Analytics Signals
  public campusAttendanceRate = signal<number>(0);
  public totalAttendanceRecords = signal<number>(0);
  public totalGraded = signal<number>(0);
  public pctAplus = signal<number>(0);
  public pctA = signal<number>(0);
  public pctB = signal<number>(0);
  public pctC = signal<number>(0);
  public pctF = signal<number>(0);

  async ngOnInit(): Promise<void> {
    await this.loadMetrics();
    // AJAX-style auto-refresh every 4 seconds in background
    this.refreshTimer = setInterval(async () => {
      await this.loadMetrics();
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  async loadMetrics(): Promise<void> {
    const allUsers = await this.firestore.getAllUsers();
    const students = allUsers.filter(u => u.role === 'student');
    const faculty = allUsers.filter(u => u.role === 'faculty');
    const pendingFac = faculty.filter(f => !f.approved);
    const pendingStud = students.filter(s => !s.approved);
    const courses = await this.firestore.getCourses();

    this.studentCount.set(students.length);
    this.facultyCount.set(faculty.length);
    this.pendingFaculty.set(pendingFac);
    this.pendingStudents.set(pendingStud);
    this.courseCount.set(courses.length);

    // Calculate real attendance metrics
    const allAttendance = await this.firestore.getAllAttendance();
    this.totalAttendanceRecords.set(allAttendance.length);
    if (allAttendance.length > 0) {
      const presentCount = allAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
      this.campusAttendanceRate.set(Math.round((presentCount / allAttendance.length) * 100));
    } else {
      this.campusAttendanceRate.set(0);
    }

    // Calculate real assessment grade distribution
    const allMarks = await this.firestore.getAllMarks();
    this.totalGraded.set(allMarks.length);
    if (allMarks.length > 0) {
      this.pctAplus.set(Math.round((allMarks.filter(m => m.percentage >= 90).length / allMarks.length) * 100));
      this.pctA.set(Math.round((allMarks.filter(m => m.percentage >= 80 && m.percentage < 90).length / allMarks.length) * 100));
      this.pctB.set(Math.round((allMarks.filter(m => m.percentage >= 60 && m.percentage < 80).length / allMarks.length) * 100));
      this.pctC.set(Math.round((allMarks.filter(m => m.percentage >= 40 && m.percentage < 60).length / allMarks.length) * 100));
      this.pctF.set(Math.round((allMarks.filter(m => m.percentage < 40).length / allMarks.length) * 100));
    } else {
      this.pctAplus.set(0);
      this.pctA.set(0);
      this.pctB.set(0);
      this.pctC.set(0);
      this.pctF.set(0);
    }
  }

  async approveFaculty(faculty: UserProfile): Promise<void> {
    await this.firestore.updateUserStatus(faculty.uid, 'active', true);
    this.toast.success(`Faculty member ${faculty.displayName} has been approved!`);
    await this.loadMetrics();
  }

  async approveStudent(student: UserProfile): Promise<void> {
    await this.firestore.updateUserStatus(student.uid, 'active', true);
    this.toast.success(`Student ${student.displayName} (${student.rollNo || ''}) has been approved by Administrator!`);
    await this.loadMetrics();
  }
}
