import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './core/services/auth.service';
import { FirestoreService } from './core/services/firestore.service';
import { SeedService } from './core/services/seed.service';

/**
 * ====================================================================================
 * EDUPORTAL - MASTER APP ROOT COMPONENT
 * ====================================================================================
 * Coordinates the master application shell:
 * - Top Navbar with dark mode toggle and user menu
 * - Responsive Sidebar Drawer (<860px off-canvas drawer)
 * - Toast notification overlay
 * - Dynamic route view `<router-outlet>`
 * - Automated initial seeding on first application launch
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    ToastComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public auth = inject(AuthService);
  private firestore = inject(FirestoreService);
  private seedService = inject(SeedService);

  public isSidebarOpen = signal<boolean>(false);

  async ngOnInit(): Promise<void> {
    // Automatically seed sample data if no users exist yet
    const existingUsers = await this.firestore.getAllUsers();
    if (existingUsers.length === 0) {
      console.log('ℹ️ [EduPortal] No existing records found. Initializing seed demo data...');
      await this.seedService.seedAllData();
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }
}
