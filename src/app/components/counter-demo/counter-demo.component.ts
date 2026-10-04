import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CounterService } from '../../services/counter.service';

/**
 * ====================================================================================
 * [EXPERIMENT 26] - Share a counter state between two components using a service
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Do completely independent sub-components (Component A: Controller aur Component B: Display)
 * ek hi shared `CounterService` ke zariye live sync me rehte hain.
 * 
 * [KAISE KAAM KARTA HAI?]:
 * 1. `CounterService` me `BehaviorSubject<number>` hai.
 * 2. Component A button clicks se `counterService.increment()` ya `decrement()` trigger karta hai.
 * 3. Component B `counterService.counter$ | async` ya `.subscribe()` ke through bina kisi
 *    parent-child relation ke automatically real-time me nayi count value display karta hai!
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Cart count, live active student logins count, aur unread notifications count ko
 * application ke header, sidebar aur body me synchronized rakhne ke liye use hota hai.
 */

// Sub-Component A: Counter Controller (Increments / Decrements / Resets)
@Component({
  selector: 'app-counter-controller',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sub-component-card card-controller">
      <div class="card-badge">Component A (Controller)</div>
      <h4>Controller Component</h4>
      <p>Modifies the shared counter state via <code>CounterService</code> methods.</p>
      
      <div class="btn-group">
        <button (click)="counterService.increment()" class="btn-ctrl btn-inc">
          ➕ Increment (+1)
        </button>
        <button (click)="counterService.decrement()" class="btn-ctrl btn-dec">
          ➖ Decrement (-1)
        </button>
        <button (click)="counterService.reset()" class="btn-ctrl btn-rst">
          🔄 Reset (0)
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sub-component-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
    }
    .card-badge {
      display: inline-block;
      background: #e0e7ff;
      color: #3730a3;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      margin-bottom: 0.5rem;
    }
    h4 { margin: 0 0 0.35rem 0; font-size: 1.15rem; color: #0f172a; }
    p { margin: 0 0 1.25rem 0; font-size: 0.85rem; color: #64748b; }
    .btn-group { display: flex; gap: 0.65rem; flex-wrap: wrap; }
    .btn-ctrl {
      padding: 0.65rem 1.1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-inc { background: #16a34a; color: #ffffff; }
    .btn-inc:hover { background: #15803d; }
    .btn-dec { background: #ea580c; color: #ffffff; }
    .btn-dec:hover { background: #c2410c; }
    .btn-rst { background: #64748b; color: #ffffff; }
    .btn-rst:hover { background: #475569; }
  `]
})
export class CounterControllerComponent {
  constructor(public counterService: CounterService) {}
}

// Sub-Component B: Counter Display (Listens in Real-time)
@Component({
  selector: 'app-counter-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sub-component-card card-display">
      <div class="card-badge">Component B (Real-time Listener)</div>
      <h4>Real-Time Counter Display</h4>
      <p>Passively observes <code>counter$</code> stream via <code>async</code> pipe.</p>
      
      <div class="count-display-box">
        <span class="count-label">Shared State Value:</span>
        <span class="live-counter-number">{{ counterService.counter$ | async }}</span>
        <span class="sync-status">🟢 Live Synchronized</span>
      </div>
    </div>
  `,
  styles: [`
    .sub-component-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
    }
    .card-badge {
      display: inline-block;
      background: #dcfce7;
      color: #15803d;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      margin-bottom: 0.5rem;
    }
    h4 { margin: 0 0 0.35rem 0; font-size: 1.15rem; color: #0f172a; }
    p { margin: 0 0 1.25rem 0; font-size: 0.85rem; color: #64748b; }
    .count-display-box {
      background: linear-gradient(135deg, #1e1b4b, #312e81);
      color: #ffffff;
      padding: 1.5rem;
      border-radius: 14px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }
    .count-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; }
    .live-counter-number { font-size: 3rem; font-weight: 800; line-height: 1; }
    .sync-status { font-size: 0.75rem; color: #86efac; font-weight: 600; margin-top: 0.25rem; }
  `]
})
export class CounterDisplayComponent {
  constructor(public counterService: CounterService) {}
}

// Master Wrapper Component
@Component({
  selector: 'app-counter-demo',
  standalone: true,
  imports: [CommonModule, CounterControllerComponent, CounterDisplayComponent],
  template: `
    <div class="counter-demo-page">
      <div class="demo-header">
        <div class="badges-row">
          <span class="badge-tag">Experiment 26 (Shared State Management)</span>
          <span class="badge-tag">BehaviorSubject & DI</span>
        </div>
        <h1>Shared State Between Independent Components</h1>
        <p>
          Syllabus Experiment 26: One component increments a counter and the other shows
          the updated count in real-time using an Angular Service.
        </p>
      </div>

      <div class="demo-grid">
        <app-counter-controller></app-counter-controller>
        <app-counter-display></app-counter-display>
      </div>

      <div class="architecture-note">
        <h3>💡 How Angular Service State Sharing Works</h3>
        <p>
          Unlike parent-to-child <code>&#64;Input()</code> or child-to-parent <code>&#64;Output()</code>,
          services with <code>providedIn: 'root'</code> act as a single source of truth across
          any component in the entire app regardless of hierarchy.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .counter-demo-page { display: flex; flex-direction: column; gap: 1.75rem; }
    .demo-header {
      background: #ffffff;
      padding: 1.75rem 2rem;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
    }
    .badges-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
    .badge-tag {
      background: #eef2ff;
      color: #4338ca;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      border: 1px solid #c7d2fe;
    }
    .demo-header h1 { margin: 0 0 0.35rem 0; font-size: 1.8rem; font-weight: 800; color: #0f172a; }
    .demo-header p { margin: 0; color: #64748b; font-size: 0.95rem; }
    .demo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 768px) {
      .demo-grid { grid-template-columns: 1fr; }
    }
    .architecture-note {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.5rem;
    }
    .architecture-note h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #0f172a; }
    .architecture-note p { margin: 0; font-size: 0.9rem; color: #475569; line-height: 1.5; }
    .architecture-note code { background: #e2e8f0; padding: 0.15rem 0.4rem; border-radius: 4px; }
  `]
})
export class CounterDemoComponent {}
