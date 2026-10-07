import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

/**
 * ====================================================================================
 * TOAST NOTIFICATION CONTAINER COMPONENT
 * ====================================================================================
 * Floating alert messages with animated entrance and manual dismiss buttons.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [ngClass]="'toast-' + toast.type">
          <div class="toast-icon">
            @if (toast.type === 'success') {
              <i class="fa-solid fa-circle-check"></i>
            } @else if (toast.type === 'error') {
              <i class="fa-solid fa-circle-exclamation"></i>
            } @else if (toast.type === 'warning') {
              <i class="fa-solid fa-triangle-exclamation"></i>
            } @else {
              <i class="fa-solid fa-circle-info"></i>
            }
          </div>
          <div class="toast-body">
            @if (toast.title) {
              <div class="toast-title">{{ toast.title }}</div>
            }
            <div class="toast-msg">{{ toast.message }}</div>
          </div>
          <button class="toast-close" (click)="toastService.remove(toast.id)" aria-label="Dismiss toast">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 420px;
      width: calc(100% - 3rem);
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 1rem 1.25rem;
      background: var(--bg-card);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--border-color);
      animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transition: all 0.2s ease;
    }

    .toast-icon {
      font-size: 1.25rem;
      margin-top: 0.1rem;
    }

    .toast-body {
      flex: 1;
    }

    .toast-title {
      font-weight: 700;
      font-size: 0.9rem;
      margin-bottom: 0.2rem;
    }

    .toast-msg {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 1rem;
      padding: 0.2rem;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast-close:hover {
      color: var(--text-primary);
    }

    .toast-success { border-left: 4px solid var(--success); }
    .toast-success .toast-icon { color: var(--success); }

    .toast-error { border-left: 4px solid var(--danger); }
    .toast-error .toast-icon { color: var(--danger); }

    .toast-warning { border-left: 4px solid var(--warning); }
    .toast-warning .toast-icon { color: var(--warning); }

    .toast-info { border-left: 4px solid var(--info); }
    .toast-info .toast-icon { color: var(--info); }

    @keyframes toastSlideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  public toastService = inject(ToastService);
}
