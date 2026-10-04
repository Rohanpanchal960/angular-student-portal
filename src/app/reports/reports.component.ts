import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../services/student.service';
import { Student } from '../models/student.model';
import { COURSE_LIST } from '../models/course.enum';

/**
 * ====================================================================================
 * [EXPERIMENT 29] - Enable lazy loading for the Reports module
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Ye Reports feature module hai jo Angular initial bundle size ko chhota rakhne ke liye
 * LAZY LOAD hota hai. Yani jab tak user navbar me "/reports" par click nahi karta,
 * tab tak browser iska JavaScript chunk download nahi karta!
 * 
 * [KAISE KAAM KARTA HAI?]:
 * `app.routes.ts` me route configuration:
 * `{ path: 'reports', loadChildren: () => import('./reports/reports.routes').then(m => m.REPORTS_ROUTES) }`
 * Angular compiler iska separate chunk (e.g. `reports-*.js`) banata hai.
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Heavy analytical reports, charts, printable transcripts, aur grade distribution matrices
 * har user ko daily nahi chahiye hoti, isliye inko lazy-load karke app ki speed
 * aur performance boost ki jaati hai.
 */

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  students: Student[] = [];
  courses = COURSE_LIST;

  totalStudents = 0;
  totalPassed = 0;
  totalFailed = 0;
  distinctionCount = 0; // Marks >= 75

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.students = this.studentService.getAllStudents();
    this.totalStudents = this.students.length;
    this.totalPassed = this.students.filter(s => s.marks >= 40).length;
    this.totalFailed = this.students.filter(s => s.marks < 40).length;
    this.distinctionCount = this.students.filter(s => s.marks >= 75).length;
  }

  getStudentsByCourse(course: string): Student[] {
    return this.students.filter(s => s.course === course);
  }

  printReport(): void {
    window.print();
  }
}
