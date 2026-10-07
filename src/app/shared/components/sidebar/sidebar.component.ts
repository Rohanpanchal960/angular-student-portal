import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * ====================================================================================
 * SIDEBAR & MOBILE DRAWER NAVIGATION COMPONENT
 * ====================================================================================
 * Adaptive sidebar that transforms into an off-canvas drawer on screens < 860px.
 * Automatically adapts navigation links according to current role (admin/faculty/student).
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile Backdrop overlay -->
    @if (isOpen) {
      <div class="sidebar-backdrop" (click)="closeSidebar.emit()"></div>
    }

    <aside class="app-sidebar" [class.open]="isOpen">
      <div class="sidebar-header">
        <div class="portal-tag">
          <i class="fa-solid fa-shield-halved"></i>
          <span>
            @if (auth.userRole() === 'admin') {
              ADMINISTRATOR
            } @else if (auth.userRole() === 'faculty') {
              FACULTY PORTAL
            } @else if (auth.userRole() === 'student') {
              STUDENT PORTAL
            } @else {
              GUEST EXPLORER
            }
          </span>
        </div>
        <button class="btn-icon close-btn" (click)="closeSidebar.emit()" aria-label="Close sidebar">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        <!-- -------------------------------------------------------- -->
        <!-- 1. ADMIN NAVIGATION LINKS                                 -->
        <!-- -------------------------------------------------------- -->
        @if (auth.userRole() === 'admin') {
          <div class="nav-section-title">ADMINISTRATION</div>

          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-chart-pie"></i>
            <span>Dashboard</span>
          </a>

          <a routerLink="/admin/users" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-users-gear"></i>
            <span>User Management</span>
          </a>

          <a routerLink="/admin/students" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-user-graduate"></i>
            <span>Students & CSV</span>
          </a>

          <a routerLink="/admin/courses" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-book-open-reader"></i>
            <span>Courses & Subjects</span>
          </a>

          <a routerLink="/admin/exams" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-calendar-days"></i>
            <span>Exam Timetable</span>
          </a>

          <a routerLink="/admin/results" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-square-poll-vertical"></i>
            <span>Publish Results</span>
          </a>

          <a routerLink="/admin/notices" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-bullhorn"></i>
            <span>Announcements</span>
          </a>

          <a routerLink="/admin/reports" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-file-invoice"></i>
            <span>Reports & Exports</span>
          </a>
        }

        <!-- -------------------------------------------------------- -->
        <!-- 2. FACULTY NAVIGATION LINKS                              -->
        <!-- -------------------------------------------------------- -->
        @if (auth.userRole() === 'faculty') {
          <div class="nav-section-title">FACULTY SUITE</div>

          <a routerLink="/faculty/dashboard" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-chalkboard-user"></i>
            <span>Dashboard</span>
          </a>

          <a routerLink="/faculty/attendance" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-clipboard-user"></i>
            <span>Mark Attendance</span>
          </a>

          <a routerLink="/faculty/assessments" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-pen-to-square"></i>
            <span>Assessments & Marks</span>
          </a>

          <a routerLink="/faculty/students" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-users"></i>
            <span>My Students</span>
          </a>

          <a routerLink="/faculty/notices" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-bullhorn"></i>
            <span>Post Notices</span>
          </a>
        }

        <!-- -------------------------------------------------------- -->
        <!-- 3. STUDENT NAVIGATION LINKS                              -->
        <!-- -------------------------------------------------------- -->
        @if (auth.userRole() === 'student') {
          <div class="nav-section-title">STUDENT DESK</div>

          <a routerLink="/student/dashboard" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-gauge-high"></i>
            <span>Dashboard</span>
          </a>

          <a routerLink="/student/attendance" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-calendar-check"></i>
            <span>My Attendance</span>
          </a>

          <a routerLink="/student/results" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-award"></i>
            <span>Marks & Grade Sheet</span>
          </a>

          <a routerLink="/student/exams" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-id-card"></i>
            <span>Exams & Admit Card</span>
          </a>

          <a routerLink="/student/notices" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-bell"></i>
            <span>Notice Board</span>
          </a>
        }

        <!-- -------------------------------------------------------- -->
        <!-- COMMON ACCOUNT LINKS                                     -->
        <!-- -------------------------------------------------------- -->
        <div class="nav-section-title">ACCOUNT</div>

        <a routerLink="/profile" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
          <i class="fa-solid fa-id-badge"></i>
          <span>My Profile</span>
        </a>

        @if (auth.isAuthenticated()) {
          <button type="button" class="nav-link logout-nav-btn" (click)="auth.logout()">
            <i class="fa-solid fa-power-off"></i>
            <span>Sign Out</span>
          </button>
        } @else {
          <a routerLink="/login" routerLinkActive="active" class="nav-link" (click)="onLinkClick()">
            <i class="fa-solid fa-right-to-bracket"></i>
            <span>Sign In</span>
          </a>
        }
      </nav>

      <div class="sidebar-footer">
        <div class="sync-status">
          <span class="status-dot"></span>
          <span>Firestore Connected</span>
        </div>
        <div class="version-label">EduPortal v2.4 LTS</div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 950;
    }

    @media (max-width: 860px) {
      .sidebar-backdrop {
        display: block;
      }
    }

    .app-sidebar {
      width: var(--sidebar-width);
      background: var(--bg-surface);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: sticky;
      top: 0;
      z-index: 920;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @media (max-width: 860px) {
      .app-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        height: 100%;
        z-index: 990;
        transform: translateX(-100%);
        box-shadow: var(--shadow-xl);
      }

      .app-sidebar.open {
        transform: translateX(0);
      }
    }

    .sidebar-header {
      padding: 1.25rem 1.25rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-color);
    }

    .portal-tag {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.725rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--primary);
      background: var(--primary-light);
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-sm);
    }

    .close-btn {
      display: none;
      width: 34px;
      height: 34px;
      min-width: 34px;
      min-height: 34px;
    }

    @media (max-width: 860px) {
      .close-btn {
        display: inline-flex;
      }
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-section-title {
      font-size: 0.675rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      padding: 0.85rem 0.75rem 0.35rem;
      text-transform: uppercase;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.7rem 0.85rem;
      min-height: 44px; /* Touch target */
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.885rem;
      transition: var(--transition);
      cursor: pointer;
      text-decoration: none;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
    }

    .nav-link i {
      font-size: 1.1rem;
      width: 22px;
      text-align: center;
      color: var(--text-muted);
      transition: var(--transition);
    }

    .nav-link:hover {
      background: var(--bg-hover);
      color: var(--primary);
    }

    .nav-link:hover i {
      color: var(--primary);
    }

    .nav-link.active {
      background: var(--primary-gradient);
      color: #ffffff !important;
      box-shadow: 0 4px 12px var(--primary-glow);
    }

    .nav-link.active i {
      color: #ffffff !important;
    }

    .logout-nav-btn {
      color: var(--danger);
    }

    .logout-nav-btn i {
      color: var(--danger);
    }

    .logout-nav-btn:hover {
      background: var(--danger-light);
      color: var(--danger);
    }

    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .sync-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 6px var(--success);
    }

    .version-label {
      font-size: 0.675rem;
      color: var(--text-muted);
    }
  `]
})
export class SidebarComponent {
  public auth = inject(AuthService);

  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  onLinkClick(): void {
    if (window.innerWidth <= 860) {
      this.closeSidebar.emit();
    }
  }
}
