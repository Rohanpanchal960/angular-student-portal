import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * ====================================================================================
 * MASTER NAVBAR COMPONENT
 * ====================================================================================
 * Header bar featuring:
 * - Mobile hamburger trigger
 * - Portal branding
 * - Fast Multi-Role Account Switcher (Admin / Faculty / Student concurrent testing)
 * - Quick demo seed tool
 * - Dark mode theme toggler
 * - User profile pill & signout
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="app-navbar">
      <div class="nav-left">
        <!-- Mobile Drawer Toggle (<860px) -->
        <button 
          class="btn-icon drawer-toggle" 
          (click)="toggleSidebar.emit()" 
          aria-label="Toggle Navigation Menu">
          <i class="fa-solid fa-bars"></i>
        </button>

        <a routerLink="/" class="brand-link">
          <div class="brand-icon">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <div class="brand-text">
            <span class="brand-name">Edu<span class="gradient-text">Portal</span></span>
            <span class="brand-badge">Academic Cloud</span>
          </div>
        </a>
      </div>

      <div class="nav-right">
        <!-- Dark Mode Toggle -->
        <button 
          type="button" 
          class="btn-icon theme-toggle" 
          (click)="toggleTheme()" 
          [attr.aria-label]="isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          [title]="isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          @if (isDark()) {
            <i class="fa-solid fa-sun text-warning"></i>
          } @else {
            <i class="fa-solid fa-moon text-primary"></i>
          }
        </button>

        <!-- Authenticated User Profile Menu -->
        @if (auth.userProfile(); as user) {
          <div class="user-pill">
            <div class="user-avatar">
              {{ user.displayName.charAt(0).toUpperCase() }}
            </div>
            <div class="user-meta">
              <span class="user-name">{{ user.displayName }}</span>
              <span class="role-badge" [ngClass]="user.role">{{ user.role | uppercase }}</span>
            </div>
            <button 
              type="button" 
              class="btn-icon logout-btn" 
              (click)="auth.logout()" 
              title="Logout from EduPortal">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>
        } @else {
          <a routerLink="/login" class="gradient-btn login-btn">
            <i class="fa-solid fa-right-to-bracket"></i>
            <span>Login</span>
          </a>
        }
      </div>
    </header>
  `,
  styles: [`
    .app-navbar {
      height: var(--header-height);
      background: var(--bg-glass-heavy);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 900;
      box-shadow: var(--shadow-sm);
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .drawer-toggle {
      display: none;
    }

    @media (max-width: 860px) {
      .drawer-toggle {
        display: inline-flex;
      }
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--primary-gradient);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      box-shadow: 0 4px 12px var(--primary-glow);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 1.2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      line-height: 1.1;
    }

    .gradient-text {
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-badge {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    /* Role Switcher Menu */
    .role-switcher-wrapper {
      position: relative;
    }

    .btn-switcher {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.45rem 0.85rem;
      min-height: 38px;
      border-radius: var(--radius-md);
      background: var(--primary-light);
      border: 1px solid rgba(79, 70, 229, 0.3);
      color: var(--primary);
      font-size: 0.825rem;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition);
    }

    .btn-switcher:hover {
      background: rgba(79, 70, 229, 0.2);
    }

    .arrow-icon {
      font-size: 0.7rem;
      transition: transform 0.2s ease;
    }

    .arrow-icon.rotated {
      transform: rotate(180deg);
    }

    @media (max-width: 680px) {
      .switcher-text {
        display: none;
      }
    }

    .switcher-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 290px;
      background: var(--bg-card);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-xl);
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      z-index: 1000;
      animation: fadeIn 0.15s ease-out;
    }

    .menu-header {
      font-size: 0.725rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      padding: 0.45rem 0.65rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 0.25rem;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.65rem;
      border-radius: var(--radius-sm);
      border: none;
      background: none;
      cursor: pointer;
      text-align: left;
      transition: var(--transition);
      width: 100%;
    }

    .menu-item:hover {
      background: var(--bg-hover);
    }

    .menu-item.active {
      background: var(--primary-light);
    }

    .avatar-mini {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 800;
      flex-shrink: 0;
    }

    .avatar-mini.admin { background: #8b5cf6; }
    .avatar-mini.faculty { background: #06b6d4; }
    .avatar-mini.student { background: #10b981; }

    .item-text {
      display: flex;
      flex-direction: column;
    }

    .item-text strong {
      font-size: 0.825rem;
      color: var(--text-primary);
    }

    .item-text small {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    .btn-demo-seed {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.85rem;
      min-height: 38px;
      border-radius: var(--radius-md);
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--success);
      font-size: 0.825rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
    }

    .btn-demo-seed:hover {
      background: rgba(16, 185, 129, 0.2);
      transform: translateY(-1px);
    }

    @media (max-width: 600px) {
      .seed-text {
        display: none;
      }
    }

    .theme-toggle {
      border-radius: var(--radius-md);
    }

    .text-warning { color: var(--warning); }
    .text-primary { color: var(--primary); }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.3rem 0.4rem 0.3rem 0.75rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-full);
      box-shadow: var(--shadow-sm);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary-gradient);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-primary);
      max-width: 130px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (max-width: 700px) {
      .user-meta {
        display: none;
      }
    }

    .role-badge {
      font-size: 0.625rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      line-height: 1;
    }

    .role-badge.admin { color: #8b5cf6; }
    .role-badge.faculty { color: #06b6d4; }
    .role-badge.student { color: #10b981; }

    .logout-btn {
      width: 34px;
      height: 34px;
      min-width: 34px;
      min-height: 34px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: var(--text-muted);
    }

    .logout-btn:hover {
      background: var(--danger-light);
      color: var(--danger);
    }

    .login-btn {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }
  `]
})
export class NavbarComponent {
  public auth = inject(AuthService);

  @Output() toggleSidebar = new EventEmitter<void>();

  public isDark = signal<boolean>(false);

  constructor() {
    const saved = localStorage.getItem('eduportal_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDark.set(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  toggleTheme(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    const themeStr = next ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeStr);
    localStorage.setItem('eduportal_theme', themeStr);
  }
}
