import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CounterService } from './services/counter.service';
import { AuthService } from './services/auth.service';

/**
 * ====================================================================================
 * Root Application Component: Student Management System
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Pure application ka shell aur main layout manage karta hai:
 * - Top Navigation bar with active link indicators
 * - Live synchronized state counters (Exp 26)
 * - Dynamic route container `<router-outlet>` (Exp 18)
 * - Mobile responsive navigation menu
 * - Syllabus curriculum footer
 */

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Student Management System';
  isMobileMenuOpen = false;

  constructor(
    public counterService: CounterService,
    public authService: AuthService
  ) {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }
}
