import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student.model';
import { Course, COURSE_LIST } from '../../models/course.enum';
import { StudentCardComponent } from '../student-card/student-card.component';
import { CounterService } from '../../services/counter.service';

/**
 * ====================================================================================
 * [EXPERIMENT 6] - Use Angular CLI to generate a new component (Dashboard)
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Dashboard component pure Student Management System ka central overview screen hai.
 * Ye high-level summary metrics jaise "Total Students", "Total Courses",
 * "Passing Rate", "Average Marks", aur recent students display karta hai.
 * 
 * [KAISE KAAM KARTA HAI?]:
 * 1. `StudentService` se student list retrieve karta hai.
 * 2. Course enum se total available courses count nikalta hai (`COURSE_LIST.length`).
 * 3. Average marks aur pass/fail count calculate karta hai.
 * 4. Experiment 7 ke reusable `StudentCardComponent` ko recent students show karne ke liye reuse karta hai!
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Teachers, HODs, aur administrators ke liye ek-nazar (at-a-glance) analytics
 * aur key indicators provide karta hai.
 */

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StudentCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  students: Student[] = [];
  
  // Experiment 6 summary data metrics
  totalStudents: number = 0;
  totalCourses: number = 0;
  averageMarks: number = 0;
  passedStudentsCount: number = 0;
  failedStudentsCount: number = 0;
  passPercentage: number = 0;

  // Course wise breakdown
  courseBreakdown: { course: Course; count: number; percentage: number }[] = [];

  constructor(
    public studentService: StudentService,
    public counterService: CounterService
  ) {}

  ngOnInit(): void {
    this.studentService.students$.subscribe(list => {
      this.students = list;
      this.calculateDashboardMetrics();
    });
  }

  private calculateDashboardMetrics(): void {
    this.totalStudents = this.students.length;
    this.totalCourses = COURSE_LIST.length; // e.g. BCA, MCA, iMCA, BCA_Hons

    if (this.totalStudents > 0) {
      const sumMarks = this.students.reduce((acc, curr) => acc + curr.marks, 0);
      this.averageMarks = Math.round((sumMarks / this.totalStudents) * 10) / 10;
      
      this.passedStudentsCount = this.students.filter(s => s.marks >= 40).length;
      this.failedStudentsCount = this.students.filter(s => s.marks < 40).length;
      this.passPercentage = Math.round((this.passedStudentsCount / this.totalStudents) * 100);

      // Course breakdown
      this.courseBreakdown = COURSE_LIST.map(c => {
        const count = this.students.filter(s => s.course === c).length;
        const percentage = Math.round((count / this.totalStudents) * 100);
        return { course: c, count, percentage };
      });
    } else {
      this.averageMarks = 0;
      this.passedStudentsCount = 0;
      this.failedStudentsCount = 0;
      this.passPercentage = 0;
      this.courseBreakdown = [];
    }
  }

  get recentStudents(): Student[] {
    return this.students.slice(0, 3);
  }
}
