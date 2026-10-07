import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { Course, Subject, UserProfile } from '../../../core/models';

/**
 * ====================================================================================
 * ADMIN COURSES & CURRICULUM SUBJECTS COMPONENT
 * ====================================================================================
 * Manages degree programs (Courses) and constituent academic modules (Subjects),
 * including faculty assignments and credit weight allocations.
 */
@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmModalComponent],
  template: `
    <div class="courses-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Curriculum & Subject Allocation</h1>
          <p class="page-subtitle">Define academic degree courses and assign curriculum subjects to faculty</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn-secondary" (click)="openCourseModal()">
            <i class="fa-solid fa-graduation-cap"></i>
            <span>Add Course</span>
          </button>
          <button type="button" class="gradient-btn" (click)="openSubjectModal()">
            <i class="fa-solid fa-book"></i>
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tab-bar">
        <button 
          type="button" 
          class="tab-btn" 
          [class.active]="activeTab() === 'subjects'" 
          (click)="activeTab.set('subjects')">
          <i class="fa-solid fa-book-bookmark"></i>
          <span>Academic Subjects ({{ subjects().length }})</span>
        </button>
        <button 
          type="button" 
          class="tab-btn" 
          [class.active]="activeTab() === 'courses'" 
          (click)="activeTab.set('courses')">
          <i class="fa-solid fa-graduation-cap"></i>
          <span>Degree Courses ({{ courses().length }})</span>
        </button>
      </div>

      <!-- 1. Subjects Table View -->
      @if (activeTab() === 'subjects') {
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Name</th>
                <th>Course</th>
                <th>Semester</th>
                <th>Credits</th>
                <th>Assigned Faculty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (s of subjects(); track s.id) {
                <tr>
                  <td><strong class="code-badge">{{ s.code }}</strong></td>
                  <td><strong>{{ s.name }}</strong></td>
                  <td>{{ s.courseName || 'B.Tech CSE' }}</td>
                  <td>Semester {{ s.semester }}</td>
                  <td>{{ s.credits }} Credits</td>
                  <td>
                    @if (s.facultyName) {
                      <span class="badge badge-info">
                        <i class="fa-solid fa-chalkboard-user"></i> {{ s.facultyName }}
                      </span>
                    } @else {
                      <span class="badge badge-warning">Unassigned</span>
                    }
                  </td>
                  <td>
                    <div class="actions-cell">
                      <button type="button" class="btn-icon" (click)="editSubject(s)">
                        <i class="fa-regular fa-pen-to-square text-primary"></i>
                      </button>
                      <button type="button" class="btn-icon" (click)="confirmDeleteSubject(s)">
                        <i class="fa-solid fa-trash-can text-danger"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7">
                    <div class="empty-state">
                      <i class="fa-solid fa-book empty-icon"></i>
                      <h3 class="empty-title">No Subjects Configured</h3>
                      <p class="empty-subtitle">Click "Add Subject" to configure subjects and assign professors.</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- 2. Courses Table View -->
      @if (activeTab() === 'courses') {
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Degree Title</th>
                <th>Duration</th>
                <th>Total Semesters</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (c of courses(); track c.id) {
                <tr>
                  <td><strong class="code-badge">{{ c.code }}</strong></td>
                  <td><strong>{{ c.name }}</strong></td>
                  <td>{{ c.durationYears }} Years</td>
                  <td>{{ c.totalSemesters }} Semesters</td>
                  <td>
                    <div class="actions-cell">
                      <button type="button" class="btn-icon" (click)="editCourse(c)">
                        <i class="fa-regular fa-pen-to-square text-primary"></i>
                      </button>
                      <button type="button" class="btn-icon" (click)="confirmDeleteCourse(c)">
                        <i class="fa-solid fa-trash-can text-danger"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5">
                    <div class="empty-state">
                      <i class="fa-solid fa-graduation-cap empty-icon"></i>
                      <h3 class="empty-title">No Courses Defined</h3>
                      <p class="empty-subtitle">Click "Add Course" to create your first degree course.</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Course Modal -->
      @if (isCourseModalOpen()) {
        <div class="modal-overlay" (click)="isCourseModalOpen.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">{{ editingCourse() ? 'Edit Degree Course' : 'Create New Course' }}</h2>
              <button type="button" class="btn-icon" (click)="isCourseModalOpen.set(false)">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form [formGroup]="courseForm" (ngSubmit)="saveCourse()" class="modal-body">
              <div class="form-group">
                <label class="form-label">Course Code *</label>
                <input type="text" formControlName="code" class="form-control" placeholder="e.g. BTECH-CSE" />
              </div>
              <div class="form-group">
                <label class="form-label">Degree Name *</label>
                <input type="text" formControlName="name" class="form-control" placeholder="e.g. Bachelor of Technology in CSE" />
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Duration (Years)</label>
                  <input type="number" formControlName="durationYears" class="form-control" />
                </div>
                <div class="form-group">
                  <label class="form-label">Total Semesters</label>
                  <input type="number" formControlName="totalSemesters" class="form-control" />
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="isCourseModalOpen.set(false)">Cancel</button>
                <button type="submit" class="gradient-btn" [disabled]="courseForm.invalid">Save Course</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Subject Modal -->
      @if (isSubjectModalOpen()) {
        <div class="modal-overlay" (click)="isSubjectModalOpen.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">{{ editingSubject() ? 'Edit Subject Details' : 'Add New Subject' }}</h2>
              <button type="button" class="btn-icon" (click)="isSubjectModalOpen.set(false)">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form [formGroup]="subjectForm" (ngSubmit)="saveSubject()" class="modal-body">
              <div class="form-group">
                <label class="form-label">Subject Code *</label>
                <input type="text" formControlName="code" class="form-control" placeholder="e.g. CS501" />
              </div>
              <div class="form-group">
                <label class="form-label">Subject Title *</label>
                <input type="text" formControlName="name" class="form-control" placeholder="e.g. Database Management Systems" />
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Associated Course *</label>
                  <select formControlName="courseId" class="form-control">
                    @for (c of courses(); track c.id) {
                      <option [value]="c.id">{{ c.name }}</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Semester</label>
                  <select formControlName="semester" class="form-control">
                    @for (sem of [1,2,3,4,5,6,7,8]; track sem) {
                      <option [value]="sem">Semester {{ sem }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Credits</label>
                  <input type="number" formControlName="credits" class="form-control" />
                </div>
                <div class="form-group">
                  <label class="form-label">Assign Faculty Member</label>
                  <select formControlName="facultyId" class="form-control">
                    <option value="">Unassigned</option>
                    @for (f of facultyList(); track f.uid) {
                      <option [value]="f.uid">{{ f.displayName }} ({{ f.department || 'CSE' }})</option>
                    }
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="isSubjectModalOpen.set(false)">Cancel</button>
                <button type="submit" class="gradient-btn" [disabled]="subjectForm.invalid">Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal 
        [isOpen]="isDeleteModalOpen()" 
        title="Confirm Item Deletion" 
        [message]="deleteModalMessage()"
        confirmText="Delete" 
        (confirmed)="executeDelete()" 
        (cancelled)="isDeleteModalOpen.set(false)">
      </app-confirm-modal>
    </div>
  `,
  styles: [`
    .courses-container {
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

    .header-actions {
      display: flex;
      gap: 0.75rem;
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

    .code-badge {
      font-family: 'Fira Code', monospace;
      color: var(--primary);
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
export class AdminCoursesComponent implements OnInit {
  private firestore = inject(FirestoreService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  public courses = signal<Course[]>([]);
  public subjects = signal<Subject[]>([]);
  public facultyList = signal<UserProfile[]>([]);
  public activeTab = signal<'subjects' | 'courses'>('subjects');

  public isCourseModalOpen = signal<boolean>(false);
  public editingCourse = signal<Course | null>(null);

  public isSubjectModalOpen = signal<boolean>(false);
  public editingSubject = signal<Subject | null>(null);

  public isDeleteModalOpen = signal<boolean>(false);
  public deleteModalMessage = signal<string>('');
  private itemToDelete: { type: 'course' | 'subject'; id: string } | null = null;

  public courseForm = this.fb.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    durationYears: [4, [Validators.required]],
    totalSemesters: [8, [Validators.required]]
  });

  public subjectForm = this.fb.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    courseId: ['', [Validators.required]],
    semester: [1, [Validators.required]],
    credits: [4, [Validators.required]],
    facultyId: ['']
  });

  async ngOnInit(): Promise<void> {
    await this.loadAll();
  }

  async loadAll(): Promise<void> {
    const cList = await this.firestore.getCourses();
    const sList = await this.firestore.getSubjects();
    const allUsers = await this.firestore.getAllUsers();

    this.courses.set(cList);
    this.subjects.set(sList);
    this.facultyList.set(allUsers.filter(u => u.role === 'faculty' && u.approved));
  }

  openCourseModal(): void {
    this.editingCourse.set(null);
    this.courseForm.reset({ durationYears: 4, totalSemesters: 8 });
    this.isCourseModalOpen.set(true);
  }

  editCourse(c: Course): void {
    this.editingCourse.set(c);
    this.courseForm.patchValue({
      code: c.code,
      name: c.name,
      durationYears: c.durationYears,
      totalSemesters: c.totalSemesters
    });
    this.isCourseModalOpen.set(true);
  }

  async saveCourse(): Promise<void> {
    if (this.courseForm.invalid) return;

    const val = this.courseForm.value;
    const existing = this.editingCourse();
    const courseId = existing ? existing.id : 'course_' + Date.now().toString(36);

    const newCourse: Course = {
      id: courseId,
      code: val.code!.toUpperCase(),
      name: val.name!,
      durationYears: Number(val.durationYears),
      totalSemesters: Number(val.totalSemesters),
      createdAt: existing ? existing.createdAt : new Date().toISOString()
    };

    await this.firestore.saveCourse(newCourse);
    this.toast.success(`Course ${newCourse.code} saved successfully!`);
    this.isCourseModalOpen.set(false);
    await this.loadAll();
  }

  openSubjectModal(): void {
    this.editingSubject.set(null);
    this.subjectForm.reset({
      courseId: this.courses().length > 0 ? this.courses()[0].id : '',
      semester: 1,
      credits: 4,
      facultyId: ''
    });
    this.isSubjectModalOpen.set(true);
  }

  editSubject(s: Subject): void {
    this.editingSubject.set(s);
    this.subjectForm.patchValue({
      code: s.code,
      name: s.name,
      courseId: s.courseId,
      semester: s.semester,
      credits: s.credits,
      facultyId: s.facultyId || ''
    });
    this.isSubjectModalOpen.set(true);
  }

  async saveSubject(): Promise<void> {
    if (this.subjectForm.invalid) return;

    const val = this.subjectForm.value;
    const existing = this.editingSubject();
    const subjectId = existing ? existing.id : 'subj_' + Date.now().toString(36);
    const assignedFac = this.facultyList().find(f => f.uid === val.facultyId);
    const course = this.courses().find(c => c.id === val.courseId);

    const newSubj: Subject = {
      id: subjectId,
      code: val.code!.toUpperCase(),
      name: val.name!,
      courseId: val.courseId!,
      courseName: course ? course.name : '',
      semester: Number(val.semester),
      credits: Number(val.credits),
      facultyId: val.facultyId || undefined,
      facultyName: assignedFac ? assignedFac.displayName : undefined,
      createdAt: existing ? existing.createdAt : new Date().toISOString()
    };

    await this.firestore.saveSubject(newSubj);
    this.toast.success(`Subject ${newSubj.code} saved successfully!`);
    this.isSubjectModalOpen.set(false);
    await this.loadAll();
  }

  confirmDeleteCourse(c: Course): void {
    this.itemToDelete = { type: 'course', id: c.id };
    this.deleteModalMessage.set(`Are you sure you want to delete course ${c.name} (${c.code})?`);
    this.isDeleteModalOpen.set(true);
  }

  confirmDeleteSubject(s: Subject): void {
    this.itemToDelete = { type: 'subject', id: s.id };
    this.deleteModalMessage.set(`Are you sure you want to delete subject ${s.name} (${s.code})?`);
    this.isDeleteModalOpen.set(true);
  }

  async executeDelete(): Promise<void> {
    if (!this.itemToDelete) return;

    if (this.itemToDelete.type === 'course') {
      await this.firestore.deleteCourse(this.itemToDelete.id);
      this.toast.success('Course deleted.');
    } else {
      await this.firestore.deleteSubject(this.itemToDelete.id);
      this.toast.success('Subject deleted.');
    }

    this.isDeleteModalOpen.set(false);
    this.itemToDelete = null;
    await this.loadAll();
  }
}
