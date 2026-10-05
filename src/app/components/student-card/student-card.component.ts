import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Student } from '../../models/student.model';
import { AbbreviatePipe } from '../../pipes/abbreviate.pipe';

/**
 * ====================================================================================
 * [EXPERIMENT 7] - Create a reusable student card component
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Ye ek reusable UI component hai jo student ka photo, name, course, aur marks display karta hai.
 * 
 * [KAISE KAAM KARTA HAI?]:
 * 1. `@Input() student!: Student` ke zariye parent component (jaise StudentListComponent ya Dashboard)
 *    alag-alag student ka data pass karta hai.
 * 2. `@Input() showActions: boolean = true` controls whether edit/delete/view buttons appear.
 * 3. `@Output() delete = new EventEmitter<number>()` se delete event parent ko notify hota hai.
 * 4. Experiment 12 ki custom `AbbreviatePipe` bhi card badge me use ki gayi hai!
 * 5. Experiment 14 ka `[ngClass]` marks pass/fail styling ke liye use hua hai.
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Reusable components se code duplication khatam hoti hai. Ek hi card ko hum
 * Dashboard, Student Directory, aur Search Results har jagah reuse kar sakte hain.
 */

@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [CommonModule, RouterModule, AbbreviatePipe],
  templateUrl: './student-card.component.html',
  styleUrls: ['./student-card.component.css']
})
export class StudentCardComponent {
  // [EXPERIMENT 7 @Input() property] - Passes student data from parent
  @Input({ required: true }) student!: Student;
  @Input() showActions: boolean = true;
  @Input() showAbbreviation: boolean = true;

  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<Student>();
  @Output() editMarks = new EventEmitter<Student>();

  onDeleteClick(): void {
    if (confirm(`Are you sure you want to delete student: ${this.student.name} (ID: ${this.student.id})?`)) {
      this.delete.emit(this.student.id);
    }
  }

  onEditClick(): void {
    this.edit.emit(this.student);
  }

  onMarksClick(): void {
    this.editMarks.emit(this.student);
  }
}
