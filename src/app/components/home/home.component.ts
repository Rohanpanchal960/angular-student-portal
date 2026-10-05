import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * ====================================================================================
 * [EXPERIMENT 18] - Set up routing between Home, About, and Contact components
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Angular Router ke zariye load hone wala "Home" component hai.
 * 
 * [KAISE KAAM KARTA HAI?]:
 * `app.routes.ts` me path `'home'` par map hai. User jab navbar me "Home" click karta hai,
 * toh page reload kiye bagair (Single Page Application - SPA) <router-outlet> me ye view swap hota hai.
 */

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-page">
      <div class="home-hero">
        <span class="pill-badge">University Student ERP Portal</span>
        <h1>Comprehensive Student Management System</h1>
        <p class="hero-desc">
          An enterprise-grade, interactive educational portal with complete student CRUD operations,
          dynamic marksheets, performance analytics, and official transcript generation.
        </p>
        <div class="hero-cta-row">
          <a routerLink="/students" class="btn-primary">
            <i class="fa-solid fa-users me-2"></i>
            Explore Student Directory
          </a>
          <a routerLink="/reports" class="btn-secondary">
            <i class="fa-solid fa-chart-line me-2"></i>
            View Academic Reports
          </a>
        </div>
      </div>

      <!-- Feature cards grid -->
      <div class="feature-grid">
        <div class="feat-card">
          <i class="fa-solid fa-bolt feat-icon"></i>
          <h3>Modern Angular Architecture</h3>
          <p>Built with Standalone Components, TypeScript strong typing, and RxJS reactive streams.</p>
        </div>
        <div class="feat-card">
          <i class="fa-solid fa-file-signature feat-icon"></i>
          <h3>Admissions & Form Validation</h3>
          <p>Online student registration and dynamic multi-subject academic marks evaluations.</p>
        </div>
        <div class="feat-card">
          <i class="fa-solid fa-bullseye feat-icon"></i>
          <h3>Task & Deadline Tracking</h3>
          <p>Student assignments, submissions, and automatic overdue status highlighting.</p>
        </div>
        <div class="feat-card">
          <i class="fa-solid fa-chart-line feat-icon"></i>
          <h3>Analytics & Reporting</h3>
          <p>Course performance analytics, printable transcripts, and instant CSV data export.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-page { display: flex; flex-direction: column; gap: 2rem; }
    .home-hero {
      background: linear-gradient(135deg, #0f172a, #1e1b4b, #312e81);
      color: #ffffff;
      padding: 3.5rem 2.5rem;
      border-radius: 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 12px 36px rgba(15, 23, 42, 0.2);
    }
    .pill-badge {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      padding: 0.35rem 0.9rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 1.25rem;
    }
    .home-hero h1 {
      margin: 0 0 1rem 0;
      font-size: 2.5rem;
      font-weight: 800;
      max-width: 800px;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }
    .hero-desc {
      margin: 0 0 2rem 0;
      font-size: 1.05rem;
      opacity: 0.9;
      max-width: 680px;
      line-height: 1.6;
    }
    .hero-cta-row { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }
    .btn-primary {
      background: #ffffff;
      color: #1e1b4b;
      padding: 0.9rem 1.6rem;
      border-radius: 12px;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
      transition: all 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25); }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 0.9rem 1.6rem;
      border-radius: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.25); }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }
    .feat-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.75rem;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
      transition: transform 0.2s;
    }
    .feat-card:hover { transform: translateY(-3px); }
    .feat-icon { font-size: 2rem; margin-bottom: 0.75rem; display: inline-block; color: #4f46e5; }
    .feat-card h3 { margin: 0 0 0.5rem 0; font-size: 1.15rem; color: #0f172a; }
    .feat-card p { margin: 0; font-size: 0.88rem; color: #64748b; line-height: 1.5; }
  `]
})
export class HomeComponent {}
