import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { Subject, UserProfile, AttendanceRecord, AttendanceStatus } from '../../../core/models';

interface StudentAttendanceRow {
  studentId: string;
  studentName: string;
  rollNo: string;
  status: AttendanceStatus;
  remarks?: string;
}

/**
 * ====================================================================================
 * FACULTY ATTENDANCE MARKING & EDITING COMPONENT
 * ====================================================================================
 * High-performance roll-call attendance sheet:
 * - Doc ID Scheme: `${subjectId}_${date}_${studentId}`
 * - Interactive Present / Absent / Late toggle buttons
 * - Bulk actions: "Mark All Present", "Mark All Absent"
 * - Past dates retrospective modification
 * - Real-time compliance counter
 */
@Component({
  selector: 'app-faculty-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="attendance-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Class Attendance Register</h1>
          <p class="page-subtitle">Record daily attendance, modify past session registers, and track compliance</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn-secondary" (click)="markAll('present')">
            <i class="fa-solid fa-check-double text-success"></i>
            <span>Mark All Present</span>
          </button>
          <button type="button" class="btn-secondary" (click)="markAll('absent')">
            <i class="fa-solid fa-ban text-danger"></i>
            <span>Mark All Absent</span>
          </button>
          <button type="button" class="gradient-btn" (click)="saveAttendance()" [disabled]="isSaving()">
            @if (isSaving()) {
              <i class="fa-solid fa-spinner fa-spin"></i>
              <span>Saving...</span>
            } @else {
              <i class="fa-solid fa-floppy-disk"></i>
              <span>Save Register</span>
            }
          </button>
        </div>
      </div>

      <!-- Controls Toolbar (Subject & Date Selectors) -->
      <div class="toolbar glass-card">
        <div class="field-item">
          <label class="toolbar-label">Academic Subject:</label>
          <select [(ngModel)]="selectedSubjectId" (ngModelChange)="onSelectionChange()" class="form-control">
            @for (s of subjects(); track s.id) {
              <option [value]="s.id">{{ s.name }} ({{ s.code }})</option>
            }
          </select>
        </div>

        <div class="field-item">
          <label class="toolbar-label">Attendance Date:</label>
          <input 
            type="date" 
            [(ngModel)]="selectedDate" 
            (ngModelChange)="onSelectionChange()" 
            class="form-control date-input" />
        </div>

        <div class="stats-pills">
          <div class="pill pill-present">
            <span>Present:</span>
            <strong>{{ countByStatus('present') }}</strong>
          </div>
          <div class="pill pill-absent">
            <span>Absent:</span>
            <strong>{{ countByStatus('absent') }}</strong>
          </div>
          <div class="pill pill-late">
            <span>Late:</span>
            <strong>{{ countByStatus('late') }}</strong>
          </div>
        </div>
      </div>

      <!-- Attendance Table Register -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 140px">Roll Number</th>
              <th>Student Name</th>
              <th style="width: 320px; text-align: center">Attendance Status</th>
              <th>Remarks / Note</th>
            </tr>
          </thead>
          <tbody>
            @for (row of studentRows(); track row.studentId) {
              <tr>
                <td><strong class="roll-badge">{{ row.rollNo }}</strong></td>
                <td>
                  <div class="student-name-cell">
                    <div class="avatar-tiny">{{ row.studentName.charAt(0).toUpperCase() }}</div>
                    <span>{{ row.studentName }}</span>
                  </div>
                </td>
                <td>
                  <div class="status-btn-group">
                    <button 
                      type="button" 
                      class="btn-status btn-status-present" 
                      [class.active]="row.status === 'present'"
                      (click)="setStatus(row, 'present')">
                      <i class="fa-solid fa-check"></i> Present
                    </button>

                    <button 
                      type="button" 
                      class="btn-status btn-status-late" 
                      [class.active]="row.status === 'late'"
                      (click)="setStatus(row, 'late')">
                      <i class="fa-regular fa-clock"></i> Late
                    </button>

                    <button 
                      type="button" 
                      class="btn-status btn-status-absent" 
                      [class.active]="row.status === 'absent'"
                      (click)="setStatus(row, 'absent')">
                      <i class="fa-solid fa-xmark"></i> Absent
                    </button>
                  </div>
                </td>
                <td>
                  <input 
                    type="text" 
                    [(ngModel)]="row.remarks" 
                    class="form-control remark-input" 
                    placeholder="Optional note..." />
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4">
                  <div class="empty-state">
                    <i class="fa-solid fa-users-slash empty-icon"></i>
                    <h3 class="empty-title">No Enrolled Students</h3>
                    <p class="empty-subtitle">Select a subject with enrolled students to populate the attendance register.</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .attendance-container {
      padding: 1.5rem 2rem;
      max-width: 1300px;
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

    .header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .toolbar {
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .field-item {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 240px;
    }

    .toolbar-label {
      font-size: 0.775rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .stats-pills {
      margin-left: auto;
      display: flex;
      gap: 0.75rem;
    }

    @media (max-width: 900px) {
      .stats-pills {
        margin-left: 0;
        width: 100%;
      }
    }

    .pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      font-weight: 600;
    }

    .pill-present { background: var(--success-light); color: var(--success); }
    .pill-absent { background: var(--danger-light); color: var(--danger); }
    .pill-late { background: var(--warning-light); color: var(--warning); }

    .roll-badge {
      font-family: 'Fira Code', monospace;
      color: var(--primary);
    }

    .student-name-cell {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-weight: 600;
    }

    .avatar-tiny {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .status-btn-group {
      display: inline-flex;
      background: var(--bg-hover);
      padding: 0.25rem;
      border-radius: var(--radius-md);
      gap: 0.25rem;
    }

    .btn-status {
      padding: 0.35rem 0.75rem;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .btn-status-present.active { background: var(--success); color: #fff; }
    .btn-status-absent.active { background: var(--danger); color: #fff; }
    .btn-status-late.active { background: var(--warning); color: #fff; }

    .remark-input {
      padding: 0.4rem 0.75rem;
      min-height: 36px;
      font-size: 0.85rem;
    }

    .text-success { color: var(--success); }
    .text-danger { color: var(--danger); }
  `]
})
export class FacultyAttendanceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private firestore = inject(FirestoreService);
  private toast = inject(ToastService);

  public subjects = signal<Subject[]>([]);
  public selectedSubjectId = '';
  public selectedDate = new Date().toISOString().split('T')[0];
  public studentRows = signal<StudentAttendanceRow[]>([]);
  public isSaving = signal<boolean>(false);

  async ngOnInit(): Promise<void> {
    const user = this.auth.userProfile();
    // Only load subjects assigned to this faculty
    const allSubjects = await this.firestore.getSubjects();
    const mySubjects = user ? allSubjects.filter(s => s.facultyId === user.uid) : allSubjects;
    this.subjects.set(mySubjects);

    const querySubj = this.route.snapshot.queryParams['subjectId'];
    if (querySubj && mySubjects.some(s => s.id === querySubj)) {
      this.selectedSubjectId = querySubj;
    } else if (mySubjects.length > 0) {
      this.selectedSubjectId = mySubjects[0].id;
    }

    await this.loadAttendanceSheet();
  }

  async onSelectionChange(): Promise<void> {
    await this.loadAttendanceSheet();
  }

  async loadAttendanceSheet(): Promise<void> {
    if (!this.selectedSubjectId) return;

    // Get all approved students
    const allStudents = (await this.firestore.getUsersByRole('student')).filter(st => st.approved);
    const currentSubject = this.subjects().find(s => s.id === this.selectedSubjectId);
    const relevantStudents = (currentSubject && currentSubject.courseId)
      ? allStudents.filter(st => !st.courseId || st.courseId === currentSubject.courseId)
      : allStudents;

    // Get existing records for this subject and date
    const existing = await this.firestore.getAttendance(this.selectedSubjectId, this.selectedDate);

    const rows: StudentAttendanceRow[] = relevantStudents.map(st => {
      const found = existing.find(e => e.studentId === st.uid);
      return {
        studentId: st.uid,
        studentName: st.displayName,
        rollNo: st.rollNo || 'Pending',
        status: found ? found.status : 'present',
        remarks: found ? found.remarks : ''
      };
    });

    this.studentRows.set(rows);
  }

  setStatus(row: StudentAttendanceRow, status: AttendanceStatus): void {
    row.status = status;
  }

  markAll(status: AttendanceStatus): void {
    this.studentRows.update(rows => {
      rows.forEach(r => r.status = status);
      return [...rows];
    });
  }

  countByStatus(status: AttendanceStatus): number {
    return this.studentRows().filter(r => r.status === status).length;
  }

  async saveAttendance(): Promise<void> {
    if (!this.selectedSubjectId || !this.selectedDate) return;

    this.isSaving.set(true);
    const faculty = this.auth.userProfile();
    const currentSubject = this.subjects().find(s => s.id === this.selectedSubjectId);

    const records: AttendanceRecord[] = this.studentRows().map(row => ({
      id: `${this.selectedSubjectId}_${this.selectedDate}_${row.studentId}`,
      subjectId: this.selectedSubjectId,
      subjectName: currentSubject ? currentSubject.name : '',
      studentId: row.studentId,
      studentName: row.studentName,
      rollNo: row.rollNo,
      date: this.selectedDate,
      status: row.status,
      facultyId: faculty ? faculty.uid : 'usr_faculty',
      markedAt: new Date().toISOString(),
      remarks: row.remarks
    }));

    await this.firestore.saveAttendanceBatch(records);
    this.isSaving.set(false);
    this.toast.success(`Attendance register for ${this.selectedDate} saved successfully!`);
  }
}
