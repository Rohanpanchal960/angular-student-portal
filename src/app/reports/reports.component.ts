import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { StudentService } from '../services/student.service';
import { Student, DynamicSubject } from '../models/student.model';
import { COURSE_LIST } from '../models/course.enum';

export interface CourseAnalytics {
  course: string;
  total: number;
  passed: number;
  failed: number;
  passPercentage: number;
  averageMarks: number;
  topStudent?: Student;
}

export interface MarksheetSubject {
  name: string;
  maxMarks: number;
  marksObtained: number;
  gradePoint: number;
  status: 'PASS' | 'FAIL';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, OnDestroy {
  // All students from service
  students: Student[] = [];
  courses = COURSE_LIST;
  private sub: Subscription = new Subscription();

  // Active view tab: 'master' | 'department' | 'merit'
  activeTab: 'master' | 'department' | 'merit' = 'master';

  // Filters & Search
  searchTerm: string = '';
  selectedCourse: string = 'ALL';
  selectedGrade: string = 'ALL';
  selectedSort: string = 'marks_desc'; // 'marks_desc' | 'marks_asc' | 'name_asc' | 'id_asc'

  // Summary KPIs
  totalStudents = 0;
  totalPassed = 0;
  totalFailed = 0;
  passRate = 0;
  failRate = 0;
  averageScore = 0;
  distinctionCount = 0; // >= 75
  firstClassCount = 0;  // 60 <= marks < 75
  passClassCount = 0;   // 40 <= marks < 60
  topStudent: Student | null = null;

  // Grade breakdown percentages
  distinctionPct = 0;
  firstClassPct = 0;
  passClassPct = 0;
  failPct = 0;

  // Marksheet Modal
  selectedStudentForMarksheet: Student | null = null;
  marksheetSubjects: MarksheetSubject[] = [];

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.sub = this.studentService.students$.subscribe(list => {
      this.students = list;
      this.calculateStats();
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  calculateStats(): void {
    this.totalStudents = this.students.length;
    if (this.totalStudents === 0) {
      this.totalPassed = 0;
      this.totalFailed = 0;
      this.passRate = 0;
      this.failRate = 0;
      this.averageScore = 0;
      this.distinctionCount = 0;
      this.firstClassCount = 0;
      this.passClassCount = 0;
      this.topStudent = null;
      this.distinctionPct = 0;
      this.firstClassPct = 0;
      this.passClassPct = 0;
      this.failPct = 0;
      return;
    }

    this.totalPassed = this.students.filter(s => s.marks >= 40).length;
    this.totalFailed = this.students.filter(s => s.marks < 40).length;
    this.passRate = Math.round((this.totalPassed / this.totalStudents) * 100);
    this.failRate = Math.round((this.totalFailed / this.totalStudents) * 100);

    const totalMarksSum = this.students.reduce((acc, s) => acc + s.marks, 0);
    this.averageScore = Math.round(totalMarksSum / this.totalStudents);

    this.distinctionCount = this.students.filter(s => s.marks >= 75).length;
    this.firstClassCount = this.students.filter(s => s.marks >= 60 && s.marks < 75).length;
    this.passClassCount = this.students.filter(s => s.marks >= 40 && s.marks < 60).length;

    this.distinctionPct = Math.round((this.distinctionCount / this.totalStudents) * 100);
    this.firstClassPct = Math.round((this.firstClassCount / this.totalStudents) * 100);
    this.passClassPct = Math.round((this.passClassCount / this.totalStudents) * 100);
    this.failPct = Math.round((this.totalFailed / this.totalStudents) * 100);

    // Top Student
    const sorted = [...this.students].sort((a, b) => b.marks - a.marks);
    this.topStudent = sorted.length > 0 ? sorted[0] : null;
  }

  get filteredStudents(): Student[] {
    let result = [...this.students];

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.id.toString().includes(term) ||
        (s.email && s.email.toLowerCase().includes(term))
      );
    }

    // Course filter
    if (this.selectedCourse !== 'ALL') {
      result = result.filter(s => s.course === this.selectedCourse);
    }

    // Grade / Status filter
    if (this.selectedGrade === 'DISTINCTION') {
      result = result.filter(s => s.marks >= 75);
    } else if (this.selectedGrade === 'FIRST_CLASS') {
      result = result.filter(s => s.marks >= 60 && s.marks < 75);
    } else if (this.selectedGrade === 'PASS_CLASS') {
      result = result.filter(s => s.marks >= 40 && s.marks < 60);
    } else if (this.selectedGrade === 'FAIL') {
      result = result.filter(s => s.marks < 40);
    }

    // Sorting
    if (this.selectedSort === 'marks_desc') {
      result.sort((a, b) => b.marks - a.marks);
    } else if (this.selectedSort === 'marks_asc') {
      result.sort((a, b) => a.marks - b.marks);
    } else if (this.selectedSort === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.selectedSort === 'id_asc') {
      result.sort((a, b) => a.id - b.id);
    }

    return result;
  }

  get topRankers(): Student[] {
    return [...this.students].sort((a, b) => b.marks - a.marks);
  }

  get departmentAnalytics(): CourseAnalytics[] {
    return this.courses.map(course => {
      const courseStudents = this.students.filter(s => s.course === course);
      const total = courseStudents.length;
      const passed = courseStudents.filter(s => s.marks >= 40).length;
      const failed = total - passed;
      const passPercentage = total > 0 ? Math.round((passed / total) * 100) : 0;
      const avg = total > 0 ? Math.round(courseStudents.reduce((sum, s) => sum + s.marks, 0) / total) : 0;
      const top = courseStudents.length > 0 ? [...courseStudents].sort((a, b) => b.marks - a.marks)[0] : undefined;

      return {
        course,
        total,
        passed,
        failed,
        passPercentage,
        averageMarks: avg,
        topStudent: top
      };
    });
  }

  getStudentsByCourse(course: string): Student[] {
    return this.students.filter(s => s.course === course);
  }

  calculateCGPA(marks: number): string {
    return (marks / 9.5).toFixed(2);
  }

  getGradeLabel(marks: number): string {
    if (marks >= 85) return 'A+ (Distinction)';
    if (marks >= 70) return 'A (First Class)';
    if (marks >= 55) return 'B (Higher Second)';
    if (marks >= 40) return 'C (Pass Class)';
    return 'F (Fail)';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCourse = 'ALL';
    this.selectedGrade = 'ALL';
    this.selectedSort = 'marks_desc';
  }

  openMarksheet(student: Student): void {
    this.selectedStudentForMarksheet = student;
    if (student.subjects && student.subjects.length > 0) {
      this.marksheetSubjects = student.subjects.map(sub => ({
        name: sub.name,
        maxMarks: sub.maxMarks || 100,
        marksObtained: sub.marks,
        gradePoint: parseFloat((sub.marks / 10).toFixed(1)),
        status: sub.marks >= 40 ? 'PASS' : 'FAIL'
      }));
    } else {
      // Fallback subjects based on student marks
      this.marksheetSubjects = [
        { 
          name: 'Core Computing & Programming', 
          maxMarks: 100, 
          marksObtained: student.marks, 
          gradePoint: parseFloat((student.marks / 10).toFixed(1)), 
          status: student.marks >= 40 ? 'PASS' : 'FAIL' 
        },
        { 
          name: 'Database Management Systems', 
          maxMarks: 100, 
          marksObtained: Math.min(100, Math.max(25, student.marks + 4)), 
          gradePoint: parseFloat((Math.min(100, Math.max(25, student.marks + 4)) / 10).toFixed(1)), 
          status: (student.marks + 4) >= 40 ? 'PASS' : 'FAIL' 
        },
        { 
          name: 'Web Technology & Modern Frameworks', 
          maxMarks: 100, 
          marksObtained: Math.min(100, Math.max(20, student.marks - 3)), 
          gradePoint: parseFloat((Math.min(100, Math.max(20, student.marks - 3)) / 10).toFixed(1)), 
          status: (student.marks - 3) >= 40 ? 'PASS' : 'FAIL' 
        },
        { 
          name: 'Operating Systems & Architecture', 
          maxMarks: 100, 
          marksObtained: Math.min(100, Math.max(30, student.marks + 2)), 
          gradePoint: parseFloat((Math.min(100, Math.max(30, student.marks + 2)) / 10).toFixed(1)), 
          status: (student.marks + 2) >= 40 ? 'PASS' : 'FAIL' 
        }
      ];
    }
  }

  closeMarksheet(): void {
    this.selectedStudentForMarksheet = null;
    this.marksheetSubjects = [];
  }

  exportToCSV(): void {
    const dataToExport = this.filteredStudents;
    if (dataToExport.length === 0) {
      alert('No student records to export for current filters.');
      return;
    }

    const headers = ['Roll ID', 'Student Name', 'Course / Program', 'Marks (%)', 'Grade', 'CGPA', 'Status', 'Email', 'Phone', 'Enrollment Date'];
    const rows = dataToExport.map(s => [
      `"${s.id}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.course}"`,
      `"${s.marks}%"`,
      `"${s.getGrade()}"`,
      `"${this.calculateCGPA(s.marks)}"`,
      `"${s.marks >= 40 ? 'PASS' : 'FAIL'}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.enrollmentDate ? s.enrollmentDate.substring(0, 10) : ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Academic_Performance_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  printReport(): void {
    window.print();
  }
}
