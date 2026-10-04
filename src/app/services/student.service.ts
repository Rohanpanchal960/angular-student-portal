import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Student, DynamicSubject } from '../models/student.model';
import { Course } from '../models/course.enum';

/**
 * ====================================================================================
 * [EXPERIMENT 15] - Create a student service to share data between components
 * [EXPERIMENT 30] - Mini Project with full CRUD operations for Student Management System
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Angular me `Service` business logic, data state aur CRUD operations ko centralize karti hai.
 * `@Injectable({ providedIn: 'root' })` decorator ise application-wide Singleton Dependency Injection provide karta hai.
 * 
 * [KAISE KAAM KARTA HAI?]:
 * 1. `getAllStudents()` method sabhi components ko student list provide karta hai (Exp 15 requirement).
 * 2. RxJS `BehaviorSubject<Student[]>` state ko reactive banata hai; jab bhi naya student add ya delete hota hai,
 *    sabhi subscribed components automatically live update ho jaate hain.
 * 3. Full CRUD (Create, Read, Update, Delete) implemented with LocalStorage fallback.
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Ye pure Student Portal ka central brain (data store) hai. Dashboard, Student List,
 * Detail View, Admissions aur Reports sabhi issi service se connect hote hain.
 */

export interface CreateStudentDto {
  id?: number;
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
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly STORAGE_KEY = 'sms_student_portal_data_v1';

  // Initial seed students dataset containing syllabus examples
  private initialStudents: Student[] = [
    new Student(
      101,
      'Neha Sharma',
      Course.MCA,
      88, // Exp 3: { id: 101, name: 'Neha', course: 'MCA', marks: 88 }
      'neha.mca@example.com',
      '+91 98765 43210',
      'Female',
      'Flat 402, Green Valley Apts, Ahmedabad',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=60',
      '2024-07-15',
      [
        { name: 'Angular Framework', marks: 92, maxMarks: 100 },
        { name: 'Cloud Computing', marks: 85, maxMarks: 100 },
        { name: 'Advanced Java', marks: 87, maxMarks: 100 }
      ]
    ),
    new Student(
      102,
      'Amit Shah',
      Course.BCA,
      75, // Exp 2: { name: 'Amit Shah', email: 'amit@example.com', age: 21 }
      'amit@example.com',
      '+91 91234 56789',
      'Male',
      '12, Shanti Nagar, SG Highway, Ahmedabad',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60',
      '2023-08-10',
      [
        { name: 'Web Technology', marks: 78, maxMarks: 100 },
        { name: 'Database Management', marks: 72, maxMarks: 100 }
      ]
    ),
    new Student(
      103,
      'Sonal K Patel',
      Course.BCA_Hons,
      94, // Exp 12: "Sonal K Patel" -> AbbreviatePipe -> "S.K.P."
      'sonal.patel@example.com',
      '+91 99887 76655',
      'Female',
      'B-501, Heritage Pride, Surat',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60',
      '2024-06-20',
      [
        { name: 'Artificial Intelligence', marks: 96, maxMarks: 100 },
        { name: 'Data Structures', marks: 92, maxMarks: 100 }
      ]
    ),
    new Student(
      104,
      'Raj Patel',
      Course.iMCA,
      35, // Exp 14: Marks < 40 for RED conditional styling, Exp 27: getFullName('Raj', 'Patel')
      'raj.patel@example.com',
      '+91 97654 32109',
      'Male',
      '7, Royal Heights, Vadodara',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60',
      '2022-09-01',
      [
        { name: 'Operating Systems', marks: 32, maxMarks: 100 },
        { name: 'Computer Networks', marks: 38, maxMarks: 100 }
      ]
    ),
    new Student(
      105,
      'Pooja Verma',
      Course.MCA,
      68,
      'pooja.verma@example.com',
      '+91 94567 89012',
      'Female',
      '22, University Road, Rajkot',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=60',
      '2024-08-01',
      [
        { name: 'Full Stack Development', marks: 70, maxMarks: 100 },
        { name: 'Software Engineering', marks: 66, maxMarks: 100 }
      ]
    ),
    new Student(
      106,
      'Karan Joshi',
      Course.BCA,
      28, // Exp 14: Below 40 (Fail / Red warning)
      'karan.joshi@example.com',
      '+91 93214 56780',
      'Male',
      '88, New City Light, Surat',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60',
      '2023-07-22',
      [
        { name: 'C Programming', marks: 25, maxMarks: 100 },
        { name: 'Digital Electronics', marks: 31, maxMarks: 100 }
      ]
    )
  ];

  // Reactive state stream using BehaviorSubject
  private studentsSubject = new BehaviorSubject<Student[]>([]);
  public students$: Observable<Student[]> = this.studentsSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const rawList = JSON.parse(stored);
        const instantiatedList = rawList.map((item: any) => new Student(
          item.id,
          item.name,
          item.course,
          item.marks,
          item.email,
          item.phone,
          item.gender,
          item.address,
          item.photoUrl,
          item.enrollmentDate,
          item.subjects
        ));
        this.studentsSubject.next(instantiatedList);
        return;
      }
    } catch (e) {
      console.warn('LocalStorage not available, using in-memory list');
    }

    // Default seed
    this.studentsSubject.next(this.initialStudents);
    this.persistToStorage(this.initialStudents);
  }

  private persistToStorage(list: Student[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Could not save to LocalStorage');
    }
  }

  /**
   * [EXPERIMENT 15 METHOD]: getAllStudents()
   * Multiple components ko student data provide karne ke liye method
   */
  getAllStudents(): Student[] {
    return this.studentsSubject.getValue();
  }

  /**
   * [EXPERIMENT 19]: Read student by dynamic route parameter ID
   */
  getStudentById(id: number): Student | undefined {
    return this.studentsSubject.getValue().find(s => s.id === id);
  }

  /**
   * [EXPERIMENT 30 CRUD - CREATE]: Add a new student
   */
  addStudent(studentData: CreateStudentDto): Student {
    const current = this.studentsSubject.getValue();
    const newId = studentData.id || (current.length > 0 ? Math.max(...current.map(s => s.id)) + 1 : 101);

    const newStudent = new Student(
      newId,
      studentData.name,
      studentData.course,
      studentData.marks,
      studentData.email || `${studentData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      studentData.phone || '+91 99999 88888',
      studentData.gender || 'Male',
      studentData.address || 'Campus Hostel Block B',
      studentData.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentData.name}`,
      studentData.enrollmentDate || new Date().toISOString(),
      studentData.subjects || []
    );

    const updated = [newStudent, ...current];
    this.studentsSubject.next(updated);
    this.persistToStorage(updated);
    return newStudent;
  }

  /**
   * [EXPERIMENT 30 CRUD - UPDATE]: Update existing student
   */
  updateStudent(id: number, updatedFields: Partial<Student>): Student | null {
    const current = this.studentsSubject.getValue();
    const index = current.findIndex(s => s.id === id);
    if (index === -1) return null;

    const existing = current[index];
    const updated = new Student(
      existing.id,
      updatedFields.name ?? existing.name,
      updatedFields.course ?? existing.course,
      updatedFields.marks ?? existing.marks,
      updatedFields.email ?? existing.email,
      updatedFields.phone ?? existing.phone,
      updatedFields.gender ?? existing.gender,
      updatedFields.address ?? existing.address,
      updatedFields.photoUrl ?? existing.photoUrl,
      existing.enrollmentDate,
      updatedFields.subjects ?? existing.subjects
    );

    const listCopy = [...current];
    listCopy[index] = updated;
    this.studentsSubject.next(listCopy);
    this.persistToStorage(listCopy);
    return updated;
  }

  /**
   * [EXPERIMENT 30 CRUD - DELETE]: Remove student
   */
  deleteStudent(id: number): boolean {
    const current = this.studentsSubject.getValue();
    const filtered = current.filter(s => s.id !== id);
    if (filtered.length === current.length) return false;

    this.studentsSubject.next(filtered);
    this.persistToStorage(filtered);
    return true;
  }

  /**
   * Reset data to syllabus default
   */
  resetToDefault(): void {
    this.studentsSubject.next(this.initialStudents);
    this.persistToStorage(this.initialStudents);
  }
}
