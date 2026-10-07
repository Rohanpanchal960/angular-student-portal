import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { UserProfile, UserRole } from '../../../core/models';

/**
 * ====================================================================================
 * ADMIN USERS MANAGEMENT COMPONENT
 * ====================================================================================
 * Comprehensive user account control:
 * - Search by name, email, roll no
 * - Filter by role (Admin, Faculty, Student)
 * - Approve pending faculty & Suspend/Activate users
 * - Reassign roles and delete users with confirmation
 */
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  template: `
    <div class="users-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">User Accounts Directory</h1>
          <p class="page-subtitle">Manage roles, approvals, and security statuses for all institutional users</p>
        </div>
        <div class="total-badge">
          <span>Total Accounts:</span>
          <strong>{{ filteredUsers().length }}</strong>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="toolbar glass-card">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input 
            type="text" 
            [ngModel]="searchQuery()" 
            (ngModelChange)="searchQuery.set($event)"
            class="form-control search-input" 
            placeholder="Search by name, email, or roll no..." />
        </div>

        <div class="filter-group">
          <select [ngModel]="selectedRole()" (ngModelChange)="selectedRole.set($event)" class="form-control role-select">
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="faculty">Faculty Members</option>
            <option value="student">Students</option>
          </select>

          <select [ngModel]="selectedStatus()" (ngModelChange)="selectedStatus.set($event)" class="form-control status-select">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending Approval</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <!-- Users Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Approval</th>
              <th>Status</th>
              <th>Identifier / Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (user of filteredUsers(); track user.uid) {
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="avatar-sm" [ngClass]="user.role">
                      {{ user.displayName.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="cell-name">{{ user.displayName }}</div>
                      <div class="cell-email">{{ user.email }}</div>
                    </div>
                  </div>
                </td>

                <td>
                  <select 
                    [ngModel]="user.role" 
                    (ngModelChange)="changeRole(user, $event)" 
                    class="role-dropdown"
                    [disabled]="user.email === 'admin@eduportal.com'">
                    <option value="admin">Admin</option>
                    <option value="faculty">Faculty</option>
                    <option value="student">Student</option>
                  </select>
                </td>

                <td>
                  @if (user.approved) {
                    <span class="badge badge-success">
                      <i class="fa-solid fa-check"></i> Approved
                    </span>
                  } @else {
                    <button type="button" class="btn-approve" (click)="approveUser(user)">
                      <i class="fa-solid fa-user-check"></i> Approve
                    </button>
                  }
                </td>

                <td>
                  @if (user.status === 'active') {
                    <span class="badge badge-success">Active</span>
                  } @else if (user.status === 'pending') {
                    <span class="badge badge-warning">Pending</span>
                  } @else {
                    <span class="badge badge-danger">Suspended</span>
                  }
                </td>

                <td>
                  @if (user.role === 'student') {
                    <span class="id-tag"><i class="fa-solid fa-id-badge"></i> {{ user.rollNo || 'Pending Roll' }}</span>
                  } @else if (user.role === 'faculty') {
                    <span class="id-tag"><i class="fa-solid fa-building-columns"></i> {{ user.department || 'CSE' }}</span>
                  } @else {
                    <span class="id-tag"><i class="fa-solid fa-shield"></i> Administration</span>
                  }
                </td>

                <td>
                  <div class="actions-cell">
                    @if (user.status === 'active') {
                      <button 
                        type="button" 
                        class="btn-icon" 
                        title="Suspend User" 
                        (click)="toggleSuspend(user)"
                        [disabled]="user.email === 'admin@eduportal.com'">
                        <i class="fa-solid fa-ban text-warning"></i>
                      </button>
                    } @else {
                      <button 
                        type="button" 
                        class="btn-icon" 
                        title="Reactivate User" 
                        (click)="toggleSuspend(user)">
                        <i class="fa-solid fa-play text-success"></i>
                      </button>
                    }

                    <button 
                      type="button" 
                      class="btn-icon" 
                      title="Delete User" 
                      (click)="confirmDeleteUser(user)"
                      [disabled]="user.email === 'admin@eduportal.com'">
                      <i class="fa-solid fa-trash-can text-danger"></i>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6">
                  <div class="empty-state">
                    <i class="fa-solid fa-users-slash empty-icon"></i>
                    <h3 class="empty-title">No Users Found</h3>
                    <p class="empty-subtitle">Try adjusting your search criteria or role filters.</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal 
        [isOpen]="isDeleteModalOpen()" 
        title="Delete User Account" 
        [message]="'Are you sure you want to permanently delete user account: ' + (userToDelete()?.displayName || '') + ' (' + (userToDelete()?.email || '') + ')?'"
        confirmText="Delete Account" 
        (confirmed)="executeDeleteUser()" 
        (cancelled)="isDeleteModalOpen.set(false)">
      </app-confirm-modal>
    </div>
  `,
  styles: [`
    .users-container {
      padding: 1.5rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .page-subtitle {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-top: 0.2rem;
    }

    .total-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 260px;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .search-input {
      padding-left: 2.75rem;
    }

    .filter-group {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .role-select, .status-select {
      min-width: 150px;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .avatar-sm {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: #fff;
    }

    .avatar-sm.admin { background: #8b5cf6; }
    .avatar-sm.faculty { background: #06b6d4; }
    .avatar-sm.student { background: #10b981; }

    .cell-name {
      font-weight: 700;
      color: var(--text-primary);
    }

    .cell-email {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .role-dropdown {
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      background: var(--bg-input);
      color: var(--text-primary);
      font-size: 0.825rem;
      font-weight: 600;
    }

    .btn-approve {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.75rem;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: var(--success);
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition);
    }

    .btn-approve:hover {
      background: var(--success);
      color: #fff;
    }

    .id-tag {
      font-size: 0.825rem;
      color: var(--text-secondary);
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .actions-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .text-warning { color: var(--warning); }
    .text-success { color: var(--success); }
    .text-danger { color: var(--danger); }
  `]
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  private firestore = inject(FirestoreService);
  private toast = inject(ToastService);
  private refreshTimer: any = null;

  public users = signal<UserProfile[]>([]);
  // Use signals for filter state so computed() tracks changes reactively
  public searchQuery = signal<string>('');
  public selectedRole = signal<string>('all');
  public selectedStatus = signal<string>('all');

  public isDeleteModalOpen = signal<boolean>(false);
  public userToDelete = signal<UserProfile | null>(null);

  public filteredUsers = computed(() => {
    let list = this.users();
    const query = this.searchQuery().toLowerCase().trim();

    if (query) {
      list = list.filter(u => 
        u.displayName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.rollNo && u.rollNo.toLowerCase().includes(query))
      );
    }

    if (this.selectedRole() !== 'all') {
      list = list.filter(u => u.role === this.selectedRole());
    }

    if (this.selectedStatus() !== 'all') {
      list = list.filter(u => u.status === this.selectedStatus());
    }

    return list;
  });

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
    // Auto-reload every 4 seconds (AJAX-style)
    this.refreshTimer = setInterval(async () => {
      if (!this.isDeleteModalOpen()) {
        await this.loadUsers();
      }
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  async loadUsers(): Promise<void> {
    const data = await this.firestore.getAllUsers();
    this.users.set(data);
  }

  async approveUser(user: UserProfile): Promise<void> {
    await this.firestore.updateUserStatus(user.uid, 'active', true);
    this.toast.success(`${user.displayName} has been approved.`);
    await this.loadUsers();
  }

  async changeRole(user: UserProfile, newRole: UserRole): Promise<void> {
    if (user.role === newRole) return;
    const updated = { ...user, role: newRole };
    await this.firestore.saveUserProfile(updated);
    this.toast.success(`Role for ${user.displayName} updated to ${newRole}.`);
    await this.loadUsers();
  }

  async toggleSuspend(user: UserProfile): Promise<void> {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    await this.firestore.updateUserStatus(user.uid, nextStatus);
    this.toast.info(`Account status for ${user.displayName} set to ${nextStatus}.`);
    await this.loadUsers();
  }

  confirmDeleteUser(user: UserProfile): void {
    this.userToDelete.set(user);
    this.isDeleteModalOpen.set(true);
  }

  async executeDeleteUser(): Promise<void> {
    const user = this.userToDelete();
    if (!user) return;

    await this.firestore.deleteUser(user.uid);
    this.toast.success(`User ${user.displayName} deleted successfully.`);
    this.isDeleteModalOpen.set(false);
    this.userToDelete.set(null);
    await this.loadUsers();
  }
}
