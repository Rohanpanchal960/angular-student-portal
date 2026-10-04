import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentTask, SAMPLE_TASKS } from '../../models/task.model';
import { HighlightOverdueDirective } from '../../directives/highlight-overdue.directive';

/**
 * ====================================================================================
 * [EXPERIMENT 13] - Create a custom directive to highlight overdue tasks
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Ye Assignments & Submissions management component hai.
 * Har task item par humari custom directive `appHighlightOverdue` apply ki gayi hai.
 * 
 * [KAISE KAAM KARTA HAI?]:
 * 1. Template usage: `<div [appHighlightOverdue]="task.dueDate" [isCompleted]="task.completed">`
 * 2. Directive check karti hai:
 *    Agar `task.dueDate < today` aur `!task.completed`, toh background soft red (#fef2f2)
 *    aur left border bold red (#ef4444) me convert ho jaata hai automatically!
 * 3. User tasks ko toggle complete kar sakta hai ya new task add kar sakta hai.
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * College me students ke practical assignments, term-work submissions, aur library books
 * return dates ko track karke overdue hone par warning colors show karne ke liye use hota hai.
 */

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, HighlightOverdueDirective],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent {
  tasks: StudentTask[] = [...SAMPLE_TASKS];

  newTask = {
    title: '',
    course: 'MCA',
    dueDate: '',
    priority: 'High' as 'High' | 'Medium' | 'Low',
    assignedTo: 'Neha'
  };

  todayDateStr = new Date().toISOString().split('T')[0];

  toggleTaskCompletion(task: StudentTask): void {
    task.completed = !task.completed;
  }

  isTaskOverdue(task: StudentTask): boolean {
    if (task.completed) return false;
    const taskDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() < today.getTime();
  }

  addNewTask(): void {
    if (!this.newTask.title || !this.newTask.dueDate) {
      alert('Please enter task title and due date!');
      return;
    }

    const task: StudentTask = {
      id: Date.now(),
      title: this.newTask.title,
      course: this.newTask.course,
      dueDate: this.newTask.dueDate,
      priority: this.newTask.priority,
      completed: false,
      assignedTo: this.newTask.assignedTo
    };

    this.tasks.unshift(task);
    this.newTask.title = '';
    this.newTask.dueDate = '';
  }

  deleteTask(id: number): void {
    this.tasks = this.tasks.filter(t => t.id !== id);
  }
}
