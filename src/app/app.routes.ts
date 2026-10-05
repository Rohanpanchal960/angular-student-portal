import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StudentListComponent } from './components/student-list/student-list.component';
import { StudentDetailComponent } from './components/student-detail/student-detail.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { TasksComponent } from './components/tasks/tasks.component';
import { AdmissionComponent } from './components/admission/admission.component';
import { CounterDemoComponent } from './components/counter-demo/counter-demo.component';
import { LoginComponent } from './components/login/login.component';
import { ExperimentsLabComponent } from './components/experiments-lab/experiments-lab.component';
import { SyllabusComponent } from './components/syllabus/syllabus.component';
import { AcademicNoticesComponent } from './components/academic-notices/academic-notices.component';
import { authGuard } from './guards/auth.guard';

/**
 * ====================================================================================
 * Master Application Routing Configuration
 * ====================================================================================
 */
export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // [EXPERIMENT 18]: Home, About, Contact
  { path: 'home', component: HomeComponent, title: 'Home | Student Portal' },
  { path: 'about', component: AboutComponent, title: 'About Syllabus | Student Portal' },
  { path: 'contact', component: ContactComponent, title: 'Contact Support | Student Portal' },

  // [EXPERIMENT 6]: Dashboard summary component
  { path: 'dashboard', component: DashboardComponent, title: 'Analytics Dashboard | Student Portal' },

  // [EXPERIMENT 8, 14, 15, 30]: Student Directory with full CRUD, Marks Editor, *ngIf/*ngFor & [ngClass]
  { path: 'students', component: StudentListComponent, title: 'Student Management & Marks | Student Portal' },

  // [EXPERIMENT 19]: Route parameters dynamic view /student/:id
  { path: 'student/:id', component: StudentDetailComponent, title: 'Student Profile Details | Student Portal' },

  // [EXPERIMENT 2, 10, 25]: Profile with interpolation, two-way binding & file upload
  { path: 'profile', component: UserProfileComponent, title: 'My Profile & Upload | Student Portal' },

  // Fully Working Demo Login Portal
  { path: 'login', component: LoginComponent, title: 'Demo Login Portal | Student Portal' },

  // Redirect legacy Store and Admin routes
  { path: 'store', redirectTo: 'students', pathMatch: 'full' },
  { path: 'admin', redirectTo: 'login', pathMatch: 'full' },
  { path: 'admin-login', redirectTo: 'login', pathMatch: 'full' },

  // [EXPERIMENT 13]: Tasks with custom overdue directive
  { path: 'tasks', component: TasksComponent, title: 'Assignments & Overdue Tasks | Student Portal' },

  // [EXPERIMENT 21, 24]: Admissions template form & dynamic FormArray
  { path: 'admission', component: AdmissionComponent, title: 'Admissions & Dynamic Subjects | Student Portal' },

  // [EXPERIMENT 26]: Shared service counter state between two components
  { path: 'counter', component: CounterDemoComponent, title: 'Shared State Counter | Student Portal' },

  // Academic Reports Module
  { 
    path: 'reports', 
    loadChildren: () => import('./reports/reports.routes').then(m => m.REPORTS_ROUTES),
    title: 'Academic Reports & Performance Analytics | Student Portal'
  },

  // Redirect removed Practicals and Notices routes to dashboard
  { path: 'experiments', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'notices', redirectTo: 'dashboard', pathMatch: 'full' },

  // Course Syllabus Hub
  { path: 'syllabus', component: SyllabusComponent, title: 'Course Syllabus & Curriculum Hub | Student Portal' },

  // Fallback wildcard route
  { path: '**', redirectTo: 'dashboard' }
];
