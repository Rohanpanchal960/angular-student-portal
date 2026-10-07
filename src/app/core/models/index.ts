/**
 * ====================================================================================
 * EDUPORTAL - MASTER DATA MODELS & INTERFACES
 * ====================================================================================
 * Yeh file pure system ke data contracts aur Firestore schema types define karti hai.
 * Har collection ka shape aur field types strict TypeScript me defined hain.
 */

// ------------------------------------------------------------------------------------
// 1. User & Authentication Models
// ------------------------------------------------------------------------------------
export type UserRole = 'admin' | 'faculty' | 'student';

export type UserStatus = 'active' | 'suspended' | 'pending';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  approved: boolean; // Students = true by default; Faculty = false until admin approves
  status: UserStatus;
  phoneNumber?: string;
  photoURL?: string;
  department?: string; // For faculty
  designation?: string; // For faculty (e.g., Professor, Assistant Prof)
  rollNo?: string; // For student (e.g., 2026-CS-042)
  courseId?: string; // For student
  courseName?: string;
  semester?: number; // For student (1 to 8)
  createdAt: string;
  updatedAt?: string;
}

// ------------------------------------------------------------------------------------
// 2. Course & Academic Hierarchy Models
// ------------------------------------------------------------------------------------
export interface Course {
  id: string;
  code: string; // e.g. "BTECH-CSE", "BCA", "MCA"
  name: string; // e.g. "Bachelor of Technology in Computer Science"
  description?: string;
  durationYears: number; // e.g. 4
  totalSemesters: number; // e.g. 8
  createdAt: string;
}

export interface Subject {
  id: string;
  courseId: string;
  courseName?: string;
  code: string; // e.g. "CS301"
  name: string; // e.g. "Database Management Systems"
  semester: number; // 1 to 8
  credits: number; // e.g. 4
  facultyId?: string; // Assigned faculty UID
  facultyName?: string;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  courseId: string;
  courseName: string;
  semester: number;
  subjectIds: string[];
  academicYear: string; // e.g. "2025-2026"
  createdAt: string;
}

// ------------------------------------------------------------------------------------
// 3. Attendance Model (Doc ID: `${subjectId}_${date}_${studentId}`)
// ------------------------------------------------------------------------------------
export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
  id: string; // `${subjectId}_${date}_${studentId}`
  subjectId: string;
  subjectName?: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  date: string; // "YYYY-MM-DD"
  status: AttendanceStatus;
  facultyId: string;
  markedAt: string;
  remarks?: string;
}

export interface AttendanceSummary {
  studentId: string;
  studentName: string;
  rollNo: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  percentage: number;
  isDefaulter: boolean; // percentage < 75%
}

// ------------------------------------------------------------------------------------
// 4. Assessment & Marks Models (Doc ID: `${assessmentId}_${studentId}`)
// ------------------------------------------------------------------------------------
export type AssessmentType = 'Test' | 'Assignment' | 'Exam' | 'Quiz';

export interface Assessment {
  id: string;
  title: string;
  type: AssessmentType;
  subjectId: string;
  subjectName: string;
  courseId?: string;
  semester?: number;
  maxMarks: number;
  passingMarks: number;
  weightage?: number; // e.g. 20%
  date: string; // "YYYY-MM-DD"
  facultyId: string;
  facultyName?: string;
  published: boolean;
  createdAt: string;
}

export interface MarksRecord {
  id: string; // `${assessmentId}_${studentId}`
  assessmentId: string;
  assessmentTitle: string;
  assessmentType: AssessmentType;
  subjectId: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: string; // "A+" | "A" | "B" | "C" | "D" | "F"
  isDraft: boolean;
  published: boolean;
  remarks?: string;
  updatedAt: string;
}

// ------------------------------------------------------------------------------------
// 5. Exam Timetable & Admit Card Models
// ------------------------------------------------------------------------------------
export interface ExamTimetable {
  id: string;
  courseId: string;
  courseName: string;
  semester: number;
  examName: string; // e.g. "End Semester Examinations Winter 2026"
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "01:00 PM"
  roomNo: string;
  maxMarks?: number;
  createdAt: string;
}

// ------------------------------------------------------------------------------------
// 6. Notices & Announcements
// ------------------------------------------------------------------------------------
export type NoticePriority = 'normal' | 'important' | 'urgent';
export type NoticeTarget = 'all' | 'student' | 'faculty';

export interface Notice {
  id: string;
  title: string;
  content: string;
  targetRole: NoticeTarget;
  courseId?: string; // Optional course filter
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  priority: NoticePriority;
  createdAt: string;
}

// ------------------------------------------------------------------------------------
// 7. Results & Grade Sheet Models
// ------------------------------------------------------------------------------------
export interface StudentSubjectResult {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  gradePoint: number;
  status: 'Pass' | 'Fail';
}

export interface SemesterResultSheet {
  id?: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  courseName: string;
  semester: number;
  academicYear: string;
  subjects: StudentSubjectResult[];
  totalMarksObtained: number;
  totalMaxMarks: number;
  totalCredits: number;
  sgpa: number;
  overallPercentage: number;
  status: 'PASS' | 'FAIL';
  published: boolean;
  publishedAt?: string;
}
