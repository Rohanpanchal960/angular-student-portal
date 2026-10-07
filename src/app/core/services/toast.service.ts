import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

/**
 * ====================================================================================
 * TOAST NOTIFICATION SERVICE (Angular 18 Signals)
 * ====================================================================================
 * Provides reactive toast notifications across the entire EduPortal.
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  public toasts = signal<ToastMessage[]>([]);

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string, duration: number = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message, duration };

    this.toasts.update(current => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, title: string = 'Success') {
    this.show(message, 'success', title);
  }

  error(message: string, title: string = 'Error') {
    this.show(message, 'error', title, 5000);
  }

  warning(message: string, title: string = 'Notice') {
    this.show(message, 'warning', title);
  }

  info(message: string, title: string = 'Information') {
    this.show(message, 'info', title);
  }

  remove(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
