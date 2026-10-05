import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * ====================================================================================
 * [EXPERIMENT 18] - Contact Component (Routing between Home, About, Contact)
 * ====================================================================================
 */

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contact-page">
      <div class="contact-header">
        <span class="badge-tag">Experiment 18 • Contact</span>
        <h1>Department of Computer Applications Support</h1>
        <p>Get in touch with the university academic coordinator or lab administrator.</p>
      </div>

      <div class="contact-grid">
        <div class="info-card">
          <h3>Campus Information</h3>
          <div class="info-item">
            <span><i class="fa-solid fa-location-dot"></i> Address:</span>
            <p>University Campus, Department of Computer Science, Academic Block A, 3rd Floor</p>
          </div>
          <div class="info-item">
            <span><i class="fa-solid fa-envelope"></i> Email:</span>
            <p>support&#64;university-sms.edu</p>
          </div>
          <div class="info-item">
            <span><i class="fa-solid fa-phone"></i> Helpline:</span>
            <p>+91 (079) 2630-1234 / Ext 402</p>
          </div>
          <div class="info-item">
            <span><i class="fa-solid fa-clock"></i> Office Hours:</span>
            <p>Monday - Friday: 9:00 AM - 5:30 PM</p>
          </div>
        </div>

        <div class="form-card">
          <h3>Send an Academic Inquiry</h3>
          <form (ngSubmit)="sendMessage()" class="inquiry-form">
            <div *ngIf="sentMessage" class="alert-success">
              <i class="fa-solid fa-circle-check"></i> {{ sentMessage }}
            </div>
            <div class="form-field">
              <label>Your Name</label>
              <input type="text" [(ngModel)]="name" name="name" required class="form-input" placeholder="Full Name" />
            </div>
            <div class="form-field">
              <label>Your Email</label>
              <input type="email" [(ngModel)]="email" name="email" required class="form-input" placeholder="email@example.com" />
            </div>
            <div class="form-field">
              <label>Message / Query</label>
              <textarea [(ngModel)]="msg" name="msg" required rows="3" class="form-input" placeholder="Write your inquiry here..."></textarea>
            </div>
            <button type="submit" class="btn-send">
              <i class="fa-solid fa-paper-plane"></i> Send Inquiry Message
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-page { display: flex; flex-direction: column; gap: 2rem; }
    .contact-header {
      background: #ffffff;
      padding: 2rem;
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
    .contact-header h1 { margin: 0 0 0.5rem 0; font-size: 1.85rem; color: #0f172a; }
    .contact-header p { margin: 0; color: #64748b; font-size: 0.95rem; }
    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 768px) {
      .contact-grid { grid-template-columns: 1fr; }
      .contact-header { padding: 1.25rem; }
      .contact-header h1 { font-size: 1.4rem; }
      .info-card, .form-card { padding: 1.25rem !important; }
    }
    .info-card, .form-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
    }
    .info-card h3, .form-card h3 { margin: 0 0 1.25rem 0; font-size: 1.25rem; color: #0f172a; }
    .info-item { margin-bottom: 1rem; }
    .info-item span {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 700;
      font-size: 0.82rem;
      color: #4f46e5;
      text-transform: uppercase;
    }
    .info-item p { margin: 0.2rem 0 0 0; font-size: 0.95rem; color: #334155; }
    .inquiry-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-field label { font-size: 0.82rem; font-weight: 700; color: #334155; }
    .form-input { padding: 0.7rem 0.95rem; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 0.9rem; outline: none; }
    .form-input:focus { border-color: #6366f1; }
    .btn-send {
      background: #4f46e5;
      color: #ffffff;
      border: none;
      padding: 0.8rem;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.2s ease;
    }
    .btn-send:hover { background: #4338ca; }
    .alert-success {
      background: #dcfce7;
      color: #15803d;
      padding: 0.75rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class ContactComponent {
  name: string = '';
  email: string = '';
  msg: string = '';
  sentMessage: string | null = null;

  sendMessage(): void {
    if (this.name && this.email) {
      this.sentMessage = `Thank you ${this.name}! Your message has been routed to the department coordinator.`;
      this.name = '';
      this.email = '';
      this.msg = '';
      setTimeout(() => { this.sentMessage = null; }, 5000);
    }
  }
}
