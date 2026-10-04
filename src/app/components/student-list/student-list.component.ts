import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student.model';
import { Course, COURSE_LIST } from '../../models/course.enum';
import { StudentCardComponent } from '../student-card/student-card.component';
import { AbbreviatePipe } from '../../pipes/abbreviate.pipe';

/**
 * ====================================================================================
 * [EXPERIMENT 8] - Use ngIf and ngFor to display and hide a student list
 * [EXPERIMENT 14] - Use ngClass for conditional styling of student marks (>=40 green, <40 red)
 * [EXPERIMENT 15] - Consume StudentService getAllStudents()
 * [EXPERIMENT 30] - Mini Project with full CRUD operations for Student Management System
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Ye Student Management System ka main directory screen hai jisme:
 * 1. `showList: boolean = true`: Checkbox toggle se *ngIf list ko hide/show karta hai (Exp 8 requirement).
 * 2. `*ngFor="let student of filteredStudents"`: Sabhi students ko iterate karta hai (Exp 8 requirement).
 * 3. `[ngClass]="{ 'marks-pass': s.marks >= 40, 'marks-fail': s.marks < 40 }"`: Pass/Fail marks
 *    ko green aur red text/badge me conditionally style karta hai (Exp 14 requirement).
 * 4. Full CRUD operations:
 *    - CREATE: Naya student add karna with validation
 *    - READ: Search, Course filter, Status filter, Table view aur Card grid view toggle
 *    - UPDATE: Existing student ke marks, name, phone, course edit karna
 *    - DELETE: Student record remove karna with confirmation
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Teachers aur admin students ko manage karne ke liye isi page ka sabse zyada use karte hain.
 */

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StudentCardComponent, AbbreviatePipe],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  // [EXPERIMENT 8]: Boolean variable to toggle list visibility with *ngIf
  showList: boolean = true;

  // View mode: 'grid' (Student Cards Exp 7) or 'table' (Data table with Exp 14 ngClass)
  viewMode: 'grid' | 'table' = 'table';

  students: Student[] = [];
  searchTerm: string = '';
  selectedCourseFilter: string = 'ALL';
  selectedStatusFilter: string = 'ALL';

  courseList = COURSE_LIST;

  // CRUD Modal State
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  currentEditingId: number | null = null;

  // Form Model for Add/Edit
  formData = {
    name: '',
    course: Course.BCA as Course | string,
    marks: 75,
    email: '',
    phone: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    address: ''
  };

  // Toast message
  toastMessage: string | null = null;
  toastType: 'success' | 'danger' | 'info' = 'success';

  constructor(public studentService: StudentService) {}

  ngOnInit(): void {
    // [EXPERIMENT 15]: Subscribing to central student service stream
    this.studentService.students$.subscribe(data => {
      this.students = data;
    });
  }

  // Filtered list getter based on search, course filter, and pass/fail status
  get filteredStudents(): Student[] {
    return this.students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.id.toString().includes(this.searchTerm) ||
        (student.email && student.email.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesCourse = 
        this.selectedCourseFilter === 'ALL' || student.course === this.selectedCourseFilter;

      const matchesStatus = 
        this.selectedStatusFilter === 'ALL' ||
        (this.selectedStatusFilter === 'PASS' && student.marks >= 40) ||
        (this.selectedStatusFilter === 'FAIL' && student.marks < 40);

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }

  // CRUD Modal open for Add
  openAddModal(): void {
    this.isEditMode = false;
    this.currentEditingId = null;
    this.formData = {
      name: '',
      course: Course.BCA,
      marks: 65,
      email: '',
      phone: '',
      gender: 'Male',
      address: ''
    };
    this.isModalOpen = true;
  }

  // CRUD Modal open for Edit
  openEditModal(student: Student): void {
    this.isEditMode = true;
    this.currentEditingId = student.id;
    this.formData = {
      name: student.name,
      course: student.course,
      marks: student.marks,
      email: student.email || '',
      phone: student.phone || '',
      gender: student.gender || 'Male',
      address: student.address || ''
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  // Save student (Add or Edit)
  onSaveStudent(): void {
    if (!this.formData.name.trim()) {
      alert('Student name is required!');
      return;
    }

    if (this.formData.marks < 0 || this.formData.marks > 100) {
      alert('Marks must be between 0 and 100!');
      return;
    }

    if (this.isEditMode && this.currentEditingId !== null) {
      // UPDATE [Exp 30]
      this.studentService.updateStudent(this.currentEditingId, {
        name: this.formData.name.trim(),
        course: this.formData.course,
        marks: Number(this.formData.marks),
        email: this.formData.email,
        phone: this.formData.phone,
        gender: this.formData.gender,
        address: this.formData.address
      });
      this.showToast(`Student #${this.currentEditingId} updated successfully!`, 'success');
    } else {
      // CREATE [Exp 30]
      const created = this.studentService.addStudent({
        name: this.formData.name.trim(),
        course: this.formData.course,
        marks: Number(this.formData.marks),
        email: this.formData.email,
        phone: this.formData.phone,
        gender: this.formData.gender,
        address: this.formData.address,
        subjects: [
          { name: 'Core Computing', marks: Number(this.formData.marks), maxMarks: 100 },
          { name: 'Practical Lab', marks: Math.min(100, Number(this.formData.marks) + 5), maxMarks: 100 }
        ]
      });
      this.showToast(`Student ${created.name} added successfully with ID #${created.id}!`, 'success');
    }

    this.closeModal();
  }

  // DELETE [Exp 30]
  onDeleteStudent(id: number): void {
    const student = this.studentService.getStudentById(id);
    const confirmed = confirm(`Are you sure you want to delete student "${student?.name}" (ID #${id})?`);
    if (confirmed) {
      this.studentService.deleteStudent(id);
      this.showToast(`Student #${id} deleted successfully!`, 'danger');
    }
  }

  resetAllData(): void {
    if (confirm('Reset student records to syllabus initial sample dataset?')) {
      this.studentService.resetToDefault();
      this.showToast('Reset to default syllabus students!', 'info');
    }
  }

  private showToast(msg: string, type: 'success' | 'danger' | 'info'): void {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3500);
  }
}
