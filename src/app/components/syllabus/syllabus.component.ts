import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface SyllabusUnit {
  id: number;
  title: string;
  weightage: string;
  description: string;
  topics: { name: string; done: boolean; expId?: number; expRoute?: string }[];
}

@Component({
  selector: 'app-syllabus',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="syllabus-page">
      <!-- Hero Header -->
      <div class="syllabus-hero">
        <div class="hero-main">
          <div class="hero-badges">
            <span class="badge-tag">University Curriculum</span>
            <span class="badge-tag badge-tag-success">5 Units • 30 Practicals</span>
            <span class="badge-tag badge-tag-warning">Semester Framework</span>
          </div>
          <h1>Angular Framework Syllabus & Curriculum Hub</h1>
          <p>
            Complete syllabus curriculum mapping based on the university course guidelines.
            Track your revision progress, explore unit weightage, and jump directly into practical implementations.
          </p>
        </div>

        <div class="progress-card">
          <div class="prog-stat">
            <span class="prog-pct">{{ overallProgress }}%</span>
            <span class="prog-lbl">Curriculum Completed</span>
          </div>
          <div class="prog-bar-track">
            <div class="prog-bar-fill" [style.width.%]="overallProgress"></div>
          </div>
          <div class="prog-sub">
            <span>{{ completedTopicsCount }} of {{ totalTopicsCount }} topics completed</span>
            <button (click)="resetProgress()" class="btn-reset-prog" title="Reset tracking">
              <i class="fa-solid fa-arrows-rotate me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Course Outcomes (CO1, CO2, CO3) -->
      <section class="co-section">
        <h2 class="section-heading"><i class="fa-solid fa-bullseye me-2"></i> Course Outcomes (COs)</h2>
        <div class="co-grid">
          <div class="co-card">
            <div class="co-badge">CO1</div>
            <h3>Understanding of TypeScript</h3>
            <p>Master static typing, OOP classes, interfaces, enums, arrow functions, and TypeScript compilation.</p>
          </div>
          <div class="co-card">
            <div class="co-badge">CO2</div>
            <h3>Frontend Architecture & Design</h3>
            <p>Architect scalable web applications using Angular standalone components, dependency injection, and singleton services.</p>
          </div>
          <div class="co-card">
            <div class="co-badge">CO3</div>
            <h3>Directives, Pipes & Routing</h3>
            <p>Implement built-in/custom structural directives, dynamic pipes, parameterized router navigation, and route guards.</p>
          </div>
        </div>
      </section>

      <!-- Unit Selector Tabs -->
      <div class="units-nav-tabs">
        <button 
          (click)="selectedUnitTab = 0" 
          class="tab-btn" 
          [class.active]="selectedUnitTab === 0">
          All Units (Overview)
        </button>
        <button 
          *ngFor="let u of units" 
          (click)="selectedUnitTab = u.id" 
          class="tab-btn" 
          [class.active]="selectedUnitTab === u.id">
          Unit {{ u.id }} ({{ u.weightage }})
        </button>
      </div>

      <!-- Units Accordion / List -->
      <div class="units-list">
        <div *ngFor="let unit of displayedUnits" class="unit-block">
          <div class="unit-header-row">
            <div>
              <span class="unit-badge">Unit {{ unit.id }}</span>
              <h3 class="unit-title">{{ unit.title }}</h3>
              <p class="unit-desc">{{ unit.description }}</p>
            </div>
            <div class="unit-weight-box">
              <span class="weight-label">Weightage</span>
              <strong class="weight-value">{{ unit.weightage }}</strong>
            </div>
          </div>

          <div class="topics-checklist">
            <h4>Checklist & Interactive Experiments Mapping:</h4>
            <div class="topics-grid">
              <div 
                *ngFor="let t of unit.topics; let i = index" 
                class="topic-item" 
                [class.topic-checked]="t.done">
                
                <label class="topic-label">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="t.done" 
                    (change)="saveProgress()" 
                    class="topic-checkbox" />
                  <span class="topic-name">{{ t.name }}</span>
                </label>

                <a 
                  *ngIf="t.expRoute" 
                  [routerLink]="t.expRoute" 
                  class="btn-topic-exp" 
                  title="Open practical experiment">
                  <i class="fa-solid fa-flask-vial me-1"></i> Exp #{{ t.expId }} →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reference Books Section -->
      <section class="books-section">
        <h2 class="section-heading"><i class="fa-solid fa-book-open-reader me-2"></i> Recommended Reference Books & Web Resources</h2>
        <div class="books-grid">
          <div *ngFor="let b of books" class="book-card">
            <span class="book-num">#{{ b.id }}</span>
            <div class="book-details">
              <h4>{{ b.title }}</h4>
              <p class="book-author">Author: <strong>{{ b.author }}</strong></p>
              <p class="book-publisher">Publisher: {{ b.publisher }}</p>
              <span class="book-coverage">{{ b.coverage }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .syllabus-page { display: flex; flex-direction: column; gap: 2.25rem; max-width: 1400px; margin: 0 auto; }
    
    .syllabus-hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%);
      color: #ffffff;
      padding: 3rem 2.5rem;
      border-radius: 24px;
      display: grid;
      grid-template-columns: 1.8fr 1fr;
      gap: 2.5rem;
      align-items: center;
      box-shadow: 0 16px 36px -6px rgba(15, 23, 42, 0.25);
    }
    @media (max-width: 900px) {
      .syllabus-hero { grid-template-columns: 1fr; padding: 2rem 1.5rem; }
    }

    .hero-badges { display: flex; gap: 0.6rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .syllabus-hero h1 { margin: 0 0 0.85rem 0; font-size: 2.3rem; font-weight: 800; line-height: 1.2; letter-spacing: -0.5px; }
    .syllabus-hero p { margin: 0; font-size: 1rem; opacity: 0.9; line-height: 1.6; max-width: 650px; }

    .progress-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .prog-stat { display: flex; align-items: baseline; gap: 0.75rem; }
    .prog-pct { font-size: 2.8rem; font-weight: 900; color: #4ade80; line-height: 1; }
    .prog-lbl { font-size: 0.9rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85; }
    .prog-bar-track { height: 12px; background: rgba(0, 0, 0, 0.3); border-radius: 9999px; overflow: hidden; }
    .prog-bar-fill { height: 100%; background: linear-gradient(90deg, #22c55e, #4ade80); border-radius: 9999px; transition: width 0.4s ease; }
    .prog-sub { display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; opacity: 0.85; }
    .btn-reset-prog { color: #fca5a5; font-size: 0.8rem; font-weight: 700; background: none; border: none; cursor: pointer; text-decoration: underline; }

    .section-heading { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1.25rem; }

    .co-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    .co-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 20px;
      padding: 1.75rem;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
      display: flex;
      flex-direction: column;
      transition: transform 0.2s;
    }
    .co-card:hover { transform: translateY(-3px); }
    .co-badge {
      background: #4f46e5;
      color: #ffffff;
      font-weight: 800;
      font-size: 0.8rem;
      padding: 0.25rem 0.75rem;
      border-radius: 8px;
      width: fit-content;
      margin-bottom: 0.85rem;
    }
    .co-card h3 { margin: 0 0 0.5rem 0; font-size: 1.15rem; color: #0f172a; }
    .co-card p { margin: 0; font-size: 0.88rem; color: #64748b; line-height: 1.5; }

    .units-nav-tabs { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; -webkit-overflow-scrolling: touch; }
    .tab-btn {
      padding: 0.65rem 1.25rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.85rem;
      white-space: nowrap;
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      color: #475569;
      transition: all 0.18s;
    }
    .tab-btn:hover { border-color: #6366f1; color: #1e1b4b; }
    .tab-btn.active { background: #4f46e5; border-color: #4f46e5; color: #ffffff; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }

    .units-list { display: flex; flex-direction: column; gap: 1.75rem; }
    .unit-block {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 22px;
      padding: 2.25rem;
      box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05);
    }
    .unit-header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; margin-bottom: 1.75rem; padding-bottom: 1.5rem; border-bottom: 1.5px solid #f1f5f9; }
    @media (max-width: 600px) {
      .unit-header-row { flex-direction: column; }
    }
    .unit-badge { background: #e0e7ff; color: #3730a3; font-weight: 800; font-size: 0.8rem; padding: 0.25rem 0.75rem; border-radius: 8px; display: inline-block; margin-bottom: 0.5rem; }
    .unit-title { margin: 0 0 0.4rem 0; font-size: 1.4rem; color: #0f172a; font-weight: 800; }
    .unit-desc { margin: 0; color: #64748b; font-size: 0.92rem; }
    .unit-weight-box { background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 14px; padding: 0.75rem 1.25rem; text-align: center; white-space: nowrap; }
    .weight-label { display: block; font-size: 0.75rem; font-weight: 700; color: #166534; text-transform: uppercase; }
    .weight-value { font-size: 1.4rem; font-weight: 900; color: #15803d; }

    .topics-checklist h4 { margin: 0 0 1rem 0; font-size: 0.95rem; color: #334155; }
    .topics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 0.85rem; }
    @media (max-width: 500px) {
      .topics-grid { grid-template-columns: 1fr; }
    }
    .topic-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.75rem 1rem;
      transition: all 0.15s;
    }
    .topic-item:hover { background: #f1f5f9; border-color: #cbd5e1; }
    .topic-item.topic-checked { background: #f0fdf4; border-color: #86efac; }
    .topic-item.topic-checked .topic-name { text-decoration: line-through; opacity: 0.7; }
    .topic-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; flex: 1; }
    .topic-checkbox { width: 18px; height: 18px; accent-color: #16a34a; cursor: pointer; }
    .topic-name { font-size: 0.88rem; font-weight: 600; color: #1e293b; }
    .btn-topic-exp {
      background: #4f46e5;
      color: #ffffff !important;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.35rem 0.65rem;
      border-radius: 8px;
      white-space: nowrap;
      transition: background 0.15s;
    }
    .btn-topic-exp:hover { background: #4338ca; }

    .books-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    .book-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.5rem;
      display: flex;
      gap: 1rem;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
    }
    .book-num {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #f1f5f9;
      color: #475569;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      flex-shrink: 0;
    }
    .book-details h4 { margin: 0 0 0.35rem 0; font-size: 1rem; color: #0f172a; }
    .book-author { margin: 0 0 0.2rem 0; font-size: 0.85rem; color: #475569; }
    .book-publisher { margin: 0 0 0.65rem 0; font-size: 0.82rem; color: #64748b; }
    .book-coverage {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #4f46e5;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      display: inline-block;
    }
  `]
})
export class SyllabusComponent implements OnInit {
  selectedUnitTab: number = 0; // 0 for all
  private readonly STORAGE_KEY = 'sms_syllabus_progress_v1';

  units: SyllabusUnit[] = [
    {
      id: 1,
      title: 'Introduction to Web Technologies & Angular Basics',
      weightage: '20%',
      description: 'Web Architecture, TypeScript Fundamentals, Datatypes, Enums, Interfaces, Classes, and Angular CLI Project Scaffolding.',
      topics: [
        { name: 'Angular CLI Scaffolding & ng serve', done: true, expId: 1, expRoute: '/dashboard' },
        { name: 'Interpolation Data Display', done: true, expId: 2, expRoute: '/profile' },
        { name: 'TypeScript Student Class & Marks Model', done: true, expId: 3, expRoute: '/students' },
        { name: 'Product Interface & Typing Contract', done: true, expId: 4, expRoute: '/store' },
        { name: 'Enums (BCA, MCA, iMCA, BCA_Hons)', done: true, expId: 5, expRoute: '/store' }
      ]
    },
    {
      id: 2,
      title: 'Directives, Data Binding & Pipes',
      weightage: '20%',
      description: 'Component, Structural (*ngIf, *ngFor), Attribute Directives, Two-way Binding [(ngModel)], Built-in & Custom Pipes.',
      topics: [
        { name: 'Summary Dashboard Component', done: true, expId: 6, expRoute: '/dashboard' },
        { name: 'Reusable Student Card with @Input()', done: true, expId: 7, expRoute: '/dashboard' },
        { name: '*ngIf & *ngFor Visibility Toggle', done: true, expId: 8, expRoute: '/students' },
        { name: 'Event Binding & Button Clicks', done: true, expId: 9, expRoute: '/store' },
        { name: 'Two-Way Binding [(ngModel)] Live Sync', done: true, expId: 10, expRoute: '/profile' },
        { name: 'Built-in Pipes: Currency (₹) & Date', done: true, expId: 11, expRoute: '/store' },
        { name: 'Custom Pipe: Initials Abbreviation (AbbreviatePipe)', done: true, expId: 12, expRoute: '/students' },
        { name: 'Custom Directive: Highlight Overdue Tasks', done: true, expId: 13, expRoute: '/tasks' },
        { name: 'ngClass Conditional Styling on Marks (>40 Pass, <40 Fail)', done: true, expId: 14, expRoute: '/students' }
      ]
    },
    {
      id: 3,
      title: 'Services, Dependency Injection & Routing',
      weightage: '20%',
      description: 'Angular Dependency Injection (DI), RxJS Observables, HttpClient Module, Angular Router Navigation, Dynamic Parameters, and Route Guards.',
      topics: [
        { name: 'StudentService for Component Sharing (getAllStudents)', done: true, expId: 15, expRoute: '/students' },
        { name: 'HttpClient REST API Calls (jsonplaceholder/posts)', done: true, expId: 16, expRoute: '/dashboard' },
        { name: 'Observables & subscribe() User Stream', done: true, expId: 17, expRoute: '/dashboard' },
        { name: 'Angular Router (Home, About, Contact)', done: true, expId: 18, expRoute: '/home' },
        { name: 'Route Parameters (/student/:id dynamic view)', done: true, expId: 19, expRoute: '/students' },
        { name: 'Route Guards: CanActivateFn authGuard protecting /admin', done: true, expId: 20, expRoute: '/admin' }
      ]
    },
    {
      id: 4,
      title: 'Forms and State Management',
      weightage: '20%',
      description: 'Template-Driven Forms, Reactive Forms with FormBuilder & Validators, Custom Password Strength Validation, FormArray, File Upload, and State Management.',
      topics: [
        { name: 'Template-Driven Admission Form (#admissionForm="ngForm")', done: true, expId: 21, expRoute: '/admission' },
        { name: 'Reactive Login Form with FormBuilder & Validators', done: true, expId: 22, expRoute: '/admin' },
        { name: 'Custom Password Strength Validator (Exp 23)', done: true, expId: 23, expRoute: '/admin' },
        { name: 'Dynamic FormArray for Multiple Subjects & Marks', done: true, expId: 24, expRoute: '/admission' },
        { name: 'File Upload with Instant FileReader Image Preview', done: true, expId: 25, expRoute: '/profile' },
        { name: 'Shared Service State Counter between Independent Components', done: true, expId: 26, expRoute: '/counter' }
      ]
    },
    {
      id: 5,
      title: 'Testing, Deployment & Advanced Features',
      weightage: '20%',
      description: 'Unit Testing with Jasmine & Karma, Performance Optimization, Standalone Components, Lazy Loading Modules, and Production Netlify/GitHub Deployment.',
      topics: [
        { name: 'Unit Testing getFullName() Method with Jasmine Spec', done: true, expId: 27, expRoute: '/experiments' },
        { name: 'Production Build & Netlify/Vercel Deployment Guide', done: true, expId: 28, expRoute: '/experiments' },
        { name: 'Lazy Loading ReportsModule (/reports)', done: true, expId: 29, expRoute: '/reports' },
        { name: 'Mini Project Full CRUD Student Management System', done: true, expId: 30, expRoute: '/students' }
      ]
    }
  ];

  books = [
    { id: 1, title: 'Pro Angular', author: 'Adam Freeman', publisher: 'Apress', coverage: 'Units 1, 2, 3, 4, 5 (Master Reference)' },
    { id: 2, title: 'Angular Projects', author: 'Aristeidis Bampakos', publisher: 'Packt Publishing', coverage: 'Real-world Architecture & Components' },
    { id: 3, title: 'Learning Angular', author: 'Christoffer Noring', publisher: 'O’Reilly Media', coverage: 'RxJS & Dependency Injection' },
    { id: 4, title: 'TypeScript Quickly', author: 'Yakov Fain & Anton Moiseev', publisher: 'Manning', coverage: 'Unit 1 TypeScript Core' },
    { id: 5, title: 'Mastering Angular Reactive Forms', author: 'Netanel Basal', publisher: 'Independently Published', coverage: 'Unit 4 FormArray & Validators' },
    { id: 6, title: 'Angular Cookbook', author: 'Muhammad Ahsan Ayaz', publisher: 'Packt Publishing', coverage: 'Performance & Standalone Components' }
  ];

  ngOnInit(): void {
    this.loadProgress();
  }

  get displayedUnits(): SyllabusUnit[] {
    if (this.selectedUnitTab === 0) {
      return this.units;
    }
    return this.units.filter(u => u.id === this.selectedUnitTab);
  }

  get totalTopicsCount(): number {
    return this.units.reduce((acc, u) => acc + u.topics.length, 0);
  }

  get completedTopicsCount(): number {
    return this.units.reduce((acc, u) => acc + u.topics.filter(t => t.done).length, 0);
  }

  get overallProgress(): number {
    const total = this.totalTopicsCount;
    if (total === 0) return 0;
    return Math.round((this.completedTopicsCount / total) * 100);
  }

  saveProgress(): void {
    try {
      const state = this.units.map(u => ({
        id: u.id,
        topics: u.topics.map(t => ({ name: t.name, done: t.done }))
      }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save progress to localStorage');
    }
  }

  loadProgress(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const savedUnits = JSON.parse(stored);
        for (const su of savedUnits) {
          const targetUnit = this.units.find(u => u.id === su.id);
          if (targetUnit) {
            for (const st of su.topics) {
              const targetTopic = targetUnit.topics.find(t => t.name === st.name);
              if (targetTopic) {
                targetTopic.done = st.done;
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not load progress');
    }
  }

  resetProgress(): void {
    if (confirm('Are you sure you want to reset your syllabus checklist progress?')) {
      for (const u of this.units) {
        for (const t of u.topics) {
          t.done = false;
        }
      }
      this.saveProgress();
    }
  }
}
