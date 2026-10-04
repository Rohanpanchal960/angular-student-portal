export interface ExperimentItem {
  id: number;
  title: string;
  unit: string;
  objective: string;
  explanationHindi: string;
  route: string;
  badge: string;
  codeSnippet: string;
}

export const EXPERIMENTS_CATALOG: ExperimentItem[] = [
  {
    id: 1,
    title: 'Create first Angular application using Angular CLI',
    unit: 'Unit 1',
    objective: 'Use ng new student-portal to generate project and run with ng serve.',
    explanationHindi: 'Angular CLI se "ng new student-portal" command run karke pura scalable structure generate kiya gaya.',
    route: '/dashboard',
    badge: 'CLI Setup',
    codeSnippet: 'ng new student-portal --routing --style=css\nng serve'
  },
  {
    id: 2,
    title: 'Display a static user profile using interpolation',
    unit: 'Unit 2',
    objective: 'Create a user object and show name, email, photo using {{ interpolation }}. (e.g., Amit Shah, 21)',
    explanationHindi: 'Component TS file se variables ko double curly braces {{ user.name }} ke dwara view me show kiya gaya.',
    route: '/profile',
    badge: 'Interpolation',
    codeSnippet: '<h3>{{ user.name }}</h3>\n<p>{{ user.email }} | Age: {{ user.age }}</p>'
  },
  {
    id: 3,
    title: 'Create a simple TypeScript class for a student',
    unit: 'Unit 1',
    objective: 'Define a Student class with properties ID, name, course, marks. Example: Student { id: 101, name: "Neha", course: "MCA", marks: 88 }',
    explanationHindi: 'models/student.model.ts me Student class banayi gayi jisme constructor aur helper methods hain.',
    route: '/students',
    badge: 'TS Class',
    codeSnippet: 'export class Student {\n  constructor(public id: number, public name: string, public course: string, public marks: number) {}\n}'
  },
  {
    id: 4,
    title: 'Create an interface to define a product structure',
    unit: 'Unit 1',
    objective: 'Define Product interface and use it to display product list. Example: { id: 1, name: "Mouse", price: 299, category: "Electronics" }',
    explanationHindi: 'Product interface banaya jisme id, name, price, aur category strictly type-checked hain.',
    route: '/store',
    badge: 'TS Interface',
    codeSnippet: 'export interface Product {\n  id: number; name: string; price: number; category: string;\n}'
  },
  {
    id: 5,
    title: 'Use enums and arrays in TypeScript to display course categories',
    unit: 'Unit 1',
    objective: 'Create enum Course { BCA, MCA, iMCA, BCA_Hons } and array to populate a dropdown menu.',
    explanationHindi: 'Course enum banaya aur COURSE_LIST array se <select> dropdown ko dynamic options diye.',
    route: '/store',
    badge: 'TS Enum',
    codeSnippet: 'export enum Course { BCA = "BCA", MCA = "MCA", iMCA = "iMCA", BCA_Hons = "BCA_Hons" }'
  },
  {
    id: 6,
    title: 'Use Angular CLI to generate a new component',
    unit: 'Unit 2',
    objective: 'Run ng generate component dashboard to display summary: "Total Students" and "Total Courses".',
    explanationHindi: 'DashboardComponent banakar KPI summary cards me total counts aur average marks calculate kiye.',
    route: '/dashboard',
    badge: 'Component',
    codeSnippet: 'ng generate component dashboard\n<div class="kpi-card">Total Students: {{ totalStudents }}</div>'
  },
  {
    id: 7,
    title: 'Create a reusable student card component',
    unit: 'Unit 2',
    objective: 'Design component showing photo, name, course, marks. Reuse passing data with @Input().',
    explanationHindi: 'StudentCardComponent banaya jisme @Input() student: Student use karke reuse kiya ja sakta hai.',
    route: '/students',
    badge: '@Input()',
    codeSnippet: '@Input() student!: Student;\n<app-student-card [student]="s"></app-student-card>'
  },
  {
    id: 8,
    title: 'Use ngIf and ngFor to display and hide a student list',
    unit: 'Unit 2',
    objective: 'Show list of students using *ngFor and hide it with *ngIf based on showList checkbox.',
    explanationHindi: 'Checkbox toggle se showList boolean change hota hai jisse *ngIf list ko show/hide karta hai.',
    route: '/students',
    badge: 'Directives',
    codeSnippet: '<input type="checkbox" [(ngModel)]="showList">\n<div *ngIf="showList"><div *ngFor="let s of students">{{s.name}}</div></div>'
  },
  {
    id: 9,
    title: 'Build a product list using event binding and button clicks',
    unit: 'Unit 2',
    objective: 'Display products with "Buy Now" button; on click show message or log product name.',
    explanationHindi: '(click)="onBuyProduct(product)" ke zariye user interaction handle karke toast notification display ki.',
    route: '/store',
    badge: 'Event Binding',
    codeSnippet: '<button (click)="onBuyProduct(product)">Buy Now</button>'
  },
  {
    id: 10,
    title: 'Implement two-way binding to update user profile data',
    unit: 'Unit 2',
    objective: 'Use [(ngModel)] to bind input fields for name, address, and phone to a user object.',
    explanationHindi: 'Two-way binding [()] se input field me type karte hi UI aur model simultaneously live update hote hain.',
    route: '/profile',
    badge: '[(ngModel)]',
    codeSnippet: '<input [(ngModel)]="user.name" />\n<p>Live Name: {{ user.name }}</p>'
  },
  {
    id: 11,
    title: 'Use built-in pipes to format product prices and dates',
    unit: 'Unit 2',
    objective: 'Show formatted prices using currency pipe and joining dates using date pipe (e.g. ₹ 1200, 01/05/2025).',
    explanationHindi: 'Angular built-in pipes: {{ product.price | currency:"INR":"symbol" }} aur {{ date | date:"dd/MM/yyyy" }} use hue.',
    route: '/store',
    badge: 'Built-in Pipes',
    codeSnippet: '{{ product.price | currency:"INR":"symbol":"1.0-0" }}\n{{ product.releaseDate | date:"dd/MM/yyyy" }}'
  },
  {
    id: 12,
    title: 'Create a custom pipe to abbreviate full names',
    unit: 'Unit 2',
    objective: 'Input: "Sonal K Patel" -> Output: "S.K.P." Create and apply custom pipe.',
    explanationHindi: 'AbbreviatePipe banayi jo kisi bhi name ke har word ka first letter uppercase karke dots ke saath return karti hai.',
    route: '/students',
    badge: 'Custom Pipe',
    codeSnippet: '@Pipe({ name: "abbreviate", standalone: true })\nexport class AbbreviatePipe implements PipeTransform { ... }'
  },
  {
    id: 13,
    title: 'Create a custom directive to highlight overdue tasks',
    unit: 'Unit 2',
    objective: 'Highlight tasks in red color if due date is before the current date.',
    explanationHindi: 'HighlightOverdueDirective banayi jo task ki dueDate ko current date se compare karke red border & background lagati hai.',
    route: '/tasks',
    badge: 'Custom Directive',
    codeSnippet: '@Directive({ selector: "[appHighlightOverdue]", standalone: true })\n// ElementRef & Renderer2 styling red if date < today'
  },
  {
    id: 14,
    title: 'Use ngClass for conditional styling of student marks',
    unit: 'Unit 2',
    objective: 'Display green text/badge if marks >= 40, red if below 40 using [ngClass].',
    explanationHindi: '[ngClass]="{ \'badge-pass\': marks >= 40, \'badge-fail\': marks < 40 }" se dynamic styling apply hoti hai.',
    route: '/students',
    badge: '[ngClass]',
    codeSnippet: '<span [ngClass]="student.marks >= 40 ? \'marks-pass\' : \'marks-fail\'">{{ student.marks }}%</span>'
  },
  {
    id: 15,
    title: 'Create a student service to share data between components',
    unit: 'Unit 3',
    objective: 'Make a service providing student data to multiple components using getAllStudents().',
    explanationHindi: 'StudentService me @Injectable({ providedIn: "root" }) use karke central state manage ki gayi hai.',
    route: '/students',
    badge: 'DI Service',
    codeSnippet: '@Injectable({ providedIn: "root" })\nexport class StudentService { getAllStudents() { ... } }'
  },
  {
    id: 16,
    title: 'Use HttpClient to fetch data from a public API',
    unit: 'Unit 3',
    objective: 'Fetch and display post titles from https://jsonplaceholder.typicode.com/posts.',
    explanationHindi: 'HttpClient.get() ke through REST API call karke academic notices fetch karke template me display kiye.',
    route: '/experiments',
    badge: 'HttpClient',
    codeSnippet: 'this.http.get<Post[]>("https://jsonplaceholder.typicode.com/posts").subscribe(...)'
  },
  {
    id: 17,
    title: 'Use Observables and subscribe() to load a user list',
    unit: 'Unit 3',
    objective: 'Fetch users from API and display them using RxJS Observable and subscribe().',
    explanationHindi: 'RxJS Observable stream ko .subscribe({ next: ..., error: ... }) se consume karke user data display kiya.',
    route: '/experiments',
    badge: 'RxJS & subscribe',
    codeSnippet: 'this.apiService.getUsers().subscribe(users => this.userList = users);'
  },
  {
    id: 18,
    title: 'Set up routing between Home, About, and Contact components',
    unit: 'Unit 3',
    objective: 'Use Angular router to switch between Home, About, and Contact components.',
    explanationHindi: 'app.routes.ts me routes config karke <router-outlet> aur routerLink active state implement kiya.',
    route: '/home',
    badge: 'Angular Router',
    codeSnippet: 'const routes: Routes = [{ path: "home", component: HomeComponent }, ... ];'
  },
  {
    id: 19,
    title: 'Add route parameters to display student details',
    unit: 'Unit 3',
    objective: 'Use dynamic route /student/:id to display student-specific data.',
    explanationHindi: 'ActivatedRoute.snapshot.paramMap.get("id") se ID read karke student ki poori profile load ki jaati hai.',
    route: '/student/101',
    badge: 'Route Params',
    codeSnippet: 'path: "student/:id", component: StudentDetailComponent\nconst id = Number(this.route.snapshot.paramMap.get("id"));'
  },
  {
    id: 20,
    title: 'Implement a simple route guard to protect the admin page',
    unit: 'Unit 3',
    objective: 'Create a guard that blocks /admin page unless a user is logged in.',
    explanationHindi: 'AuthGuard banaya jo canActivateFn me authService.isLoggedIn() check karke unauthorized user ko login par redirect karta hai.',
    route: '/admin',
    badge: 'Route Guard',
    codeSnippet: 'export const authGuard: CanActivateFn = () => authService.isLoggedIn() || router.navigate(["/admin"]);'
  },
  {
    id: 21,
    title: 'Create a template-driven form for student admission',
    unit: 'Unit 4',
    objective: 'Form with fields: name, email, gender, course with required & email validations.',
    explanationHindi: '#admissionForm="ngForm" aur [(ngModel)] se complete template-driven form validation ke saath banaya.',
    route: '/admission',
    badge: 'Template Form',
    codeSnippet: '<form #form="ngForm" (ngSubmit)="onSubmit(form)">\n<input name="email" ngModel required email #email="ngModel">\n</form>'
  },
  {
    id: 22,
    title: 'Create a reactive form for user login with validations',
    unit: 'Unit 4',
    objective: 'Add validation for required email and minimum password length using FormGroup.',
    explanationHindi: 'FormBuilder se loginForm = fb.group({ email: ["", [Validators.required, Validators.email]], password: [...] }) create kiya.',
    route: '/admin',
    badge: 'Reactive Form',
    codeSnippet: 'this.loginForm = this.fb.group({ email: ["", [Validators.required, Validators.email]], password: ["", [Validators.minLength(6)]] });'
  },
  {
    id: 23,
    title: 'Add a custom validator to check password strength',
    unit: 'Unit 4',
    objective: 'Ensure password contains at least 1 capital letter, 1 number, and 1 special character.',
    explanationHindi: 'Custom Validator passwordStrengthValidator banaya jo Regex se password strength check karke live meter dikhata hai.',
    route: '/admin',
    badge: 'Custom Validator',
    codeSnippet: 'export function passwordStrengthValidator(): ValidatorFn { return (control) => ... }'
  },
  {
    id: 24,
    title: 'Create a dynamic form using FormArray',
    unit: 'Unit 4',
    objective: 'Allow users to add multiple subjects with marks dynamically using FormArray.',
    explanationHindi: 'Reactive form me FormArray use karke user dynamic tarike se "Add Subject" button click karke rows add/remove kar sakta hai.',
    route: '/admission',
    badge: 'FormArray',
    codeSnippet: 'get subjects(): FormArray { return this.form.get("subjects") as FormArray; }\nthis.subjects.push(this.createSubjectGroup());'
  },
  {
    id: 25,
    title: 'Create a file upload form using template-driven approach',
    unit: 'Unit 4',
    objective: 'Upload a profile picture and show instant preview before submitting form.',
    explanationHindi: '<input type="file"> event se FileReader API se image dataURL generate karke preview render kiya.',
    route: '/profile',
    badge: 'File Upload',
    codeSnippet: 'const reader = new FileReader();\nreader.onload = () => this.previewUrl = reader.result as string;'
  },
  {
    id: 26,
    title: 'Share a counter state between two components using a service',
    unit: 'Unit 4',
    objective: 'One component increments counter, other shows updated count in real-time.',
    explanationHindi: 'CounterService me BehaviorSubject<number> se reactive state banayi; Component A modify karta hai aur Component B live sync hota hai.',
    route: '/counter',
    badge: 'State Service',
    codeSnippet: 'private count$ = new BehaviorSubject<number>(0);\ncount = this.count$.asObservable();\nincrement() { this.count$.next(this.count$.value + 1); }'
  },
  {
    id: 27,
    title: 'Write a unit test for a simple component method',
    unit: 'Unit 5',
    objective: 'Test a method getFullName() that returns "Raj Patel" from first and last name.',
    explanationHindi: 'Jasmine & Karma specs likhi gayi hain jo Student.getFullName("Raj", "Patel") ko verify karti hain.',
    route: '/experiments',
    badge: 'Unit Testing',
    codeSnippet: 'it("should return Raj Patel", () => {\n  expect(Student.getFullName("Raj", "Patel")).toBe("Raj Patel");\n});'
  },
  {
    id: 28,
    title: 'Deploy an Angular app on GitHub Pages or Netlify',
    unit: 'Unit 5',
    objective: 'Build and publish app online for public access (dist bundle, netlify.toml, gh-pages).',
    explanationHindi: 'ng build --base-href ./ se production build generate kiya aur netlify.toml & deploy documentation create kiye.',
    route: '/experiments',
    badge: 'Deployment',
    codeSnippet: 'npm run build\n# Ready for Netlify / GitHub Pages deployment'
  },
  {
    id: 29,
    title: 'Enable lazy loading for the Reports module',
    unit: 'Unit 5',
    objective: 'Create separate Reports module/routes and load only when user navigates to /reports.',
    explanationHindi: 'loadChildren: () => import("./reports/reports.routes").then(m => m.REPORTS_ROUTES) se bundle on-demand load hota hai.',
    route: '/reports',
    badge: 'Lazy Loading',
    codeSnippet: '{ path: "reports", loadChildren: () => import("./reports/reports.routes").then(m => m.REPORTS_ROUTES) }'
  },
  {
    id: 30,
    title: 'Build and submit a mini project with full CRUD operations: Student Management System',
    unit: 'Unit 5',
    objective: 'Complete Student Management System with Add, Read, Update, Delete, Search, and Filters.',
    explanationHindi: 'Pura production-grade Student Management System jisme CRUD operations, local storage persistence, validation aur analytics hain.',
    route: '/students',
    badge: 'CRUD Mini Project',
    codeSnippet: 'studentService.addStudent(s);\nstudentService.updateStudent(id, s);\nstudentService.deleteStudent(id);'
  }
];
