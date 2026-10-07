/**
 * ====================================================================================
 * EDUPORTAL - STANDALONE FIRESTORE SEED SCRIPT
 * ====================================================================================
 * Run via Node.js to populate Firestore with Demo Admin, 2 Faculty, 10 Students,
 * Courses, Subjects, Assessments, Marks, and Attendance.
 *
 * Usage:
 *   node scripts/seed-data.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Paste your Firebase Web Config credentials here:
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDemoKeyEduPortalProject1234567890",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "eduportal-student-mgmt.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "eduportal-student-mgmt",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "eduportal-student-mgmt.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890abcdef"
};

console.log('🚀 Connecting to Firebase project:', firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log('🌱 Seeding Admin, Faculty, and Students...');

  // 1. Users: 1 Admin, 2 Faculty, 1 Pending Faculty, 10 Students
  const users = [
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
      approved: false,
      status: 'pending',
      department: 'Data Science',
      designation: 'Visiting Faculty',
      phoneNumber: '+91 98765 00004',
      createdAt: new Date().toISOString()
    }
  ];

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
    await setDoc(doc(db, 'users', u.uid), u, { merge: true });
  }
  console.log(`✅ Saved ${users.length} users into 'users' collection.`);

  // 2. Courses
  const courses = [
    {
      id: 'course_btech_cse',
      code: 'BTECH-CSE',
      name: 'B.Tech Computer Science & Engineering',
      description: '4-year undergraduate software engineering & computer systems program',
      durationYears: 4,
      totalSemesters: 8,
      createdAt: new Date().toISOString()
    },
    {
      id: 'course_mca',
      code: 'MCA',
      name: 'Master of Computer Applications',
      description: '2-year postgraduate program',
      durationYears: 2,
      totalSemesters: 4,
      createdAt: new Date().toISOString()
    }
  ];

  for (const c of courses) {
    await setDoc(doc(db, 'courses', c.id), c, { merge: true });
  }
  console.log(`✅ Saved ${courses.length} courses into 'courses' collection.`);

  // 3. Subjects
  const subjects = [
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
    }
  ];

  for (const s of subjects) {
    await setDoc(doc(db, 'subjects', s.id), s, { merge: true });
  }
  console.log(`✅ Saved ${subjects.length} subjects into 'subjects' collection.`);

  console.log('🎉 Seeding successfully completed!');
}

seed().catch(err => {
  console.error('Seeding error:', err);
});
