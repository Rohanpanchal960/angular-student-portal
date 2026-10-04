import { Course } from './course.enum';

/**
 * ====================================================================================
 * [EXPERIMENT 3] - Create a simple TypeScript class for a student
 * [EXPERIMENT 27] - Contains getFullName() method for unit testing
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * TypeScript me `Class` ek blueprint hoti hai objects create karne ke liye.
 * Is class me student ke properties (id, name, course, marks) aur helper methods hain.
 * 
 * [KAISE KAAM KARTA HAI?]:
 * 1. Constructor ke through har student ka new instance banaya jaata hai.
 * 2. Static aur member methods provide kiye gaye hain jo data calculate karte hain (e.g. getGrade, isPassed).
 * 3. `getFullName()` method first aur last name ko clean format me join karta hai (Exp 27 Unit Test ke liye).
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Poore system me har student entity issi class se validate aur represent hoti hai.
 * Service, CRUD operations, List view, aur Detail view issi Student class ka use karte hain.
 */

export interface DynamicSubject {
  name: string;
  marks: number;
  maxMarks: number;
}

export class Student {
  id: number;
  name: string;
  course: Course | string;
  marks: number;
  email?: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  photoUrl?: string;
  enrollmentDate?: string;
  subjects?: DynamicSubject[];

  constructor(
    id: number,
    name: string,
    course: Course | string,
    marks: number,
    email: string = '',
    phone: string = '',
    gender: 'Male' | 'Female' | 'Other' = 'Male',
    address: string = '',
    photoUrl: string = '',
    enrollmentDate: string = new Date().toISOString(),
    subjects: DynamicSubject[] = []
  ) {
    this.id = id;
    this.name = name;
    this.course = course;
    this.marks = marks;
    this.email = email;
    this.phone = phone;
    this.gender = gender;
    this.address = address;
    this.photoUrl = photoUrl;
    this.enrollmentDate = enrollmentDate;
    this.subjects = subjects;
  }

  /**
   * [EXPERIMENT 27 UNIT TEST METHOD]:
   * Method getFullName() jo firstName aur lastName ko merge karke clean string deta hai.
   * Example: getFullName('Raj', 'Patel') => 'Raj Patel'
   */
  static getFullName(firstName: string, lastName: string): string {
    if (!firstName && !lastName) return '';
    if (!firstName) return lastName.trim();
    if (!lastName) return firstName.trim();
    return `${firstName.trim()} ${lastName.trim()}`;
  }

  /**
   * Helper method to calculate grade based on marks
   * [EXPERIMENT 14]: Marks >= 40 is PASS, < 40 is FAIL
   */
  getGrade(): string {
    if (this.marks >= 85) return 'A+';
    if (this.marks >= 70) return 'A';
    if (this.marks >= 55) return 'B';
    if (this.marks >= 40) return 'C';
    return 'F';
  }

  isPassed(): boolean {
    return this.marks >= 40;
  }
}
