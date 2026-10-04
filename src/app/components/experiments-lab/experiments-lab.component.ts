import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EXPERIMENTS_CATALOG, ExperimentItem } from '../../models/experiment.model';

/**
 * ====================================================================================
 * Master Lab Navigator: All 30 Syllabus Experiments Interactive Showcase
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Syllabus PDF ke har ek experiment (Exp 1 se lekar Exp 30 tak) ki complete index,
 * objective, Hindi me detailed explanation, code snippets aur live feature links
 * render karta hai.
 * 
 * [KAISE KAAM KARTA HAI?]:
 * 1. `EXPERIMENTS_CATALOG` data array se sabhi 30 experiments load hote hain.
 * 2. Unit filters (Unit 1 to 5) aur search filter provide karta hai.
 * 3. Har card me "Test Feature in Project" button diya hai jo seedha us component
 *    par navigate karta hai jisme wo experiment implement kiya gaya hai!
 */

@Component({
  selector: 'app-experiments-lab',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './experiments-lab.component.html',
  styleUrls: ['./experiments-lab.component.css']
})
export class ExperimentsLabComponent {
  experiments: ExperimentItem[] = EXPERIMENTS_CATALOG;
  selectedUnit: string = 'ALL';
  searchTerm: string = '';
  expandedSnippetId: number | null = null;

  units = ['ALL', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];

  get filteredExperiments(): ExperimentItem[] {
    return this.experiments.filter(exp => {
      const matchUnit = this.selectedUnit === 'ALL' || exp.unit === this.selectedUnit;
      const matchSearch = 
        exp.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        exp.id.toString().includes(this.searchTerm) ||
        exp.objective.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        exp.explanationHindi.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchUnit && matchSearch;
    });
  }

  toggleSnippet(id: number): void {
    this.expandedSnippetId = this.expandedSnippetId === id ? null : id;
  }
}
