import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { Course, COURSE_LIST } from '../../models/course.enum';

/**
 * ====================================================================================
 * [EXPERIMENT 21] - Create a template-driven form for student admission
 * [EXPERIMENT 24] - Create a dynamic form using FormArray for subjects and marks
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * 1. Exp 21 (Template-driven Admission Form):
 *    Angular `#admissionForm="ngForm"` directive ka use karke Name, Email, Gender, Course
 *    ke fields ko validate karta hai (required, email format).
 * 2. Exp 24 (Dynamic Reactive Form with FormArray):
 *    Student ke dynamic subjects aur marksheet add karne ke liye `FormArray` ka use hota hai.
 *    User jitne chahe utne subjects dynamically add/remove kar sakta hai!
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * College New Admissions ke time student ki basic details (Exp 21) aur uske previous
 * qualifying exams ke multiple subjects aur marks (Exp 24) enter karne ke liye use hota hai.
 */

@Component({
  selector: 'app-admission',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admission.component.html',
  styleUrls: ['./admission.component.css']
})
export class AdmissionComponent implements OnInit {
  courses = COURSE_LIST;

  // [EXPERIMENT 21]: Template-driven model state
  templateModel = {
    name: '',
    email: '',
    gender: 'Male',
    course: Course.MCA,
    phone: '',
    address: '',
    agreeTerms: false
  };

  // [EXPERIMENT 24]: Reactive Form with FormArray for Dynamic Subjects
  dynamicSubjectsForm!: FormGroup;

  submissionSuccess: string | null = null;
  formType: 'template' | 'dynamic' = 'template';

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.initDynamicForm();
  }

  /**
   * [EXPERIMENT 24]: Initialize Reactive form with FormArray
   */
  private initDynamicForm(): void {
    this.dynamicSubjectsForm = this.fb.group({
      studentName: ['', [Validators.required, Validators.minLength(3)]],
      course: [Course.BCA, Validators.required],
      // [EXPERIMENT 24 FormArray]: Multiple dynamic subjects
      subjects: this.fb.array([
        this.createSubjectGroup('Programming in C/C++', 85),
        this.createSubjectGroup('Database Systems', 78)
      ])
    });
  }

  // Getter for subjects FormArray
  get subjects(): FormArray {
    return this.dynamicSubjectsForm.get('subjects') as FormArray;
  }

  // Factory function to create subject FormGroup
  createSubjectGroup(name: string = '', marks: number = 0): FormGroup {
    return this.fb.group({
      name: [name, [Validators.required]],
      marks: [marks, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  /**
   * [EXPERIMENT 24 ACTION]: Add a new subject row to FormArray
   */
  addSubject(): void {
    this.subjects.push(this.createSubjectGroup('', 70));
  }

  /**
   * [EXPERIMENT 24 ACTION]: Remove a subject row from FormArray
   */
  removeSubject(index: number): void {
    if (this.subjects.length > 1) {
      this.subjects.removeAt(index);
    } else {
      alert('At least one subject is required in the marksheet!');
    }
  }

  /**
   * Calculate average marks of FormArray
   */
  get calculatedAverage(): number {
    const rawSubs = this.subjects.value;
    if (!rawSubs || rawSubs.length === 0) return 0;
    const total = rawSubs.reduce((acc: number, curr: any) => acc + (Number(curr.marks) || 0), 0);
    return Math.round(total / rawSubs.length);
  }

  /**
   * [EXPERIMENT 21 SUBMIT]: Template-Driven Form Submission
   */
  onTemplateFormSubmit(form: any): void {
    if (form.invalid) {
      alert('Please correct all validation errors in the form before submitting.');
      return;
    }

    // Register student into centralized StudentService
    const created = this.studentService.addStudent({
      name: this.templateModel.name,
      course: this.templateModel.course,
      marks: 80, // Default admission entry marks
      email: this.templateModel.email,
      phone: this.templateModel.phone,
      gender: this.templateModel.gender as any,
      address: this.templateModel.address
    });

    this.submissionSuccess = `Admission Successful! Student "${created.name}" enrolled into ${created.course} with Student ID #${created.id}.`;
    form.resetForm({ gender: 'Male', course: Course.MCA });

    setTimeout(() => {
      this.submissionSuccess = null;
    }, 6000);
  }

  /**
   * [EXPERIMENT 24 SUBMIT]: Dynamic FormArray Submission
   */
  onDynamicFormSubmit(): void {
    if (this.dynamicSubjectsForm.invalid) {
      this.dynamicSubjectsForm.markAllAsTouched();
      alert('Please provide valid subject names and marks (0-100).');
      return;
    }

    const formVal = this.dynamicSubjectsForm.value;
    const subs = formVal.subjects.map((s: any) => ({
      name: s.name,
      marks: Number(s.marks),
      maxMarks: 100
    }));

    const avgMarks = this.calculatedAverage;

    const created = this.studentService.addStudent({
      name: formVal.studentName,
      course: formVal.course,
      marks: avgMarks,
      subjects: subs
    });

    this.submissionSuccess = `Dynamic Form Submitted! Enrolled "${created.name}" with ${subs.length} subjects and aggregate score ${avgMarks}%. (ID #${created.id})`;
    this.initDynamicForm();

    setTimeout(() => {
      this.submissionSuccess = null;
    }, 6000);
  }
}
