import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { UserProfile, Course } from '../../../core/models';

/**
 * ====================================================================================
 * ADMIN STUDENT DIRECTORY & BULK CSV IMPORT COMPONENT
 * ====================================================================================
 * Comprehensive student administration:
 * - Single Student CRUD modal (Roll No, Course, Semester, Contact)
 * - Bulk CSV import processor with automated validation & parsing
 * - Downloadable sample CSV template
 * - Search & filtration by course and semester
 */
@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmModalComponent],
  template: `
    <div class="students-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Student Enrollment & Directory</h1>
          <p class="page-subtitle">Manage student records, semester allocations, and bulk CSV ingestion</p>
        </div>
        <div class="header-actions">
          <!-- CSV Ingestion Buttons -->
          <button type="button" class="btn-secondary" (click)="downloadCsvTemplate()">
            <i class="fa-solid fa-file-csv"></i>
            <span>CSV Template</span>
          </button>
          <label class="btn-secondary file-upload-label">
            <i class="fa-solid fa-cloud-arrow-up"></i>
            <span>Import CSV</span>
            <input type="file" accept=".csv" (change)="handleCsvFile($event)" style="display:none" />
          </label>
          <button type="button" class="gradient-btn" (click)="openAddModal()">
            <i class="fa-solid fa-user-plus"></i>
            <span>Add Student</span>
          </button>
        </div>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="toolbar glass-card">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input 
            type="text" 
            [ngModel]="searchQuery()" 
            (ngModelChange)="searchQuery.set($event)"
            class="form-control search-input" 
            placeholder="Search by student name, roll number, or email..." />
        </div>

        <div class="filter-group">
          <select [ngModel]="selectedCourse()" (ngModelChange)="selectedCourse.set($event)" class="form-control">
            <option value="all">All Courses</option>
            @for (c of courses(); track c.id) {
              <option [value]="c.id">{{ c.code }}</option>
            }
          </select>

          <select [ngModel]="selectedSemester()" (ngModelChange)="selectedSemester.set($event)" class="form-control">
            <option value="all">All Semesters</option>
            @for (s of [1,2,3,4,5,6,7,8]; track s) {
              <option [value]="s">Semester {{ s }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Students Data Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Semester</th>
              <th>Status</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (s of filteredStudents(); track s.uid) {
              <tr>
                <td><strong class="roll-badge">{{ s.rollNo || 'Pending' }}</strong></td>
                <td>
                  <div class="student-cell">
                    <div class="student-avatar">{{ s.displayName.charAt(0).toUpperCase() }}</div>
                    <span>{{ s.displayName }}</span>
                  </div>
                </td>
                <td>{{ s.email }}</td>
                <td>{{ s.courseName || '—' }}</td>
                <td><span class="sem-tag">Sem {{ s.semester || 1 }}</span></td>
                <td>
                  @if (s.approved) {
                    <span class="badge badge-success"><i class="fa-solid fa-check"></i> Approved</span>
                  } @else {
                    <button type="button" class="btn-approve-sm" (click)="approveStudent(s)" title="Click to Approve Student">
                      <i class="fa-solid fa-user-check"></i> Approve
                    </button>
                  }
                </td>
                <td>{{ s.phoneNumber || 'N/A' }}</td>
                <td>
                  <div class="actions-cell">
                    <button type="button" class="btn-icon" title="Edit Student" (click)="openEditModal(s)">
                      <i class="fa-regular fa-pen-to-square text-primary"></i>
                    </button>
                    <button type="button" class="btn-icon" title="Delete Student" (click)="confirmDelete(s)">
                      <i class="fa-solid fa-trash-can text-danger"></i>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8">
                  <div class="empty-state">
                    <i class="fa-solid fa-user-graduate empty-icon"></i>
                    <h3 class="empty-title">No Students Found</h3>
                    <p class="empty-subtitle">Add a single student or import via CSV file.</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Student Modal -->
      @if (isModalOpen()) {
        <div class="modal-overlay" (click)="isModalOpen.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">{{ editingStudent() ? 'Edit Student Details' : 'Add New Student' }}</h2>
              <button type="button" class="btn-icon" (click)="isModalOpen.set(false)">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form [formGroup]="studentForm" (ngSubmit)="saveStudent()" class="modal-body">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input type="text" formControlName="displayName" class="form-control" placeholder="e.g. Rahul Sharma" />
              </div>

              <div class="form-group">
                <label class="form-label">Email Address *</label>
                <input type="email" formControlName="email" class="form-control" placeholder="rahul@eduportal.com" />
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Roll Number *</label>
                  <input type="text" formControlName="rollNo" class="form-control" placeholder="2026-CS-001" />
                </div>
                <div class="form-group">
                  <label class="form-label">Semester *</label>
                  <select formControlName="semester" class="form-control">
                    @for (sem of [1,2,3,4,5,6,7,8]; track sem) {
                      <option [value]="sem">Semester {{ sem }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Academic Course *</label>
                <select formControlName="courseId" class="form-control">
                  @for (c of courses(); track c.id) {
                    <option [value]="c.id">{{ c.name }} ({{ c.code }})</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" formControlName="phoneNumber" class="form-control" placeholder="+91 98765 00000" />
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="isModalOpen.set(false)">Cancel</button>
                <button type="submit" class="gradient-btn" [disabled]="studentForm.invalid">
                  {{ editingStudent() ? 'Save Changes' : 'Create Student Record' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal 
        [isOpen]="isDeleteModalOpen()" 
        title="Remove Student Record" 
        [message]="'Are you sure you want to delete student ' + (studentToDelete()?.displayName || '') + ' (' + (studentToDelete()?.rollNo || '') + ')?'"
        confirmText="Delete Student" 
        (confirmed)="executeDelete()" 
        (cancelled)="isDeleteModalOpen.set(false)">
      </app-confirm-modal>
    </div>
  `,
  styles: [`
    .students-container {
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
      align-items: center;
      flex-wrap: wrap;
    }

    .file-upload-label {
      cursor: pointer;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 260px;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .search-input {
      padding-left: 2.75rem;
    }

    .filter-group {
      display: flex;
      gap: 0.75rem;
    }

    .roll-badge {
      font-family: 'Fira Code', monospace;
      color: var(--primary);
    }

    .student-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
    }

    .student-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
    }

    .sem-tag {
      background: var(--bg-hover);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-secondary);
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

    .btn-approve-sm {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-sm);
      background: var(--warning-light);
      color: var(--warning);
      border: 1px solid rgba(245, 158, 11, 0.3);
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition);
    }

    .btn-approve-sm:hover {
      background: var(--warning);
      color: #fff;
    }
  `]
})
export class AdminStudentsComponent implements OnInit, OnDestroy {
  private firestore = inject(FirestoreService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private refreshTimer: any = null;

  public students = signal<UserProfile[]>([]);
  public courses = signal<Course[]>([]);

  // Use signals for filter state so computed() tracks changes reactively
  public searchQuery = signal<string>('');
  public selectedCourse = signal<string>('all');
  public selectedSemester = signal<string>('all');

  public isModalOpen = signal<boolean>(false);
  public editingStudent = signal<UserProfile | null>(null);

  public isDeleteModalOpen = signal<boolean>(false);
  public studentToDelete = signal<UserProfile | null>(null);

  public studentForm = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    rollNo: ['', Validators.required],
    semester: [1, Validators.required],
    courseId: ['', Validators.required],
    phoneNumber: ['']
  });

  public filteredStudents = computed(() => {
    let list = this.students();
    const query = this.searchQuery().toLowerCase().trim();

    if (query) {
      list = list.filter(s =>
        s.displayName.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        (s.rollNo && s.rollNo.toLowerCase().includes(query))
      );
    }

    if (this.selectedCourse() !== 'all') {
      list = list.filter(s => s.courseId === this.selectedCourse());
    }

    if (this.selectedSemester() !== 'all') {
      list = list.filter(s => s.semester === Number(this.selectedSemester()));
    }

    return list;
  });

  async ngOnInit(): Promise<void> {
    await this.loadData();

    // AJAX-style background auto-refresh every 4 seconds
    this.refreshTimer = setInterval(async () => {
      // Only refresh if modal is closed so as not to interrupt active edits
      if (!this.isModalOpen() && !this.isDeleteModalOpen()) {
        await this.loadData();
      }
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  async loadData(): Promise<void> {
    const allUsers = await this.firestore.getAllUsers();
    this.students.set(allUsers.filter(u => u.role === 'student'));
    const coursesList = await this.firestore.getCourses();
    this.courses.set(coursesList);
  }

  openAddModal(): void {
    this.editingStudent.set(null);
    this.studentForm.reset({
      semester: 1,
      courseId: this.courses().length > 0 ? this.courses()[0].id : '',
      displayName: '',
      email: '',
      rollNo: '',
      phoneNumber: ''
    });
    this.isModalOpen.set(true);
  }

  openEditModal(student: UserProfile): void {
    this.editingStudent.set(student);
    this.studentForm.patchValue({
      displayName: student.displayName,
      email: student.email,
      rollNo: student.rollNo || '',
      semester: student.semester || 1,
      courseId: student.courseId || '',
      phoneNumber: student.phoneNumber || ''
    });
    this.isModalOpen.set(true);
  }

  async saveStudent(): Promise<void> {
    if (this.studentForm.invalid) return;

    const val = this.studentForm.value;
    const course = this.courses().find(c => c.id === val.courseId);
    const existing = this.editingStudent();

    if (existing) {
      const updated: UserProfile = {
        ...existing,
        displayName: val.displayName!,
        email: val.email!,
        rollNo: val.rollNo!,
        semester: Number(val.semester),
        courseId: val.courseId!,
        courseName: course ? course.name : existing.courseName,
        phoneNumber: val.phoneNumber || '',
        updatedAt: new Date().toISOString()
      };
      await this.firestore.saveUserProfile(updated);
      this.toast.success(`Student ${updated.displayName} updated successfully!`);
    } else {
      const newStudent: UserProfile = {
        uid: 'usr_student_' + Date.now().toString(36),
        displayName: val.displayName!,
        email: val.email!,
        role: 'student',
        approved: true,
        status: 'active',
        rollNo: val.rollNo!,
        semester: Number(val.semester),
        courseId: val.courseId!,
        courseName: course ? course.name : 'Computer Science',
        phoneNumber: val.phoneNumber || '',
        createdAt: new Date().toISOString()
      };
      await this.firestore.saveUserProfile(newStudent);
      this.toast.success(`Student ${newStudent.displayName} enrolled successfully!`);
    }

    this.isModalOpen.set(false);
    await this.loadData();
  }

  confirmDelete(student: UserProfile): void {
    this.studentToDelete.set(student);
    this.isDeleteModalOpen.set(true);
  }

  async executeDelete(): Promise<void> {
    const student = this.studentToDelete();
    if (!student) return;

    await this.firestore.deleteUser(student.uid);
    this.toast.success(`Student ${student.displayName} deleted successfully.`);
    this.isDeleteModalOpen.set(false);
    this.studentToDelete.set(null);
    await this.loadData();
  }

  async approveStudent(student: UserProfile): Promise<void> {
    await this.firestore.updateUserStatus(student.uid, 'active', true);
    this.toast.success(`Student ${student.displayName} has been approved!`);
    await this.loadData();
  }

  downloadCsvTemplate(): void {
    const header = 'RollNo,Name,Email,Semester,PhoneNumber\n';
    const sample = '2026-CS-101,John Doe,john.doe@eduportal.com,5,+919876543210\n2026-CS-102,Jane Smith,jane.smith@eduportal.com,5,+919876543211\n';
    const blob = new Blob([header + sample], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'eduportal_students_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toast.info('Sample CSV template downloaded.');
  }

  handleCsvFile(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const text = e.target.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      if (lines.length <= 1) {
        this.toast.error('The selected CSV file does not contain any student records.');
        return;
      }

      let imported = 0;
      const defaultCourse = this.courses()[0];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length >= 3) {
          const rollNo = parts[0];
          const name = parts[1];
          const email = parts[2];
          const sem = parts[3] ? parseInt(parts[3]) || 1 : 1;
          const phone = parts[4] || '';

          const studentProfile: UserProfile = {
            uid: 'usr_csv_' + Date.now().toString(36) + i,
            displayName: name,
            email,
            role: 'student',
            approved: true,
            status: 'active',
            rollNo,
            semester: sem,
            courseId: defaultCourse ? defaultCourse.id : 'course_btech_cse',
            courseName: defaultCourse ? defaultCourse.name : 'B.Tech CSE',
            phoneNumber: phone,
            createdAt: new Date().toISOString()
          };

          await this.firestore.saveUserProfile(studentProfile);
          imported++;
        }
      }

      this.toast.success(`Successfully imported ${imported} students from CSV!`);
      await this.loadData();
    };

    reader.readAsText(file);
    event.target.value = '';
  }
}
