import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { MarksRecord, SemesterResultSheet } from '../../../core/models';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * ====================================================================================
 * STUDENT MARKS & OFFICIAL GRADE SHEET COMPONENT
 * ====================================================================================
 * Allows students to review verified, published scores across all course modules,
 * see semester SGPA and grade point averages, and download an official printable PDF marksheet.
 */
@Component({
  selector: 'app-student-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="results-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Academic Results & Grade Sheet</h1>
          <p class="page-subtitle">Official verified marks, credit point accumulations, and semester report card</p>
        </div>
        <button type="button" class="gradient-btn" (click)="downloadPdfMarksheet()">
          <i class="fa-solid fa-file-arrow-down"></i>
          <span>Download Official Marksheet (PDF)</span>
        </button>
      </div>

      <!-- Semester Summary Card -->
      <div class="summary-banner glass-card">
        <div class="student-meta">
          <div class="meta-item">
            <span class="label">Student Name:</span>
            <strong>{{ auth.userProfile()?.displayName }}</strong>
          </div>
          <div class="meta-item">
            <span class="label">Roll Number:</span>
            <strong class="font-code text-primary">{{ auth.userProfile()?.rollNo || 'Pending' }}</strong>
          </div>
          <div class="meta-item">
            <span class="label">Degree Program:</span>
            <strong>{{ auth.userProfile()?.courseName || 'Curriculum Course' }}</strong>
          </div>
          <div class="meta-item">
            <span class="label">Academic Term:</span>
            <strong>Semester {{ auth.userProfile()?.semester || 1 }} (Academic Session 2026)</strong>
          </div>
        </div>

        <div class="sgpa-highlight">
          <div class="sgpa-badge">
            <span class="sgpa-label">SEMESTER SGPA</span>
            <span class="sgpa-val">{{ calculatedSgpa() }}</span>
            <span class="sgpa-scale">out of 10.0</span>
          </div>
          <div class="status-pill" [class.status-pass]="calculatedStatus() === 'PASS'">
            <i class="fa-solid fa-award"></i> {{ calculatedStatus() }}
          </div>
        </div>
      </div>

      <!-- Detailed Subject-Wise Marks Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Assessment Title</th>
              <th>Subject</th>
              <th>Assessment Type</th>
              <th>Marks Secured</th>
              <th>Percentage</th>
              <th>Letter Grade</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            @for (m of publishedMarks(); track m.id) {
              <tr>
                <td><strong>{{ m.assessmentTitle }}</strong></td>
                <td>{{ m.subjectName }}</td>
                <td><span class="badge badge-info">{{ m.assessmentType }}</span></td>
                <td><strong>{{ m.marksObtained }}</strong> / {{ m.maxMarks }}</td>
                <td>{{ m.percentage }}%</td>
                <td>
                  <span class="badge" [ngClass]="getGradeBadge(m.grade)">
                    {{ m.grade }}
                  </span>
                </td>
                <td><span class="text-muted">{{ m.remarks || 'Verified' }}</span></td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7">
                  <div class="empty-state">
                    <i class="fa-solid fa-graduation-cap empty-icon"></i>
                    <h3 class="empty-title">No Published Results Available</h3>
                    <p class="empty-subtitle">Scores are visible once authorized and published by academic faculty.</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .results-page {
      padding: 1.5rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
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

    .summary-banner {
      padding: 1.75rem 2rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: var(--radius-lg);
      flex-wrap: wrap;
      gap: 1.5rem;
      border: 1px solid var(--border-color);
    }

    .student-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem 2rem;
    }

    @media (max-width: 768px) {
      .student-meta {
        grid-template-columns: 1fr;
      }
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .label {
      font-size: 0.775rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .font-code {
      font-family: 'Fira Code', monospace;
    }

    .sgpa-highlight {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.65rem;
    }

    .sgpa-badge {
      background: var(--primary-gradient);
      color: #fff;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 8px 24px var(--primary-glow);
    }

    .sgpa-label {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      opacity: 0.9;
    }

    .sgpa-val {
      font-size: 2.2rem;
      font-weight: 900;
      line-height: 1.1;
      margin: 0.2rem 0;
    }

    .sgpa-scale {
      font-size: 0.7rem;
      opacity: 0.85;
    }

    .status-pill {
      font-weight: 800;
      font-size: 0.85rem;
      letter-spacing: 0.05em;
      color: var(--success);
    }
  `]
})
export class StudentResultsComponent implements OnInit, OnDestroy {
  public auth = inject(AuthService);
  private firestore = inject(FirestoreService);
  private toast = inject(ToastService);
  private refreshTimer: any = null;

  public publishedMarks = signal<MarksRecord[]>([]);
  public resultSheet = signal<SemesterResultSheet | null>(null);

  public calculatedSgpa = computed(() => {
    if (this.resultSheet()) return this.resultSheet()!.sgpa.toFixed(2);
    const marks = this.publishedMarks();
    if (marks.length === 0) return '0.00';
    const avgPct = marks.reduce((sum, m) => sum + m.percentage, 0) / marks.length;
    return (avgPct / 10).toFixed(2);
  });

  public calculatedStatus = computed(() => {
    if (this.resultSheet()) return this.resultSheet()!.status;
    const marks = this.publishedMarks();
    if (marks.length === 0) return 'PENDING';
    const hasFail = marks.some(m => m.percentage < 40);
    return hasFail ? 'BACKLOG' : 'PASS';
  });

  async ngOnInit(): Promise<void> {
    await this.loadResults();

    // AJAX-style background auto-refresh every 4 seconds
    this.refreshTimer = setInterval(async () => {
      await this.loadResults();
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  async loadResults(): Promise<void> {
    const user = this.auth.userProfile();
    if (!user) return;

    // Fetch published marks for student
    const marks = await this.firestore.getMarksForStudent(user.uid, true);
    this.publishedMarks.set(marks);

    // Fetch compiled semester sheet
    const sheet = await this.firestore.getStudentResultSheet(user.uid);
    this.resultSheet.set(sheet);
  }

  getGradeBadge(grade: string): string {
    if (grade === 'A+' || grade === 'A') return 'badge-success';
    if (grade === 'B') return 'badge-info';
    if (grade === 'C') return 'badge-warning';
    return 'badge-danger';
  }

  downloadPdfMarksheet(): void {
    const user = this.auth.userProfile();
    const sheet = this.resultSheet();
    const marks = this.publishedMarks();

    const doc = new jsPDF();

    // Institutional Banner Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUPORTAL UNIVERSITY OF TECHNOLOGY', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL TRANSCRIPT OF ACADEMIC RECORD • AUTUMN 2026', 14, 28);

    // Student Information Block
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);

    const name = user?.displayName || 'Student';
    const roll = user?.rollNo || '2026-CS-001';
    const course = user?.courseName || 'B.Tech Computer Science & Engineering';
    const sem = user?.semester || 5;

    doc.text(`Student Name: ${name}`, 14, 46);
    doc.text(`Roll Number: ${roll}`, 14, 53);
    doc.text(`Course: ${course}`, 110, 46);
    doc.text(`Semester: Semester ${sem} (Academic Year 2025-26)`, 110, 53);

    // Marks Table
    const tableData = marks.map(m => [
      m.subjectName,
      m.assessmentTitle,
      m.assessmentType,
      `${m.marksObtained} / ${m.maxMarks}`,
      `${m.percentage}%`,
      m.grade,
      m.percentage >= 40 ? 'PASS' : 'FAIL'
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['Subject Name', 'Assessment', 'Type', 'Score', 'Percentage', 'Grade', 'Result']],
      body: tableData,
      headStyles: { fillColor: [79, 70, 229] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;

    // Summary Box
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Semester Grade Point Average (SGPA): ${this.calculatedSgpa()} / 10.00`, 14, finalY);
    doc.text(`Overall Result Status: ${this.calculatedStatus()}`, 14, finalY + 7);

    // Signature Seals
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Controller of Examinations', 140, finalY + 25);
    doc.text('Registrar / Dean of Academics', 14, finalY + 25);
    doc.line(14, finalY + 20, 70, finalY + 20);
    doc.line(140, finalY + 20, 195, finalY + 20);

    doc.save(`EduPortal_Marksheet_${roll}.pdf`);
    this.toast.success('Official PDF Marksheet downloaded successfully!');
  }
}
