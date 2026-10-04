/**
 * ====================================================================================
 * [EXPERIMENT 13] - Task Model for Overdue Directive Highlight
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Ye model student tasks/assignments ko represent karta hai, jisme dueDate aur completion status hota hai.
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Student portal me har student ke assignments aur submission deadlines track karne ke liye
 * iska use hota hai. Agar dueDate nikal gayi hai, toh directive isko automatically RED color
 * me highlight karta hai.
 */

export interface StudentTask {
  id: number;
  title: string;
  course: string;
  dueDate: string; // ISO date string YYYY-MM-DD
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  assignedTo: string;
}

export const SAMPLE_TASKS: StudentTask[] = [
  {
    id: 1,
    title: 'Angular Directives & Pipes Lab Manual Submission',
    course: 'MCA',
    dueDate: '2024-03-01', // Past date -> OVERDUE!
    priority: 'High',
    completed: false,
    assignedTo: 'Neha'
  },
  {
    id: 2,
    title: 'Database Schema Design - Student Portal ERD',
    course: 'BCA',
    dueDate: '2024-04-15', // Past date -> OVERDUE!
    priority: 'Medium',
    completed: false,
    assignedTo: 'Amit Shah'
  },
  {
    id: 3,
    title: 'Reactive Forms with Custom Validators Assignment',
    course: 'iMCA',
    dueDate: '2026-12-31', // Future date -> NOT overdue
    priority: 'High',
    completed: false,
    assignedTo: 'Raj Patel'
  },
  {
    id: 4,
    title: 'Final Year Capstone Project Presentation',
    course: 'BCA_Hons',
    dueDate: '2027-01-20', // Future date -> NOT overdue
    priority: 'High',
    completed: false,
    assignedTo: 'Sonal Patel'
  }
];
