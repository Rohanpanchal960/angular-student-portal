import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ExamTimetable, Course, Subject } from '../../../core/models';

/**
 * ====================================================================================
 * ADMIN EXAM TIMETABLE MANAGEMENT COMPONENT
 * ====================================================================================
 * Coordinates university and college examination schedules, room allocations,
 * and exam timing across academic programs and semesters.
 */
@Component({
  selector: 'app-admin-exams',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmModalComponent],
  template: `
    <div class="exams-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Examination Timetable & Schedules</h1>
          <p class="page-subtitle">Configure semester examination dates, session timings, and hall allocations</p>
        </div>
        <button type="button" class="gradient-btn" (click)="openAddModal()">
          <i class="fa-solid fa-plus"></i>
          <span>Schedule Exam</span>
        </button>
      </div>

      <!-- Filters Toolbar -->
      <div class="toolbar glass-card">
        <div class="filter-group">
          <select [(ngModel)]="selectedCourse" class="form-control">
            <option value="all">All Degree Courses</option>
            @for (c of courses(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>

          <select [(ngModel)]="selectedSemester" class="form-control">
            <option value="all">All Semesters</option>
            @for (s of [1,2,3,4,5,6,7,8]; track s) {
              <option [value]="s">Semester {{ s }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Exam Timetable Data Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Exam Title</th>
              <th>Subject</th>
              <th>Course & Sem</th>
              <th>Timing</th>
              <th>Room No</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (ex of filteredExams(); track ex.id) {
              <tr>
                <td><strong class="date-badge"><i class="fa-regular fa-calendar"></i> {{ ex.date }}</strong></td>
                <td><strong>{{ ex.examName }}</strong></td>
                <td>
                  <div>
                    <span class="subj-name">{{ ex.subjectName }}</span>
                    <span class="code-pill">{{ ex.subjectCode }}</span>
                  </div>
                </td>
                <td>{{ ex.courseName }} - Sem {{ ex.semester }}</td>
                <td><span class="time-pill"><i class="fa-regular fa-clock"></i> {{ ex.startTime }} - {{ ex.endTime }}</span></td>
                <td><span class="room-pill"><i class="fa-solid fa-door-open"></i> {{ ex.roomNo }}</span></td>
                <td>
                  <div class="actions-cell">
                    <button type="button" class="btn-icon" (click)="editExam(ex)">
                      <i class="fa-regular fa-pen-to-square text-primary"></i>
                    </button>
                    <button type="button" class="btn-icon" (click)="confirmDelete(ex)">
                      <i class="fa-solid fa-trash-can text-danger"></i>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7">
                  <div class="empty-state">
                    <i class="fa-solid fa-calendar-xmark empty-icon"></i>
                    <h3 class="empty-title">No Scheduled Examinations</h3>
                    <p class="empty-subtitle">Click "Schedule Exam" to publish exam timetable entries.</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal -->
      @if (isModalOpen()) {
        <div class="modal-overlay" (click)="isModalOpen.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">{{ editingExam() ? 'Edit Exam Schedule' : 'Schedule New Examination' }}</h2>
              <button type="button" class="btn-icon" (click)="isModalOpen.set(false)"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form [formGroup]="examForm" (ngSubmit)="saveExam()" class="modal-body">
              <div class="form-group">
                <label class="form-label">Examination Name *</label>
                <input type="text" formControlName="examName" class="form-control" placeholder="e.g. End Semester Theory Autumn 2026" />
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Degree Course *</label>
                  <select formControlName="courseId" (change)="onCourseChange()" class="form-control">
                    @for (c of courses(); track c.id) {
                      <option [value]="c.id">{{ c.name }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Semester *</label>
                  <select formControlName="semester" class="form-control">
                    @for (s of [1,2,3,4,5,6,7,8]; track s) {
                      <option [value]="s">Semester {{ s }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Subject *</label>
                <select formControlName="subjectId" class="form-control">
                  @for (sub of availableSubjects(); track sub.id) {
                    <option [value]="sub.id">{{ sub.name }} ({{ sub.code }})</option>
                  }
                </select>
              </div>

              <div class="grid-3">
                <div class="form-group">
                  <label class="form-label">Exam Date *</label>
                  <input type="date" formControlName="date" class="form-control" />
                </div>
                <div class="form-group">
                  <label class="form-label">Start Time *</label>
                  <input type="text" formControlName="startTime" class="form-control" placeholder="10:00 AM" />
                </div>
                <div class="form-group">
                  <label class="form-label">End Time *</label>
                  <input type="text" formControlName="endTime" class="form-control" placeholder="01:00 PM" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Room / Examination Hall *</label>
                <input type="text" formControlName="roomNo" class="form-control" placeholder="Lecture Hall 101" />
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="isModalOpen.set(false)">Cancel</button>
                <button type="submit" class="gradient-btn" [disabled]="examForm.invalid">Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      }

      <app-confirm-modal 
        [isOpen]="isDeleteModalOpen()" 
        title="Delete Examination Schedule" 
        [message]="'Are you sure you want to delete exam ' + (examToDelete()?.examName || '') + '?'"
        confirmText="Delete" 
        (confirmed)="executeDelete()" 
        (cancelled)="isDeleteModalOpen.set(false)">
      </app-confirm-modal>
    </div>
  `,
  styles: [`
    .exams-container {
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

    .toolbar {
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
    }

    .filter-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .date-badge {
      color: var(--primary);
    }

    .code-pill {
      font-size: 0.75rem;
      font-family: 'Fira Code', monospace;
      background: var(--bg-hover);
      padding: 0.2rem 0.4rem;
      border-radius: var(--radius-sm);
      margin-left: 0.4rem;
    }

    .time-pill, .room-pill {
      font-size: 0.8rem;
      color: var(--text-secondary);
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .actions-cell {
      display: flex;
      gap: 0.5rem;
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
export class AdminExamsComponent implements OnInit {
  private firestore = inject(FirestoreService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  public exams = signal<ExamTimetable[]>([]);
  public courses = signal<Course[]>([]);
  public subjects = signal<Subject[]>([]);
  public availableSubjects = signal<Subject[]>([]);

  public selectedCourse = 'all';
  public selectedSemester = 'all';

  public isModalOpen = signal<boolean>(false);
  public editingExam = signal<ExamTimetable | null>(null);

  public isDeleteModalOpen = signal<boolean>(false);
  public examToDelete = signal<ExamTimetable | null>(null);

  public examForm = this.fb.group({
    examName: ['', Validators.required],
    courseId: ['', Validators.required],
    semester: [5, Validators.required],
    subjectId: ['', Validators.required],
    date: ['', Validators.required],
    startTime: ['10:00 AM', Validators.required],
    endTime: ['01:00 PM', Validators.required],
    roomNo: ['Lecture Hall 101', Validators.required]
  });

  public filteredExams = computed(() => {
    let list = this.exams();
    if (this.selectedCourse !== 'all') {
      list = list.filter(e => e.courseId === this.selectedCourse);
    }
    if (this.selectedSemester !== 'all') {
      list = list.filter(e => e.semester === Number(this.selectedSemester));
    }
    return list;
  });

  async ngOnInit(): Promise<void> {
    await this.loadAll();
  }

  async loadAll(): Promise<void> {
    const exList = await this.firestore.getExamTimetables();
    const cList = await this.firestore.getCourses();
    const sList = await this.firestore.getSubjects();

    this.exams.set(exList);
    this.courses.set(cList);
    this.subjects.set(sList);
    this.availableSubjects.set(sList);
  }

  onCourseChange(): void {
    const cId = this.examForm.value.courseId;
    if (cId) {
      const filtered = this.subjects().filter(s => s.courseId === cId);
      this.availableSubjects.set(filtered);
      if (filtered.length > 0) {
        this.examForm.patchValue({ subjectId: filtered[0].id });
      }
    }
  }

  openAddModal(): void {
    this.editingExam.set(null);
    const defaultCourse = this.courses()[0];
    const defaultSubj = this.subjects()[0];

    this.examForm.reset({
      examName: 'End Semester Theory Autumn 2026',
      courseId: defaultCourse ? defaultCourse.id : '',
      semester: 5,
      subjectId: defaultSubj ? defaultSubj.id : '',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      roomNo: 'Lecture Hall 101'
    });
    this.isModalOpen.set(true);
  }

  editExam(ex: ExamTimetable): void {
    this.editingExam.set(ex);
    this.examForm.patchValue({
      examName: ex.examName,
      courseId: ex.courseId,
      semester: ex.semester,
      subjectId: ex.subjectId,
      date: ex.date,
      startTime: ex.startTime,
      endTime: ex.endTime,
      roomNo: ex.roomNo
    });
    this.isModalOpen.set(true);
  }

  async saveExam(): Promise<void> {
    if (this.examForm.invalid) return;

    const val = this.examForm.value;
    const course = this.courses().find(c => c.id === val.courseId);
    const subject = this.subjects().find(s => s.id === val.subjectId);
    const existing = this.editingExam();
    const id = existing ? existing.id : 'exam_' + Date.now().toString(36);

    const record: ExamTimetable = {
      id,
      examName: val.examName!,
      courseId: val.courseId!,
      courseName: course ? course.name : '',
      semester: Number(val.semester),
      subjectId: val.subjectId!,
      subjectName: subject ? subject.name : '',
      subjectCode: subject ? subject.code : '',
      date: val.date!,
      startTime: val.startTime!,
      endTime: val.endTime!,
      roomNo: val.roomNo!,
      createdAt: existing ? existing.createdAt : new Date().toISOString()
    };

    await this.firestore.saveExamTimetable(record);
    this.toast.success(`Exam schedule saved successfully!`);
    this.isModalOpen.set(false);
    await this.loadAll();
  }

  confirmDelete(ex: ExamTimetable): void {
    this.examToDelete.set(ex);
    this.isDeleteModalOpen.set(true);
  }

  async executeDelete(): Promise<void> {
    const ex = this.examToDelete();
    if (!ex) return;

    await this.firestore.deleteExamTimetable(ex.id);
    this.toast.success('Exam schedule deleted.');
    this.isDeleteModalOpen.set(false);
    this.examToDelete.set(null);
    await this.loadAll();
  }
}
