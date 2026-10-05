import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CounterService } from '../../services/counter.service';

/**
 * ====================================================================================
 * [EXPERIMENT 26] - Share a counter state between two components using a service
 * [UNIT 4 SYLLABUS] - Component State vs Application State & Angular Signals
 * ====================================================================================
 */

// Sub-Component A: Counter Controller (Modifies Shared Service State)
@Component({
  selector: 'app-counter-controller',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sub-component-card card-controller">
      <div class="card-badge badge-ctrl">Component A (Controller)</div>
      <h4>Controller Component</h4>
      <p>Modifies the shared counter state via <code>CounterService</code> methods.</p>
      
      <div class="btn-group">
        <button (click)="counterService.increment()" class="btn-ctrl btn-inc">
          <i class="fa-solid fa-plus me-1"></i> Increment (+1)
        </button>
        <button (click)="counterService.decrement()" class="btn-ctrl btn-dec">
          <i class="fa-solid fa-minus me-1"></i> Decrement (-1)
        </button>
        <button (click)="counterService.reset()" class="btn-ctrl btn-rst">
          <i class="fa-solid fa-arrows-rotate me-1"></i> Reset (0)
        </button>
      </div>

      <div class="action-status-pill">
        <span>Current Action Target: <strong>CounterService Singleton</strong></span>
      </div>
    </div>
  `,
  styles: [`
    .sub-component-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.75rem;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .card-badge {
      display: inline-block;
      font-size: 0.76rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      margin-bottom: 0.75rem;
      width: fit-content;
    }
    .badge-ctrl {
      background: #e0e7ff;
      color: #3730a3;
      border: 1px solid #c7d2fe;
    }
    h4 { margin: 0 0 0.4rem 0; font-size: 1.25rem; color: #0f172a; font-weight: 700; }
    p { margin: 0 0 1.25rem 0; font-size: 0.88rem; color: #64748b; line-height: 1.5; }
    .btn-group { display: flex; gap: 0.65rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
    .btn-ctrl {
      padding: 0.75rem 1.2rem;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      display: inline-flex;
      align-items: center;
    }
    .btn-ctrl:hover { transform: translateY(-2px); }
    .btn-ctrl:active { transform: translateY(1px); }
    .btn-inc { background: #16a34a; color: #ffffff; }
    .btn-inc:hover { background: #15803d; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3); }
    .btn-dec { background: #ea580c; color: #ffffff; }
    .btn-dec:hover { background: #c2410c; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3); }
    .btn-rst { background: #475569; color: #ffffff; }
    .btn-rst:hover { background: #334155; }
    .action-status-pill {
      margin-top: auto;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      padding: 0.6rem 0.9rem;
      border-radius: 10px;
      font-size: 0.8rem;
      color: #475569;
    }
  `]
})
export class CounterControllerComponent {
  constructor(public counterService: CounterService) {}
}

// Sub-Component B: Counter Display (Observes Shared State in Real-time)
@Component({
  selector: 'app-counter-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sub-component-card card-display">
      <div class="card-badge badge-disp">Component B (Real-time Observer)</div>
      <h4>Real-Time Counter Display</h4>
      <p>Subscribes to <code>counter$</code> stream via <code>async</code> pipe.</p>
      
      <div class="count-display-box">
        <span class="count-label">Shared State Counter:</span>
        <div class="live-counter-number">{{ counterService.counter$ | async }}</div>
        <span class="sync-status">
          <i class="fa-solid fa-circle-check me-1 text-success"></i> Live Synchronized across Portal
        </span>
      </div>

      <div class="signals-preview-box">
        <div class="signal-tag">Reactive Signal State:</div>
        <div class="signal-metrics">
          <span>Signal Value: <strong>{{ counterService.signalCount() }}</strong></span>
          <span>Computed (x2): <strong>{{ counterService.doubleCount() }}</strong></span>
          <span>Parity: <strong>{{ counterService.isEven() ? 'Even' : 'Odd' }}</strong></span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sub-component-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.75rem;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .card-badge {
      display: inline-block;
      font-size: 0.76rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      margin-bottom: 0.75rem;
      width: fit-content;
    }
    .badge-disp {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }
    h4 { margin: 0 0 0.4rem 0; font-size: 1.25rem; color: #0f172a; font-weight: 700; }
    p { margin: 0 0 1.25rem 0; font-size: 0.88rem; color: #64748b; line-height: 1.5; }
    .count-display-box {
      background: linear-gradient(135deg, #0f172a, #1e1b4b);
      color: #ffffff;
      padding: 1.5rem;
      border-radius: 14px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.25);
      margin-bottom: 1rem;
    }
    .count-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85; font-weight: 700; }
    .live-counter-number { font-size: 3.5rem; font-weight: 900; line-height: 1; color: #38bdf8; text-shadow: 0 0 20px rgba(56, 189, 248, 0.3); }
    .sync-status { font-size: 0.78rem; color: #4ade80; font-weight: 600; margin-top: 0.25rem; }
    .signals-preview-box {
      margin-top: auto;
      background: #f0fdf4;
      border: 1.5px solid #bbf7d0;
      border-radius: 12px;
      padding: 0.85rem 1rem;
    }
    .signal-tag { font-size: 0.75rem; font-weight: 800; color: #15803d; text-transform: uppercase; margin-bottom: 0.35rem; }
    .signal-metrics { display: flex; justify-content: space-between; gap: 0.5rem; font-size: 0.82rem; color: #166534; flex-wrap: wrap; }
    .signal-metrics strong { color: #0f172a; }
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
        <h1>Shared State Between Independent Components</h1>
        <p>
          One component updates the counter state and the other displays 
          the updated count in real-time across the portal using an Angular Service with RxJS and Angular Signals.
        </p>
      </div>

      <div class="demo-grid">
        <app-counter-controller></app-counter-controller>
        <app-counter-display></app-counter-display>
      </div>

      <!-- State Management Comparison Table -->
      <div class="state-comparison-card">
        <h3><i class="fa-solid fa-code-compare me-2"></i> State Management: RxJS BehaviorSubject vs Angular Signals</h3>
        <div class="table-responsive">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Feature / Dimension</th>
                <th>RxJS BehaviorSubject</th>
                <th>Angular Signals</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Type of Primitive</strong></td>
                <td>Push-based Observable stream</td>
                <td>Synchronous reactive getter / value wrapper</td>
              </tr>
              <tr>
                <td><strong>Reading Values</strong></td>
                <td>Requires <code>.subscribe()</code> or <code>| async</code> pipe</td>
                <td>Direct function call: <code>signalCount()</code></td>
              </tr>
              <tr>
                <td><strong>Derived Values</strong></td>
                <td>RxJS operators (<code>map</code>, <code>filter</code>)</td>
                <td><code>computed(() => val() * 2)</code> with automatic dependency tracking</td>
              </tr>
              <tr>
                <td><strong>Change Detection</strong></td>
                <td>Triggers zone-based component re-render</td>
                <td>Fine-grained, signal-based reactive re-render</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .counter-demo-page { display: flex; flex-direction: column; gap: 2rem; max-width: 1200px; margin: 0 auto; }
    .demo-header {
      background: #ffffff;
      padding: 2.25rem;
      border-radius: 20px;
      border: 1.5px solid #e2e8f0;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
    }
    .badges-row { display: flex; gap: 0.5rem; margin-bottom: 0.65rem; flex-wrap: wrap; }
    .badge-tag {
      background: #eef2ff;
      color: #4338ca;
      font-size: 0.76rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      border: 1px solid #c7d2fe;
    }
    .demo-header h1 { margin: 0 0 0.45rem 0; font-size: 2rem; font-weight: 800; color: #0f172a; }
    .demo-header p { margin: 0; color: #64748b; font-size: 0.95rem; line-height: 1.6; }
    .demo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.75rem;
    }
    @media (max-width: 820px) {
      .demo-grid { grid-template-columns: 1fr; }
    }
    .state-comparison-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
    }
    .state-comparison-card h3 { margin: 0 0 1.25rem 0; font-size: 1.25rem; color: #0f172a; }
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    .comparison-table th, .comparison-table td {
      padding: 0.9rem 1rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .comparison-table th {
      background: #f8fafc;
      color: #334155;
      font-weight: 700;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .comparison-table td strong { color: #0f172a; }
  `]
})
export class CounterDemoComponent {}
