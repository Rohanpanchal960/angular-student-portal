import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { Student, DynamicSubject } from '../../models/student.model';
import { AbbreviatePipe } from '../../pipes/abbreviate.pipe';

/**
 * ====================================================================================
 * [EXPERIMENT 19] - Add route parameters to display student details (/student/:id)
 * Dedicated Marks & Subject management added
 * ====================================================================================
 */

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AbbreviatePipe],
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.css']
})
export class StudentDetailComponent implements OnInit {
  studentId: number | null = null;
  student: Student | undefined;
  notFound: boolean = false;

  // Marks & Subjects Modal
  isMarksModalOpen: boolean = false;
  modalMarks: number = 75;
  subjectsList: DynamicSubject[] = [];

  // Adding new subject row
  newSubName: string = '';
  newSubMarks: number = 80;
  newSubMax: number = 100;

  toastMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.studentId = Number(idParam);
        this.loadStudentData(this.studentId);
      } else {
        this.notFound = true;
      }
    });
  }

  private loadStudentData(id: number): void {
    this.student = this.studentService.getStudentById(id);
    if (!this.student) {
      this.notFound = true;
    }
  }

  openMarksModal(): void {
    if (!this.student) return;
    this.modalMarks = this.student.marks;
    this.subjectsList = this.student.subjects ? this.student.subjects.map(s => ({ ...s })) : [];
    this.newSubName = '';
    this.newSubMarks = 80;
    this.newSubMax = 100;
    this.isMarksModalOpen = true;
  }

  closeMarksModal(): void {
    this.isMarksModalOpen = false;
  }

  addSubject(): void {
    if (!this.newSubName.trim()) {
      alert('Subject name is required!');
      return;
    }
    this.subjectsList.push({
      name: this.newSubName.trim(),
      marks: Math.max(0, Math.min(this.newSubMax, Number(this.newSubMarks))),
      maxMarks: Number(this.newSubMax) || 100
    });
    this.newSubName = '';
    this.newSubMarks = 80;
  }

  removeSubject(index: number): void {
    this.subjectsList.splice(index, 1);
  }

  onSaveMarks(): void {
    if (this.studentId === null) return;

    if (this.modalMarks < 0 || this.modalMarks > 100) {
      alert('Marks must be between 0 and 100!');
      return;
    }

    this.studentService.updateMarks(this.studentId, this.modalMarks, this.subjectsList);
    this.loadStudentData(this.studentId);
    this.isMarksModalOpen = false;

    this.toastMessage = `Marks for ${this.student?.name} updated to ${this.modalMarks}/100 successfully!`;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3500);
  }
}
