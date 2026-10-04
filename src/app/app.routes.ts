import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StudentListComponent } from './components/student-list/student-list.component';
import { StudentDetailComponent } from './components/student-detail/student-detail.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { StoreComponent } from './components/store/store.component';
import { TasksComponent } from './components/tasks/tasks.component';
import { AdmissionComponent } from './components/admission/admission.component';
import { CounterDemoComponent } from './components/counter-demo/counter-demo.component';
import { AdminComponent } from './components/admin/admin.component';
import { ExperimentsLabComponent } from './components/experiments-lab/experiments-lab.component';
import { authGuard } from './guards/auth.guard';

/**
 * ====================================================================================
 * Master Application Routing Configuration
 * ====================================================================================
 * 
 * [ROUTING COVERAGE ACROSS SYLLABUS]:
 * - [EXPERIMENT 18]: Routing between Home, About, and Contact components
 * - [EXPERIMENT 19]: Dynamic route parameter `/student/:id` for student-specific data
 * - [EXPERIMENT 20]: Route guard `authGuard` protecting `/admin` page
 * - [EXPERIMENT 29]: Lazy loading feature module for `/reports`
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

  // [EXPERIMENT 8, 14, 15, 30]: Student Directory with full CRUD, *ngIf/*ngFor & [ngClass]
  { path: 'students', component: StudentListComponent, title: 'Student Management CRUD | Student Portal' },

  // [EXPERIMENT 19]: Route parameters dynamic view /student/:id
  { path: 'student/:id', component: StudentDetailComponent, title: 'Student Profile Details | Student Portal' },

  // [EXPERIMENT 2, 10, 25]: Profile with interpolation, two-way binding & file upload
  { path: 'profile', component: UserProfileComponent, title: 'My Profile & Upload | Student Portal' },

  // [EXPERIMENT 4, 5, 9, 11]: Campus Store with interfaces, enums, pipes & click events
  { path: 'store', component: StoreComponent, title: 'Campus Store | Student Portal' },

  // [EXPERIMENT 13]: Tasks with custom overdue directive
  { path: 'tasks', component: TasksComponent, title: 'Assignments & Overdue Tasks | Student Portal' },

  // [EXPERIMENT 21, 24]: Admissions template form & dynamic FormArray
  { path: 'admission', component: AdmissionComponent, title: 'Admissions & Dynamic Subjects | Student Portal' },

  // [EXPERIMENT 26]: Shared service counter state between two components
  { path: 'counter', component: CounterDemoComponent, title: 'Shared State Counter | Student Portal' },

  // [EXPERIMENT 20]: Route Guard protected admin portal
  { 
    path: 'admin', 
    component: AdminComponent, 
    canActivate: [authGuard], 
    title: 'Guarded Admin Portal | Student Portal' 
  },
  // Public Login view for admin authentication (Exp 22 & 23)
  { path: 'admin-login', component: AdminComponent, title: 'Admin Login | Student Portal' },

  // [EXPERIMENT 29]: Lazy Loading Reports Module
  { 
    path: 'reports', 
    loadChildren: () => import('./reports/reports.routes').then(m => m.REPORTS_ROUTES),
    title: 'Lazy Loaded Reports | Student Portal'
  },

  // Master All 30 Experiments Explorer
  { path: 'experiments', component: ExperimentsLabComponent, title: 'All 30 Syllabus Experiments Lab | Student Portal' },

  // Fallback wildcard route
  { path: '**', redirectTo: 'dashboard' }
];
