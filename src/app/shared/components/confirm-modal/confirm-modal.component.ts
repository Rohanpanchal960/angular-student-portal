import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ====================================================================================
 * CONFIRMATION MODAL COMPONENT
 * ====================================================================================
 * Reusable modal for destructive actions (Delete, Suspend, Revoke) with custom titles & actions.
 */
@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="modal-overlay" (click)="onCancel()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-icon-badge" [ngClass]="iconType">
              <i [class]="iconClass"></i>
            </div>
            <div>
              <h3 class="modal-title">{{ title }}</h3>
              <p class="modal-desc">{{ message }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="onCancel()">Cancel</button>
            <button type="button" [class]="confirmBtnClass" (click)="onConfirm()">{{ confirmText }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-header {
      padding: 1.5rem;
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;
    }

    .modal-icon-badge {
      width: 48px;
      height: 48px;
      min-width: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
    }

    .modal-icon-badge.danger {
      background: var(--danger-light);
      color: var(--danger);
    }

    .modal-icon-badge.warning {
      background: var(--warning-light);
      color: var(--warning);
    }

    .modal-icon-badge.primary {
      background: var(--primary-light);
      color: var(--primary);
    }

    .modal-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.35rem;
    }

    .modal-desc {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.45;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      background: var(--bg-app);
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      border-bottom-left-radius: var(--radius-lg);
      border-bottom-right-radius: var(--radius-lg);
    }
  `]
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed? This action cannot be undone.';
  @Input() confirmText = 'Confirm';
  @Input() iconType: 'danger' | 'warning' | 'primary' = 'danger';
  @Input() iconClass = 'fa-solid fa-triangle-exclamation';
  @Input() confirmBtnClass = 'btn-danger';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
