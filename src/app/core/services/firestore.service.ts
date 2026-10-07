import { Injectable, inject } from '@angular/core';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  QueryConstraint
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import {
  UserProfile,
  Course,
  Subject,
  Enrollment,
  AttendanceRecord,
  Assessment,
  MarksRecord,
  ExamTimetable,
  Notice,
  SemesterResultSheet
} from '../models';

/**
 * ====================================================================================
 * FIRESTORE SERVICE - COMPREHENSIVE DATA ACCESS LAYER
 * ====================================================================================
 * Yeh service Firestore database ke saare collections aur documents ke saath
 * CRUD operations execute karti hai using modern Firebase v9/v10/v11 modular SDK.
 *
 * COLLECTIONS MANAGED:
 * 1. 'users'       - Student, Faculty, Admin profiles
 * 2. 'courses'     - Academic courses (BTech, BCA, MCA, etc.)
 * 3. 'subjects'    - Subjects linked to course and faculty
 * 4. 'enrollments' - Student enrollment records
 * 5. 'attendance'  - Daily attendance (`${subjectId}_${date}_${studentId}`)
 * 6. 'assessments' - Tests, assignments, quizzes
 * 7. 'marks'       - Marks obtained (`${assessmentId}_${studentId}`)
 * 8. 'exams'       - Examination timetable
 * 9. 'notices'     - Announcements targeted by role or course
 * 10. 'results'    - Semester result sheets & SGPA
 */
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firebaseService = inject(FirebaseService);

  // Local storage cache keys for zero-config offline/demo resilience
  private readonly CACHE_PREFIX = 'eduportal_db_';

  private get db() {
    return this.firebaseService.db;
  }

  // Helper for persistent local fallback
  private getLocal<T>(collectionName: string): T[] {
    try {
      const data = localStorage.getItem(this.CACHE_PREFIX + collectionName);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setLocal<T>(collectionName: string, items: T[]): void {
    try {
      localStorage.setItem(this.CACHE_PREFIX + collectionName, JSON.stringify(items));
    } catch (e) {
      console.warn('Storage limit reached:', e);
    }
  }

  // ====================================================================================
  // GENERIC FIRESTORE HELPERS
  // ====================================================================================

  /**
   * Collection se saare documents fetch karta hai
   */
  async getCollectionData<T extends { id?: string; uid?: string }>(
    colName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    if (this.firebaseService.isFirebaseConfigured && this.db && this.db.type) {
      try {
        const colRef = collection(this.db, colName);
        const q = constraints.length > 0 ? query(colRef, ...constraints) : query(colRef);
        const snapshot = await getDocs(q);
        const list: T[] = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) } as T);
        });
        // Cache locally for offline speed
        this.setLocal(colName, list);
        return list;
      } catch (err) {
        console.warn(`Firestore read fallback for [${colName}]:`, err);
        return this.getLocal<T>(colName);
      }
    } else {
      return this.getLocal<T>(colName);
    }
  }

  /**
   * Single document fetch karta hai by ID
   */
  async getDocData<T>(colName: string, docId: string): Promise<T | null> {
    if (this.firebaseService.isFirebaseConfigured && this.db && this.db.type) {
      try {
        const docRef = doc(this.db, colName, docId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          return { id: snapshot.id, ...(snapshot.data() as any) } as T;
        }
      } catch (err) {
        console.warn(`Firestore getDoc fallback for [${colName}/${docId}]:`, err);
      }
    }
    const local = this.getLocal<any>(colName);
    return local.find((item: any) => item.id === docId || item.uid === docId) || null;
  }

  /**
   * Document create/update karta hai specific document ID ke saath
   */
  async setDocData<T extends { id?: string; uid?: string }>(
    colName: string,
    docId: string,
    data: T
  ): Promise<void> {
    // 1. Update local cache immediately for snappy UI
    const local = this.getLocal<any>(colName);
    const existingIndex = local.findIndex((item: any) => item.id === docId || item.uid === docId);
    if (existingIndex >= 0) {
      local[existingIndex] = { ...local[existingIndex], ...data, id: docId };
    } else {
      local.push({ ...data, id: docId });
    }
    this.setLocal(colName, local);

    // 2. Sync to live Firestore if configured
    if (this.firebaseService.isFirebaseConfigured && this.db && this.db.type) {
      try {
        const docRef = doc(this.db, colName, docId);
        await setDoc(docRef, { ...data }, { merge: true });
      } catch (err) {
        console.error(`Firestore setDoc error for [${colName}/${docId}]:`, err);
      }
    }
  }

  /**
   * Document delete karta hai
   */
  async deleteDocData(colName: string, docId: string): Promise<void> {
    const local = this.getLocal<any>(colName);
    const updated = local.filter((item: any) => item.id !== docId && item.uid !== docId);
    this.setLocal(colName, updated);

    if (this.firebaseService.isFirebaseConfigured && this.db && this.db.type) {
      try {
        const docRef = doc(this.db, colName, docId);
        await deleteDoc(docRef);
      } catch (err) {
        console.error(`Firestore deleteDoc error for [${colName}/${docId}]:`, err);
      }
    }
  }

  // ====================================================================================
  // 1. USERS & PROFILES MANAGEMENT
  // ====================================================================================
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    return this.getDocData<UserProfile>('users', uid);
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    await this.setDocData<UserProfile>('users', profile.uid, profile);
  }

  async getAllUsers(): Promise<UserProfile[]> {
    return this.getCollectionData<UserProfile>('users');
  }

  async getUsersByRole(role: string): Promise<UserProfile[]> {
    const users = await this.getAllUsers();
    return users.filter(u => u.role === role);
  }

  async updateUserStatus(uid: string, status: 'active' | 'suspended' | 'pending', approved?: boolean): Promise<void> {
    const existing = await this.getUserProfile(uid);
    if (existing) {
      existing.status = status;
      if (approved !== undefined) existing.approved = approved;
      await this.saveUserProfile(existing);
    }
  }

  async deleteUser(uid: string): Promise<void> {
    await this.deleteDocData('users', uid);
  }

  // ====================================================================================
  // 2. COURSES & SUBJECTS MANAGEMENT
  // ====================================================================================
  async getCourses(): Promise<Course[]> {
    return this.getCollectionData<Course>('courses');
  }

  async saveCourse(course: Course): Promise<void> {
    await this.setDocData<Course>('courses', course.id, course);
  }

  async deleteCourse(courseId: string): Promise<void> {
    await this.deleteDocData('courses', courseId);
  }

  async getSubjects(courseId?: string): Promise<Subject[]> {
    const subjects = await this.getCollectionData<Subject>('subjects');
    return courseId ? subjects.filter(s => s.courseId === courseId) : subjects;
  }

  async getSubjectsForFaculty(facultyId: string): Promise<Subject[]> {
    const subjects = await this.getCollectionData<Subject>('subjects');
    return subjects.filter(s => s.facultyId === facultyId);
  }

  async saveSubject(subject: Subject): Promise<void> {
    await this.setDocData<Subject>('subjects', subject.id, subject);
  }

  async deleteSubject(subjectId: string): Promise<void> {
    await this.deleteDocData('subjects', subjectId);
  }

  // ====================================================================================
  // 3. ATTENDANCE MANAGEMENT (Doc ID: `${subjectId}_${date}_${studentId}`)
  // ====================================================================================
  async getAttendance(subjectId: string, date: string): Promise<AttendanceRecord[]> {
    const all = await this.getCollectionData<AttendanceRecord>('attendance');
    return all.filter(a => a.subjectId === subjectId && a.date === date);
  }

  async getAttendanceForStudent(studentId: string, subjectId?: string): Promise<AttendanceRecord[]> {
    const all = await this.getCollectionData<AttendanceRecord>('attendance');
    return all.filter(a => a.studentId === studentId && (!subjectId || a.subjectId === subjectId));
  }

  async saveAttendanceBatch(records: AttendanceRecord[]): Promise<void> {
    for (const record of records) {
      const docId = `${record.subjectId}_${record.date}_${record.studentId}`;
      await this.setDocData<AttendanceRecord>('attendance', docId, { ...record, id: docId });
    }
  }

  async getAllAttendance(): Promise<AttendanceRecord[]> {
    return this.getCollectionData<AttendanceRecord>('attendance');
  }

  // ====================================================================================
  // 4. ASSESSMENTS & MARKS MANAGEMENT (Doc ID: `${assessmentId}_${studentId}`)
  // ====================================================================================
  async getAssessments(subjectId?: string): Promise<Assessment[]> {
    const all = await this.getCollectionData<Assessment>('assessments');
    return subjectId ? all.filter(a => a.subjectId === subjectId) : all;
  }

  async saveAssessment(assessment: Assessment): Promise<void> {
    await this.setDocData<Assessment>('assessments', assessment.id, assessment);
  }

  async deleteAssessment(assessmentId: string): Promise<void> {
    await this.deleteDocData('assessments', assessmentId);
  }

  async getMarksForAssessment(assessmentId: string): Promise<MarksRecord[]> {
    const all = await this.getCollectionData<MarksRecord>('marks');
    return all.filter(m => m.assessmentId === assessmentId);
  }

  async getMarksForStudent(studentId: string, onlyPublished: boolean = true): Promise<MarksRecord[]> {
    const all = await this.getCollectionData<MarksRecord>('marks');
    return all.filter(m => m.studentId === studentId && (!onlyPublished || m.published));
  }

  async saveMarksBatch(records: MarksRecord[]): Promise<void> {
    for (const record of records) {
      const docId = `${record.assessmentId}_${record.studentId}`;
      await this.setDocData<MarksRecord>('marks', docId, { ...record, id: docId });
    }
  }

  async getAllMarks(): Promise<MarksRecord[]> {
    return this.getCollectionData<MarksRecord>('marks');
  }

  // ====================================================================================
  // 5. EXAM TIMETABLE MANAGEMENT
  // ====================================================================================
  async getExamTimetables(courseId?: string, semester?: number): Promise<ExamTimetable[]> {
    const all = await this.getCollectionData<ExamTimetable>('exams');
    return all.filter(e => {
      const matchCourse = !courseId || e.courseId === courseId;
      const matchSem = semester === undefined || e.semester === semester;
      return matchCourse && matchSem;
    });
  }

  async saveExamTimetable(exam: ExamTimetable): Promise<void> {
    await this.setDocData<ExamTimetable>('exams', exam.id, exam);
  }

  async deleteExamTimetable(examId: string): Promise<void> {
    await this.deleteDocData('exams', examId);
  }

  // ====================================================================================
  // 6. NOTICES & ANNOUNCEMENTS
  // ====================================================================================
  async getNotices(role?: string, courseId?: string): Promise<Notice[]> {
    const all = await this.getCollectionData<Notice>('notices');
    if (!role) return all;
    return all.filter(n => {
      const roleMatch = n.targetRole === 'all' || n.targetRole === role;
      const courseMatch = !n.courseId || !courseId || n.courseId === courseId;
      return roleMatch && courseMatch;
    });
  }

  async saveNotice(notice: Notice): Promise<void> {
    await this.setDocData<Notice>('notices', notice.id, notice);
  }

  async deleteNotice(noticeId: string): Promise<void> {
    await this.deleteDocData('notices', noticeId);
  }

  // ====================================================================================
  // 7. SEMESTER RESULTS MANAGEMENT
  // ====================================================================================
  async getResultSheets(courseId?: string, semester?: number): Promise<SemesterResultSheet[]> {
    const all = await this.getCollectionData<SemesterResultSheet>('results');
    return all;
  }

  async getStudentResultSheet(studentId: string): Promise<SemesterResultSheet | null> {
    const sheets = await this.getCollectionData<SemesterResultSheet>('results');
    return sheets.find(s => s.studentId === studentId && s.published) || null;
  }

  async saveResultSheet(sheet: SemesterResultSheet): Promise<void> {
    const docId = `${sheet.studentId}_sem${sheet.semester}`;
    await this.setDocData<SemesterResultSheet>('results', docId, sheet);
  }
}
