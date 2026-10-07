import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ====================================================================================
 * STAT CARD COMPONENT
 * ====================================================================================
 * Displays key analytical metrics, icons, badges, and contextual trends.
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card glass-card">
      <div class="stat-info">
        <div class="stat-label">{{ label }}</div>
        <div class="stat-val">{{ value }}</div>
        @if (subtext) {
          <div class="stat-subtext" [ngClass]="subtextClass">
            @if (trendIcon) {
              <i [class]="trendIcon"></i>
            }
            {{ subtext }}
          </div>
        }
      </div>
      <div class="stat-icon-wrapper" [style.background]="iconBg" [style.color]="iconColor">
        <i [class]="icon"></i>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      padding: 1.4rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stat-label {
      font-size: 0.825rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.35rem;
    }

    .stat-val {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1.1;
      letter-spacing: -0.02em;
    }

    .stat-subtext {
      font-size: 0.775rem;
      font-weight: 500;
      margin-top: 0.45rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      color: var(--text-secondary);
    }

    .stat-subtext.positive { color: var(--success); }
    .stat-subtext.negative { color: var(--danger); }
    .stat-subtext.warning { color: var(--warning); }

    .stat-icon-wrapper {
      width: 54px;
      height: 54px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
  `]
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input({ required: true }) icon!: string;
  @Input() iconBg = 'var(--primary-light)';
  @Input() iconColor = 'var(--primary)';
  @Input() subtext?: string;
  @Input() subtextClass = '';
  @Input() trendIcon?: string;
}
