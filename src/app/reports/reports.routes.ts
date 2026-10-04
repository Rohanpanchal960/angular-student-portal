import { Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';

/**
 * ====================================================================================
 * [EXPERIMENT 29] - Reports Lazy-Loaded Routes Configuration
 * ====================================================================================
 * 
 * Ye routes array lazy-loaded bundle ke through dynamic import hota hai:
 * `loadChildren: () => import('./reports/reports.routes').then(m => m.REPORTS_ROUTES)`
 */
export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    component: ReportsComponent
  }
];
