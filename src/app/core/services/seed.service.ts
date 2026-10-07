import { Injectable, inject } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { ToastService } from './toast.service';
import {
  UserProfile,
  Course,
  Subject,
  AttendanceRecord,
  Assessment,
  MarksRecord,
  ExamTimetable,
  Notice,
  SemesterResultSheet
} from '../models';

/**
 * ====================================================================================
 * SEED DATA SERVICE
 * ====================================================================================
 * Populates Firestore / LocalStorage with full production demo dataset:
 * - 1 Demo Admin
 * - 2 Approved Faculty + 1 Pending Faculty (for approval demonstration)
 * - 10 Enrolled Students (with Roll Nos, Marks, Attendance)
 * - 2 Courses and 4 Subjects
 * - Assessments & Marks Grid
 * - Attendance Records (including defaulters <75% for testing reports)
 * - Exam Timetable & Target Notices
 */
@Injectable({
  providedIn: 'root'
})
export class SeedService {
  private firestoreService = inject(FirestoreService);
  private toast = inject(ToastService);

  async seedAllData(): Promise<void> {
    console.log('🌱 [SeedService] Starting database seeding process...');

    // 1. Users: Admin, Faculty, Students
    const users: UserProfile[] = [
      {
        uid: 'usr_admin_01',
        email: 'admin@eduportal.com',
        displayName: 'System Administrator',
        role: 'admin',
        approved: true,
        status: 'active',
        phoneNumber: '+91 98765 00001',
        createdAt: new Date().toISOString()
      },
      {
        uid: 'usr_faculty_01',
        email: 'arvind.sharma@eduportal.com',
        displayName: 'Dr. Arvind Sharma',
        role: 'faculty',
        approved: true,
        status: 'active',
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        phoneNumber: '+91 98765 00002',
        createdAt: new Date().toISOString()
      },
      {
        uid: 'usr_faculty_02',
        email: 'meera.patel@eduportal.com',
        displayName: 'Prof. Meera Patel',
        role: 'faculty',
        approved: true,
        status: 'active',
        department: 'Information Technology',
        designation: 'Assistant Professor',
        phoneNumber: '+91 98765 00003',
        createdAt: new Date().toISOString()
      },
      {
        uid: 'usr_faculty_pending',
        email: 'rajesh.verma@eduportal.com',
        displayName: 'Dr. Rajesh Verma',
        role: 'faculty',
        approved: false, // Pending admin approval test case
        status: 'pending',
        department: 'Data Science',
        designation: 'Visiting Faculty',
        phoneNumber: '+91 98765 00004',
        createdAt: new Date().toISOString()
      }
    ];

    // 10 Demo Students
    const studentNames = [
      { name: 'Rahul Sharma', email: 'rahul.sharma@eduportal.com', roll: '2026-CS-001' },
      { name: 'Priya Singh', email: 'priya.singh@eduportal.com', roll: '2026-CS-002' },
      { name: 'Amit Kumar', email: 'amit.kumar@eduportal.com', roll: '2026-CS-003' },
      { name: 'Sneha Patel', email: 'sneha.patel@eduportal.com', roll: '2026-CS-004' },
      { name: 'Vikram Verma', email: 'vikram.verma@eduportal.com', roll: '2026-CS-005' },
      { name: 'Ananya Roy', email: 'ananya.roy@eduportal.com', roll: '2026-CS-006' },
      { name: 'Rohit Gupta', email: 'rohit.gupta@eduportal.com', roll: '2026-CS-007' },
      { name: 'Neha Joshi', email: 'neha.joshi@eduportal.com', roll: '2026-CS-008' },
      { name: 'Kunal Mehta', email: 'kunal.mehta@eduportal.com', roll: '2026-CS-009' },
      { name: 'Pooja Das', email: 'pooja.das@eduportal.com', roll: '2026-CS-010' }
    ];

    studentNames.forEach((s, idx) => {
      users.push({
        uid: `usr_student_0${idx + 1}`,
        email: s.email,
        displayName: s.name,
        role: 'student',
        approved: true,
        status: 'active',
        rollNo: s.roll,
        courseId: 'course_btech_cse',
        courseName: 'B.Tech Computer Science & Engineering',
        semester: 5,
        phoneNumber: `+91 98765 0001${idx}`,
        createdAt: new Date().toISOString()
      });
    });

    for (const u of users) {
      await this.firestoreService.saveUserProfile(u);
    }

    // 2. Courses
    const courses: Course[] = [
      {
        id: 'course_btech_cse',
        code: 'BTECH-CSE',
        name: 'B.Tech Computer Science & Engineering',
        description: 'Comprehensive 4-year undergraduate curriculum covering software engineering, systems, and algorithms.',
        durationYears: 4,
        totalSemesters: 8,
        createdAt: new Date().toISOString()
      },
      {
        id: 'course_mca',
        code: 'MCA',
        name: 'Master of Computer Applications',
        description: '2-year advanced postgraduate computing and software architecture program.',
        durationYears: 2,
        totalSemesters: 4,
        createdAt: new Date().toISOString()
      }
    ];

    for (const c of courses) {
      await this.firestoreService.saveCourse(c);
    }

    // 3. Subjects
    const subjects: Subject[] = [
      {
        id: 'subj_dbms',
        courseId: 'course_btech_cse',
        courseName: 'B.Tech Computer Science & Engineering',
        code: 'CS501',
        name: 'Database Management Systems',
        semester: 5,
        credits: 4,
        facultyId: 'usr_faculty_01',
        facultyName: 'Dr. Arvind Sharma',
        createdAt: new Date().toISOString()
      },
      {
        id: 'subj_web',
        courseId: 'course_btech_cse',
        courseName: 'B.Tech Computer Science & Engineering',
        code: 'CS502',
        name: 'Web Technologies & Modern Frameworks',
        semester: 5,
        credits: 4,
        facultyId: 'usr_faculty_02',
        facultyName: 'Prof. Meera Patel',
        createdAt: new Date().toISOString()
      },
      {
        id: 'subj_os',
        courseId: 'course_btech_cse',
        courseName: 'B.Tech Computer Science & Engineering',
        code: 'CS503',
        name: 'Operating Systems & Concurrency',
        semester: 5,
        credits: 3,
        facultyId: 'usr_faculty_01',
        facultyName: 'Dr. Arvind Sharma',
        createdAt: new Date().toISOString()
      },
      {
        id: 'subj_se',
        courseId: 'course_btech_cse',
        courseName: 'B.Tech Computer Science & Engineering',
        code: 'CS504',
        name: 'Software Engineering & Agile Methodologies',
        semester: 5,
        credits: 3,
        facultyId: 'usr_faculty_02',
        facultyName: 'Prof. Meera Patel',
        createdAt: new Date().toISOString()
      }
    ];

    for (const s of subjects) {
      await this.firestoreService.saveSubject(s);
    }

    // 4. Assessments
    const assessments: Assessment[] = [
      {
        id: 'asmt_dbms_mid',
        title: 'DBMS Mid-Term Examination',
        type: 'Test',
        subjectId: 'subj_dbms',
        subjectName: 'Database Management Systems',
        courseId: 'course_btech_cse',
        semester: 5,
        maxMarks: 50,
        passingMarks: 20,
        weightage: 25,
        date: '2026-09-15',
        facultyId: 'usr_faculty_01',
        facultyName: 'Dr. Arvind Sharma',
        published: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'asmt_web_proj',
        title: 'Angular Project Assessment 1',
        type: 'Assignment',
        subjectId: 'subj_web',
        subjectName: 'Web Technologies & Modern Frameworks',
        courseId: 'course_btech_cse',
        semester: 5,
        maxMarks: 30,
        passingMarks: 12,
        weightage: 15,
        date: '2026-09-28',
        facultyId: 'usr_faculty_02',
        facultyName: 'Prof. Meera Patel',
        published: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'asmt_os_test',
        title: 'OS Process Scheduling Quiz',
        type: 'Quiz',
        subjectId: 'subj_os',
        subjectName: 'Operating Systems & Concurrency',
        courseId: 'course_btech_cse',
        semester: 5,
        maxMarks: 20,
        passingMarks: 8,
        weightage: 10,
        date: '2026-10-02',
        facultyId: 'usr_faculty_01',
        facultyName: 'Dr. Arvind Sharma',
        published: true,
        createdAt: new Date().toISOString()
      }
    ];

    for (const a of assessments) {
      await this.firestoreService.saveAssessment(a);
    }

    // 5. Marks Records for Students
    const marksList: MarksRecord[] = [];
    const sampleScores = [46, 42, 38, 48, 25, 44, 32, 18, 40, 35]; // Student 8 scored 18 (<20 fail test)

    studentNames.forEach((s, idx) => {
      const studentId = `usr_student_0${idx + 1}`;
      const scoreDbms = sampleScores[idx];
      const pDbms = (scoreDbms / 50) * 100;

      marksList.push({
        id: `asmt_dbms_mid_${studentId}`,
        assessmentId: 'asmt_dbms_mid',
        assessmentTitle: 'DBMS Mid-Term Examination',
        assessmentType: 'Test',
        subjectId: 'subj_dbms',
        subjectName: 'Database Management Systems',
        studentId,
        studentName: s.name,
        rollNo: s.roll,
        marksObtained: scoreDbms,
        maxMarks: 50,
        percentage: Math.round(pDbms),
        grade: pDbms >= 90 ? 'A+' : pDbms >= 80 ? 'A' : pDbms >= 60 ? 'B' : pDbms >= 40 ? 'C' : 'F',
        isDraft: false,
        published: true,
        remarks: pDbms >= 40 ? 'Satisfactory performance' : 'Remedial coaching recommended',
        updatedAt: new Date().toISOString()
      });

      const scoreWeb = Math.min(30, Math.round(scoreDbms * 0.6));
      const pWeb = (scoreWeb / 30) * 100;
      marksList.push({
        id: `asmt_web_proj_${studentId}`,
        assessmentId: 'asmt_web_proj',
        assessmentTitle: 'Angular Project Assessment 1',
        assessmentType: 'Assignment',
        subjectId: 'subj_web',
        subjectName: 'Web Technologies & Modern Frameworks',
        studentId,
        studentName: s.name,
        rollNo: s.roll,
        marksObtained: scoreWeb,
        maxMarks: 30,
        percentage: Math.round(pWeb),
        grade: pWeb >= 90 ? 'A+' : pWeb >= 80 ? 'A' : pWeb >= 60 ? 'B' : pWeb >= 40 ? 'C' : 'F',
        isDraft: false,
        published: true,
        remarks: 'Component architecture verified',
        updatedAt: new Date().toISOString()
      });
    });

    await this.firestoreService.saveMarksBatch(marksList);

    // 6. Attendance Records (Include defaulter cases: student 5 and student 7 have <75% attendance)
    const dates = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06'];
    const attendanceRecords: AttendanceRecord[] = [];

    dates.forEach(date => {
      studentNames.forEach((s, idx) => {
        const studentId = `usr_student_0${idx + 1}`;
        // Simulate attendance: Student 5 (idx 4) is mostly absent to trigger defaulter warning
        let status: 'present' | 'absent' | 'late' = 'present';
        if (idx === 4 && (date === '2026-10-02' || date === '2026-10-03' || date === '2026-10-05')) {
          status = 'absent';
        } else if (idx === 6 && (date === '2026-10-01' || date === '2026-10-04')) {
          status = 'absent';
        } else if (idx % 3 === 0 && date === '2026-10-04') {
          status = 'late';
        }

        attendanceRecords.push({
          id: `subj_dbms_${date}_${studentId}`,
          subjectId: 'subj_dbms',
          subjectName: 'Database Management Systems',
          studentId,
          studentName: s.name,
          rollNo: s.roll,
          date,
          status,
          facultyId: 'usr_faculty_01',
          markedAt: new Date().toISOString()
        });

        // Also add for Web Tech
        attendanceRecords.push({
          id: `subj_web_${date}_${studentId}`,
          subjectId: 'subj_web',
          subjectName: 'Web Technologies & Modern Frameworks',
          studentId,
          studentName: s.name,
          rollNo: s.roll,
          date,
          status: status === 'absent' ? 'present' : status,
          facultyId: 'usr_faculty_02',
          markedAt: new Date().toISOString()
        });
      });
    });

    await this.firestoreService.saveAttendanceBatch(attendanceRecords);

    // 7. Exam Timetable
    const exams: ExamTimetable[] = [
      {
        id: 'exam_cs501',
        courseId: 'course_btech_cse',
        courseName: 'B.Tech Computer Science & Engineering',
        semester: 5,
        examName: 'End Semester Theory Examination Autumn 2026',
        subjectId: 'subj_dbms',
        subjectName: 'Database Management Systems',
        subjectCode: 'CS501',
        date: '2026-11-10',
        startTime: '10:00 AM',
        endTime: '01:00 PM',
        roomNo: 'Lecture Hall 101',
        maxMarks: 100,
        createdAt: new Date().toISOString()
      },
      {
        id: 'exam_cs502',
        courseId: 'course_btech_cse',
        courseName: 'B.Tech Computer Science & Engineering',
        semester: 5,
        examName: 'End Semester Theory Examination Autumn 2026',
        subjectId: 'subj_web',
        subjectName: 'Web Technologies & Modern Frameworks',
        subjectCode: 'CS502',
        date: '2026-11-12',
        startTime: '10:00 AM',
        endTime: '01:00 PM',
        roomNo: 'Lecture Hall 102',
        maxMarks: 100,
        createdAt: new Date().toISOString()
      },
      {
        id: 'exam_cs503',
        courseId: 'course_btech_cse',
        courseName: 'B.Tech Computer Science & Engineering',
        semester: 5,
        examName: 'End Semester Theory Examination Autumn 2026',
        subjectId: 'subj_os',
        subjectName: 'Operating Systems & Concurrency',
        subjectCode: 'CS503',
        date: '2026-11-16',
        startTime: '02:00 PM',
        endTime: '05:00 PM',
        roomNo: 'Seminar Hall B',
        maxMarks: 100,
        createdAt: new Date().toISOString()
      }
    ];

    for (const ex of exams) {
      await this.firestoreService.saveExamTimetable(ex);
    }

    // 8. Notices
    const notices: Notice[] = [
      {
        id: 'not_01',
        title: 'End-Semester Examination Schedule Released',
        content: 'The official timetable for Autumn 2026 End-Semester Examinations has been published. All students are advised to verify their admit cards.',
        targetRole: 'all',
        authorId: 'usr_admin_01',
        authorName: 'System Administrator',
        authorRole: 'admin',
        priority: 'urgent',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'not_02',
        title: 'Mandatory 75% Attendance Compliance Notice',
        content: 'Students having attendance below 75% in any subject will be debarred from writing practical and semester examinations.',
        targetRole: 'student',
        authorId: 'usr_admin_01',
        authorName: 'Academic Registrar',
        authorRole: 'admin',
        priority: 'important',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
      },
      {
        id: 'not_03',
        title: 'Faculty Senate Meeting: Curriculum Review',
        content: 'All faculty members are requested to attend the upcoming academic review meeting on Friday at 3:00 PM in Conference Room 1.',
        targetRole: 'faculty',
        authorId: 'usr_admin_01',
        authorName: 'Dean of Academics',
        authorRole: 'admin',
        priority: 'normal',
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
      }
    ];

    for (const n of notices) {
      await this.firestoreService.saveNotice(n);
    }

    // 9. Semester Result Sheet Sample for Student 1
    const resultSheet: SemesterResultSheet = {
      studentId: 'usr_student_01',
      studentName: 'Rahul Sharma',
      rollNo: '2026-CS-001',
      courseName: 'B.Tech Computer Science & Engineering',
      semester: 5,
      academicYear: '2025-2026',
      subjects: [
        {
          subjectId: 'subj_dbms',
          subjectCode: 'CS501',
          subjectName: 'Database Management Systems',
          credits: 4,
          marksObtained: 92,
          maxMarks: 100,
          percentage: 92,
          grade: 'A+',
          gradePoint: 10,
          status: 'Pass'
        },
        {
          subjectId: 'subj_web',
          subjectCode: 'CS502',
          subjectName: 'Web Technologies & Frameworks',
          credits: 4,
          marksObtained: 88,
          maxMarks: 100,
          percentage: 88,
          grade: 'A',
          gradePoint: 9,
          status: 'Pass'
        },
        {
          subjectId: 'subj_os',
          subjectCode: 'CS503',
          subjectName: 'Operating Systems & Concurrency',
          credits: 3,
          marksObtained: 84,
          maxMarks: 100,
          percentage: 84,
          grade: 'A',
          gradePoint: 9,
          status: 'Pass'
        },
        {
          subjectId: 'subj_se',
          subjectCode: 'CS504',
          subjectName: 'Software Engineering',
          credits: 3,
          marksObtained: 79,
          maxMarks: 100,
          percentage: 79,
          grade: 'B',
          gradePoint: 8,
          status: 'Pass'
        }
      ],
      totalMarksObtained: 343,
      totalMaxMarks: 400,
      totalCredits: 14,
      sgpa: 9.14,
      overallPercentage: 85.75,
      status: 'PASS',
      published: true,
      publishedAt: new Date().toISOString()
    };

    await this.firestoreService.saveResultSheet(resultSheet);

    console.log('✅ [SeedService] Database successfully populated with initial dataset.');
    this.toast.success('EduPortal demo database initialized with Admin, Faculty, and Students!');
  }
}
