import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student.model';
import { AbbreviatePipe } from '../../pipes/abbreviate.pipe';

/**
 * ====================================================================================
 * [EXPERIMENT 19] - Add route parameters to display student details (/student/:id)
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Angular Router me dynamic route parameter `:id` ko read karke specific student
 * ki complete detail screen render karta hai.
 * Example URL: `/student/101` ya `/student/102`.
 * 
 * [KAISE KAAM KARTA HAI?]:
 * 1. `ActivatedRoute.snapshot.paramMap.get('id')` ya `route.paramMap.subscribe()` se URL parameter nikala jaata hai.
 * 2. String ID ko Number me convert karke `studentService.getStudentById(id)` call kiya jaata hai.
 * 3. Student ke academic record, subjects marksheet, course info, aur contact info display kiye jaate hain.
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Individual student profile, mark sheet printing, aur academic tracking ke liye
 * har student ka apna unique URL hota hai.
 */

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, AbbreviatePipe],
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.css']
})
export class StudentDetailComponent implements OnInit {
  studentId: number | null = null;
  student: Student | undefined;
  notFound: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    // [EXPERIMENT 19]: Read route parameter ':id'
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
}
