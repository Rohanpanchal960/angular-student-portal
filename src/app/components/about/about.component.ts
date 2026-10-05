import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * ====================================================================================
 * [EXPERIMENT 18] - About Component (Angular Router Routing between Home, About, Contact)
 * ====================================================================================
 */

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="about-page">
      <div class="about-hero">
        <span class="badge-tag">About Portal</span>
        <h1>About the Student Management System & Syllabus</h1>
        <p>
          Designed according to the official Angular Framework syllabus curriculum,
          covering all fundamental units and practical academic modules.
        </p>
      </div>

      <div class="syllabus-units-grid">
        <div class="unit-card">
          <div class="unit-header-row">
            <div class="unit-num">Unit 1</div>
            <i class="fa-solid fa-code unit-icon"></i>
          </div>
          <h3>TypeScript & Angular Fundamentals</h3>
          <p>Classes, Interfaces, Enums, Arrays, and Project Scaffolding via Angular CLI.</p>
          <span class="coverage-tag"><i class="fa-solid fa-chart-pie"></i> Weightage: 20%</span>
        </div>

        <div class="unit-card">
          <div class="unit-header-row">
            <div class="unit-num">Unit 2</div>
            <i class="fa-solid fa-cubes unit-icon"></i>
          </div>
          <h3>Components, Data Binding & Directives</h3>
          <p>Interpolation, Property & Event Binding, Two-Way Data Binding, Built-in & Custom Pipes and Directives.</p>
          <span class="coverage-tag"><i class="fa-solid fa-chart-pie"></i> Weightage: 20%</span>
        </div>

        <div class="unit-card">
          <div class="unit-header-row">
            <div class="unit-num">Unit 3</div>
            <i class="fa-solid fa-network-wired unit-icon"></i>
          </div>
          <h3>Services, DI, RxJS & Routing</h3>
          <p>Dependency Injection, HttpClient REST API calls, Observables, Route parameters, and AuthGuards.</p>
          <span class="coverage-tag"><i class="fa-solid fa-chart-pie"></i> Weightage: 20%</span>
        </div>

        <div class="unit-card">
          <div class="unit-header-row">
            <div class="unit-num">Unit 4</div>
            <i class="fa-solid fa-rectangle-list unit-icon"></i>
          </div>
          <h3>Forms & State Management</h3>
          <p>Template-Driven vs. Reactive Forms, Custom Validators, FormArray, File Upload, and Service state.</p>
          <span class="coverage-tag"><i class="fa-solid fa-chart-pie"></i> Weightage: 20%</span>
        </div>

        <div class="unit-card">
          <div class="unit-header-row">
            <div class="unit-num">Unit 5</div>
            <i class="fa-solid fa-flask-vial unit-icon"></i>
          </div>
          <h3>Testing, Deployment & Mini Project</h3>
          <p>Jasmine unit tests, Netlify deployment setup, Lazy loading modules, and Full CRUD mini-project.</p>
          <span class="coverage-tag"><i class="fa-solid fa-chart-pie"></i> Weightage: 20%</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .about-page { display: flex; flex-direction: column; gap: 2rem; }
    .about-hero {
      background: #ffffff;
      padding: 2.25rem;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
    }
    .badge-tag {
      background: #eef2ff;
      color: #4338ca;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      display: inline-block;
      margin-bottom: 0.5rem;
    }
    .about-hero h1 { margin: 0 0 0.5rem 0; font-size: 1.85rem; color: #0f172a; }
    .about-hero p { margin: 0; color: #64748b; font-size: 0.95rem; }
    .syllabus-units-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }
    .unit-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.5rem;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .unit-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
    }
    .unit-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    .unit-num {
      background: #4f46e5;
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      width: fit-content;
    }
    .unit-icon {
      font-size: 1.1rem;
      color: #818cf8;
    }
    .unit-card h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #0f172a; font-weight: 700; }
    .unit-card p { margin: 0 0 1rem 0; font-size: 0.85rem; color: #64748b; line-height: 1.5; flex: 1; }
    .coverage-tag {
      font-size: 0.75rem;
      color: #16a34a;
      font-weight: 700;
      background: #dcfce7;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      width: fit-content;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    @media (max-width: 768px) {
      .about-hero { padding: 1.25rem; }
      .about-hero h1 { font-size: 1.4rem; }
      .unit-card { padding: 1.25rem; }
    }
  `]
})
export class AboutComponent {}

