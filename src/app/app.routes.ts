import { Routes } from '@angular/router';
import { adminGuard, facultyGuard, studentGuard, authGuard, publicOnlyGuard } from './core/guards/role.guard';

/**
 * ====================================================================================
 * MASTER APPLICATION ROUTES CONFIGURATION
 * ====================================================================================
 * Configures role-based access control, route guards, and code-split lazy loading
 * across Admin, Faculty, Student, and Public Auth surfaces.
 */
export const routes: Routes = [
  // Default Redirect
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },

  // ----------------------------------------------------------------------------------
  // 1. PUBLIC AUTHENTICATION ROUTES
  // ----------------------------------------------------------------------------------
  {
    path: 'login',
    title: 'Sign In | EduPortal Academic Cloud',
    canActivate: [publicOnlyGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    title: 'Register Account | EduPortal',
    canActivate: [publicOnlyGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    title: 'Reset Password | EduPortal',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'awaiting-approval',
    title: 'Faculty Approval Pending | EduPortal',
    loadComponent: () => import('./features/auth/awaiting-approval/awaiting-approval.component').then(m => m.AwaitingApprovalComponent)
  },
  {
    path: 'profile',
    title: 'My Profile & Security | EduPortal',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/profile/profile.component').then(m => m.ProfileComponent)
  },

  // ----------------------------------------------------------------------------------
  // 2. ADMINISTRATOR PANEL (Protected by adminGuard)
  // ----------------------------------------------------------------------------------
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'Admin Cockpit | EduPortal',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        title: 'User Management | EduPortal',
        loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'students',
        title: 'Student Directory & CSV Import | EduPortal',
        loadComponent: () => import('./features/admin/students/admin-students.component').then(m => m.AdminStudentsComponent)
      },
      {
        path: 'courses',
        title: 'Curriculum & Subjects Allocation | EduPortal',
        loadComponent: () => import('./features/admin/courses/admin-courses.component').then(m => m.AdminCoursesComponent)
      },
      {
        path: 'exams',
        title: 'Exam Timetables & Schedules | EduPortal',
        loadComponent: () => import('./features/admin/exams/admin-exams.component').then(m => m.AdminExamsComponent)
      },
      {
        path: 'results',
        title: 'Publish Results & SGPA | EduPortal',
        loadComponent: () => import('./features/admin/results/admin-results.component').then(m => m.AdminResultsComponent)
      },
      {
        path: 'notices',
        title: 'Announcements Board | EduPortal',
        loadComponent: () => import('./features/admin/notices/admin-notices.component').then(m => m.AdminNoticesComponent)
      },
      {
        path: 'reports',
        title: 'Defaulters & Performance Reports | EduPortal',
        loadComponent: () => import('./features/admin/reports/admin-reports.component').then(m => m.AdminReportsComponent)
      }
    ]
  },

  // ----------------------------------------------------------------------------------
  // 3. FACULTY SUITE (Protected by facultyGuard)
  // ----------------------------------------------------------------------------------
  {
    path: 'faculty',
    canActivate: [facultyGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'Faculty Workspace | EduPortal',
        loadComponent: () => import('./features/faculty/dashboard/faculty-dashboard.component').then(m => m.FacultyDashboardComponent)
      },
      {
        path: 'attendance',
        title: 'Mark Class Attendance | EduPortal',
        loadComponent: () => import('./features/faculty/attendance/faculty-attendance.component').then(m => m.FacultyAttendanceComponent)
      },
      {
        path: 'assessments',
        title: 'Assessments & Marks Entry | EduPortal',
        loadComponent: () => import('./features/faculty/assessments/faculty-assessments.component').then(m => m.FacultyAssessmentsComponent)
      },
      {
        path: 'students',
        title: 'Enrolled Class Roster | EduPortal',
        loadComponent: () => import('./features/faculty/students/faculty-students.component').then(m => m.FacultyStudentsComponent)
      },
      {
        path: 'notices',
        title: 'Post Student Notices | EduPortal',
        loadComponent: () => import('./features/faculty/notices/faculty-notices.component').then(m => m.FacultyNoticesComponent)
      }
    ]
  },

  // ----------------------------------------------------------------------------------
  // 4. STUDENT DESK (Protected by studentGuard)
  // ----------------------------------------------------------------------------------
  {
    path: 'student',
    canActivate: [studentGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'Student Dashboard | EduPortal',
        loadComponent: () => import('./features/student/dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent)
      },
      {
        path: 'attendance',
        title: 'My Attendance & Rings | EduPortal',
        loadComponent: () => import('./features/student/attendance/student-attendance.component').then(m => m.StudentAttendanceComponent)
      },
      {
        path: 'results',
        title: 'Marksheet & SGPA | EduPortal',
        loadComponent: () => import('./features/student/results/student-results.component').then(m => m.StudentResultsComponent)
      },
      {
        path: 'exams',
        title: 'Exam Timetable & Admit Card | EduPortal',
        loadComponent: () => import('./features/student/exams/student-exams.component').then(m => m.StudentExamsComponent)
      },
      {
        path: 'notices',
        title: 'Notice Board | EduPortal',
        loadComponent: () => import('./features/student/notices/student-notices.component').then(m => m.StudentNoticesComponent)
      }
    ]
  },

  // Fallback Wildcard
  {
    path: '**',
    redirectTo: 'login'
  }
];
