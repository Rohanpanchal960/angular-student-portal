import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { Assessment, AssessmentType, MarksRecord, Subject, UserProfile } from '../../../core/models';

interface StudentMarkRow {
  studentId: string;
  studentName: string;
  rollNo: string;
  marksObtained: number;
  remarks?: string;
  error?: string;
}

/**
 * ====================================================================================
 * FACULTY ASSESSMENTS & MARKS ENTRY GRID COMPONENT
 * ====================================================================================
 * Enables teachers to create tests, quizzes, and assignments, then enter marks
 * in a real-time reactive grid with range validation (0..max), draft saving,
 * and publishing directly to student marksheets.
 */
@Component({
  selector: 'app-faculty-assessments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="assessments-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Assessments & Marks Entry Grid</h1>
          <p class="page-subtitle">Create evaluation tests, enter student scores, save drafts, and publish grades</p>
        </div>
        <button type="button" class="gradient-btn" (click)="openCreateModal()">
          <i class="fa-solid fa-plus"></i>
          <span>New Assessment</span>
        </button>
      </div>

      <!-- Assessment Selector Bar -->
      <div class="selector-card glass-card">
        <div class="select-col">
          <label class="label-muted">Select Assessment to Grade:</label>
          <select [(ngModel)]="selectedAssessmentId" (ngModelChange)="onAssessmentChange()" class="form-control">
            @for (a of assessments(); track a.id) {
              <option [value]="a.id">
                [{{ a.type }}] {{ a.title }} - {{ a.subjectName }} (Max: {{ a.maxMarks }})
              </option>
            }
          </select>
        </div>

        @if (currentAssessment(); as curr) {
          <div class="curr-meta">
            <div class="meta-pill">
              <span>Max Marks:</span>
              <strong>{{ curr.maxMarks }}</strong>
            </div>
            <div class="meta-pill">
              <span>Passing:</span>
              <strong>{{ curr.passingMarks }}</strong>
            </div>
            <div class="meta-pill">
              <span>Status:</span>
              <span class="badge" [ngClass]="curr.published ? 'badge-success' : 'badge-warning'">
                {{ curr.published ? 'Published' : 'Draft' }}
              </span>
            </div>
          </div>
        }
      </div>

      <!-- Marks Grid Actions Toolbar -->
      @if (currentAssessment(); as curr) {
        <div class="grid-actions">
          <div class="info-tag">
            <i class="fa-solid fa-calculator"></i> Entering marks out of <strong>{{ curr.maxMarks }}</strong>
          </div>
          <div class="btn-group">
            <button type="button" class="btn-secondary" (click)="saveMarks(true)">
              <i class="fa-regular fa-bookmark"></i>
              <span>Save as Draft</span>
            </button>
            <button type="button" class="gradient-btn" (click)="saveMarks(false)">
              <i class="fa-solid fa-cloud-arrow-up"></i>
              <span>Save & Publish</span>
            </button>
          </div>
        </div>

        <!-- Marks Entry Table -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 140px">Roll No</th>
                <th>Student Name</th>
                <th style="width: 180px">Marks (0 - {{ curr.maxMarks }})</th>
                <th style="width: 100px">Percentage</th>
                <th style="width: 90px">Grade</th>
                <th>Instructor Remarks</th>
              </tr>
            </thead>
            <tbody>
              @for (row of studentMarks(); track row.studentId) {
                <tr>
                  <td><strong class="roll-badge">{{ row.rollNo }}</strong></td>
                  <td><strong>{{ row.studentName }}</strong></td>
                  <td>
                    <div class="input-cell">
                      <input 
                        type="number" 
                        min="0" 
                        [max]="curr.maxMarks" 
                        [(ngModel)]="row.marksObtained" 
                        (ngModelChange)="validateRow(row, curr.maxMarks)"
                        class="form-control marks-input" 
                        [class.is-invalid]="!!row.error" />
                      @if (row.error) {
                        <span class="error-tooltip">{{ row.error }}</span>
                      }
                    </div>
                  </td>
                  <td>
                    <span class="pct-text">
                      {{ calculatePercentage(row.marksObtained, curr.maxMarks) }}%
                    </span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getGradeBadge(calculatePercentage(row.marksObtained, curr.maxMarks))">
                      {{ calculateGrade(calculatePercentage(row.marksObtained, curr.maxMarks)) }}
                    </span>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      [(ngModel)]="row.remarks" 
                      class="form-control remark-input" 
                      placeholder="Feedback..." />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Create Assessment Modal -->
      @if (isCreateModalOpen()) {
        <div class="modal-overlay" (click)="isCreateModalOpen.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">Create New Assessment</h2>
              <button type="button" class="btn-icon" (click)="isCreateModalOpen.set(false)"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form [formGroup]="asmtForm" (ngSubmit)="createAssessment()" class="modal-body">
              <div class="form-group">
                <label class="form-label">Assessment Title *</label>
                <input type="text" formControlName="title" class="form-control" placeholder="e.g. Mid-Term Examination Autumn 2026" />
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Assessment Type *</label>
                  <select formControlName="type" class="form-control">
                    <option value="Test">Class Test</option>
                    <option value="Assignment">Practical Assignment</option>
                    <option value="Quiz">Quick Quiz</option>
                    <option value="Exam">Final Semester Exam</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Subject *</label>
                  <select formControlName="subjectId" class="form-control">
                    @for (s of subjects(); track s.id) {
                      <option [value]="s.id">{{ s.name }} ({{ s.code }})</option>
                    }
                  </select>
                </div>
              </div>

              <div class="grid-3">
                <div class="form-group">
                  <label class="form-label">Maximum Marks *</label>
                  <input type="number" formControlName="maxMarks" class="form-control" />
                </div>
                <div class="form-group">
                  <label class="form-label">Passing Marks *</label>
                  <input type="number" formControlName="passingMarks" class="form-control" />
                </div>
                <div class="form-group">
                  <label class="form-label">Weightage (%)</label>
                  <input type="number" formControlName="weightage" class="form-control" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Assessment Date *</label>
                <input type="date" formControlName="date" class="form-control" />
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="isCreateModalOpen.set(false)">Cancel</button>
                <button type="submit" class="gradient-btn" [disabled]="asmtForm.invalid">Create Assessment</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .assessments-container {
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

    .selector-card {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .select-col {
      flex: 1;
      min-width: 280px;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .label-muted {
      font-size: 0.775rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .curr-meta {
      display: flex;
      gap: 0.75rem;
    }

    .meta-pill {
      background: var(--bg-hover);
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.825rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .grid-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .info-tag {
      font-size: 0.85rem;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .btn-group {
      display: flex;
      gap: 0.75rem;
    }

    .roll-badge {
      font-family: 'Fira Code', monospace;
      color: var(--primary);
    }

    .input-cell {
      position: relative;
    }

    .marks-input {
      font-weight: 700;
      font-size: 0.95rem;
      padding: 0.4rem 0.75rem;
      min-height: 38px;
    }

    .error-tooltip {
      position: absolute;
      bottom: -18px;
      left: 0;
      font-size: 0.7rem;
      color: var(--danger);
      white-space: nowrap;
    }

    .pct-text {
      font-weight: 700;
      font-size: 0.85rem;
    }

    .remark-input {
      padding: 0.4rem 0.75rem;
      min-height: 38px;
      font-size: 0.85rem;
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

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
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
export class FacultyAssessmentsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private firestore = inject(FirestoreService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  public subjects = signal<Subject[]>([]);
  public assessments = signal<Assessment[]>([]);
  public selectedAssessmentId = '';
  public currentAssessment = signal<Assessment | null>(null);
  public studentMarks = signal<StudentMarkRow[]>([]);

  public isCreateModalOpen = signal<boolean>(false);

  public asmtForm = this.fb.group({
    title: ['', Validators.required],
    type: ['Test', Validators.required],
    subjectId: ['', Validators.required],
    maxMarks: [50, [Validators.required, Validators.min(1)]],
    passingMarks: [20, [Validators.required, Validators.min(1)]],
    weightage: [25],
    date: [new Date().toISOString().split('T')[0], Validators.required]
  });

  async ngOnInit(): Promise<void> {
    const user = this.auth.userProfile();
    // Only show subjects taught by this faculty
    const allSubs = await this.firestore.getSubjects();
    const mySubs = user ? allSubs.filter(s => s.facultyId === user.uid) : allSubs;
    this.subjects.set(mySubs);

    await this.loadAssessments();
  }

  async loadAssessments(): Promise<void> {
    const user = this.auth.userProfile();
    const all = await this.firestore.getAssessments();
    // Only show assessments created by this faculty
    const list = user ? all.filter(a => a.facultyId === user.uid) : all;
    this.assessments.set(list);

    const querySubj = this.route.snapshot.queryParams['subjectId'];
    if (querySubj) {
      const match = list.find(a => a.subjectId === querySubj);
      if (match) this.selectedAssessmentId = match.id;
    }

    if (!this.selectedAssessmentId && list.length > 0) {
      this.selectedAssessmentId = list[0].id;
    }

    await this.onAssessmentChange();
  }

  async onAssessmentChange(): Promise<void> {
    if (!this.selectedAssessmentId) return;

    const asmt = this.assessments().find(a => a.id === this.selectedAssessmentId);
    this.currentAssessment.set(asmt || null);

    if (!asmt) return;

    // Fetch marks for this assessment and approved students
    const existingMarks = await this.firestore.getMarksForAssessment(asmt.id);
    const allStudents = (await this.firestore.getUsersByRole('student')).filter(st => st.approved);
    const subj = this.subjects().find(s => s.id === asmt.subjectId);
    const relevantStudents = (subj && subj.courseId)
      ? allStudents.filter(st => !st.courseId || st.courseId === subj.courseId)
      : allStudents;

    const rows: StudentMarkRow[] = relevantStudents.map(st => {
      const found = existingMarks.find(m => m.studentId === st.uid);
      return {
        studentId: st.uid,
        studentName: st.displayName,
        rollNo: st.rollNo || 'Pending',
        marksObtained: found ? found.marksObtained : 0,
        remarks: found ? found.remarks : ''
      };
    });

    this.studentMarks.set(rows);
  }

  validateRow(row: StudentMarkRow, maxMarks: number): void {
    if (row.marksObtained < 0 || row.marksObtained > maxMarks) {
      row.error = `Must be between 0 and ${maxMarks}`;
    } else {
      row.error = undefined;
    }
  }

  calculatePercentage(marks: number, max: number): number {
    if (!max) return 0;
    return Math.round((marks / max) * 100);
  }

  calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 40) return 'C';
    return 'F';
  }

  getGradeBadge(percentage: number): string {
    if (percentage >= 80) return 'badge-success';
    if (percentage >= 60) return 'badge-info';
    if (percentage >= 40) return 'badge-warning';
    return 'badge-danger';
  }

  openCreateModal(): void {
    const defaultSubj = this.subjects()[0];
    this.asmtForm.reset({
      type: 'Test',
      subjectId: defaultSubj ? defaultSubj.id : '',
      maxMarks: 50,
      passingMarks: 20,
      weightage: 20,
      date: new Date().toISOString().split('T')[0]
    });
    this.isCreateModalOpen.set(true);
  }

  async createAssessment(): Promise<void> {
    if (this.asmtForm.invalid) return;

    const val = this.asmtForm.value;
    const subj = this.subjects().find(s => s.id === val.subjectId);
    const faculty = this.auth.userProfile();
    const id = 'asmt_' + Date.now().toString(36);

    const asmt: Assessment = {
      id,
      title: val.title!,
      type: val.type as AssessmentType,
      subjectId: val.subjectId!,
      subjectName: subj ? subj.name : '',
      maxMarks: Number(val.maxMarks),
      passingMarks: Number(val.passingMarks),
      weightage: Number(val.weightage),
      date: val.date!,
      facultyId: faculty ? faculty.uid : 'usr_faculty',
      facultyName: faculty ? faculty.displayName : '',
      published: false,
      createdAt: new Date().toISOString()
    };

    await this.firestore.saveAssessment(asmt);
    this.toast.success(`Assessment "${asmt.title}" created successfully!`);
    this.isCreateModalOpen.set(false);
    this.selectedAssessmentId = asmt.id;
    await this.loadAssessments();
  }

  async saveMarks(isDraft: boolean): Promise<void> {
    const asmt = this.currentAssessment();
    if (!asmt) return;

    // Check for any validation errors
    const hasError = this.studentMarks().some(r => r.marksObtained < 0 || r.marksObtained > asmt.maxMarks);
    if (hasError) {
      this.toast.error(`Some student scores exceed allowable range 0 - ${asmt.maxMarks}.`);
      return;
    }

    const marksRecords: MarksRecord[] = this.studentMarks().map(row => {
      const pct = this.calculatePercentage(row.marksObtained, asmt.maxMarks);
      return {
        id: `${asmt.id}_${row.studentId}`,
        assessmentId: asmt.id,
        assessmentTitle: asmt.title,
        assessmentType: asmt.type,
        subjectId: asmt.subjectId,
        subjectName: asmt.subjectName,
        studentId: row.studentId,
        studentName: row.studentName,
        rollNo: row.rollNo,
        marksObtained: row.marksObtained,
        maxMarks: asmt.maxMarks,
        percentage: pct,
        grade: this.calculateGrade(pct),
        isDraft,
        published: !isDraft,
        remarks: row.remarks,
        updatedAt: new Date().toISOString()
      };
    });

    await this.firestore.saveMarksBatch(marksRecords);

    // Update assessment published state
    if (!isDraft) {
      asmt.published = true;
      await this.firestore.saveAssessment(asmt);
      this.toast.success(`Marks published for ${asmt.title}! Students can now view their grades.`);
    } else {
      this.toast.info(`Marks saved as draft for ${asmt.title}.`);
    }

    await this.loadAssessments();
  }
}
