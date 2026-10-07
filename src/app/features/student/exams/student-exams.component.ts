import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { ExamTimetable } from '../../../core/models';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * ====================================================================================
 * STUDENT EXAM TIMETABLE & OFFICIAL ADMIT CARD COMPONENT
 * ====================================================================================
 * Displays upcoming examination dates, session timings, and examination hall numbers.
 * Includes instant PDF Admit Card generation with student roll number, candidate info,
 * and examination regulations.
 */
@Component({
  selector: 'app-student-exams',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="exams-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Examination Schedule & Hall Ticket</h1>
          <p class="page-subtitle">Autumn 2026 End-Semester Examinations Timetable and Admit Card</p>
        </div>
        <button type="button" class="gradient-btn" (click)="downloadAdmitCardPdf()">
          <i class="fa-solid fa-id-card"></i>
          <span>Download Official Admit Card (PDF)</span>
        </button>
      </div>

      <!-- Timetable Cards Grid -->
      <div class="exam-cards-grid">
        @for (ex of exams(); track ex.id) {
          <div class="exam-card glass-card">
            <div class="card-date-badge">
              <span class="day">{{ ex.date | date:'dd' }}</span>
              <span class="month">{{ ex.date | date:'MMM yyyy' }}</span>
            </div>

            <div class="card-info">
              <div class="code-row">
                <span class="subj-code">{{ ex.subjectCode }}</span>
                <span class="room-pill"><i class="fa-solid fa-door-open"></i> {{ ex.roomNo }}</span>
              </div>

              <h3 class="subj-title">{{ ex.subjectName }}</h3>
              <p class="exam-name">{{ ex.examName }}</p>

              <div class="meta-timing">
                <i class="fa-regular fa-clock"></i>
                <span>{{ ex.startTime }} - {{ ex.endTime }}</span>
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state glass-card">
            <i class="fa-solid fa-calendar-xmark empty-icon"></i>
            <h3 class="empty-title">No Examinations Scheduled</h3>
            <p class="empty-subtitle">Check back later once the academic office publishes the semester timetable.</p>
          </div>
        }
      </div>

      <!-- Exam Regulations Notice Box -->
      <div class="guidelines-card glass-card">
        <h3><i class="fa-solid fa-circle-exclamation text-warning"></i> Examination Rules & Instructions</h3>
        <ul>
          <li>Candidates must produce the printed <strong>Admit Card / Hall Ticket</strong> and official University Student ID at the entrance of the examination hall.</li>
          <li>Reporting time is strictly 30 minutes prior to the commencement of the exam. No candidate will be admitted 15 minutes after session start.</li>
          <li>Electronic devices including smartphones, smartwatches, and programmable calculators are strictly prohibited.</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .exams-page {
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

    .exam-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .exam-card {
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      display: flex;
      gap: 1.25rem;
    }

    .card-date-badge {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-md);
      background: var(--primary-gradient);
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      line-height: 1.1;
      box-shadow: 0 4px 14px var(--primary-glow);
    }

    .card-date-badge .day {
      font-size: 1.4rem;
      font-weight: 900;
    }

    .card-date-badge .month {
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .card-info {
      flex: 1;
    }

    .code-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.35rem;
    }

    .subj-code {
      font-family: 'Fira Code', monospace;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--primary);
    }

    .room-pill {
      font-size: 0.775rem;
      font-weight: 600;
      color: var(--text-secondary);
      background: var(--bg-hover);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
    }

    .subj-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .exam-name {
      font-size: 0.825rem;
      color: var(--text-muted);
      margin-top: 0.15rem;
      margin-bottom: 0.75rem;
    }

    .meta-timing {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .guidelines-card {
      padding: 1.5rem 2rem;
      border-radius: var(--radius-lg);
    }

    .guidelines-card h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .guidelines-card ul {
      padding-left: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }
  `]
})
export class StudentExamsComponent implements OnInit {
  public auth = inject(AuthService);
  private firestore = inject(FirestoreService);
  private toast = inject(ToastService);

  public exams = signal<ExamTimetable[]>([]);

  async ngOnInit(): Promise<void> {
    const list = await this.firestore.getExamTimetables();
    this.exams.set(list);
  }

  downloadAdmitCardPdf(): void {
    const user = this.auth.userProfile();
    const doc = new jsPDF();

    // Border around Admit Card
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(1.5);
    doc.rect(8, 8, 194, 281);

    // Header Header Banner
    doc.setFillColor(79, 70, 229);
    doc.rect(10, 10, 190, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUPORTAL UNIVERSITY OF TECHNOLOGY', 105, 23, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL EXAMINATION HALL TICKET / ADMIT CARD', 105, 33, { align: 'center' });

    // Candidate Details
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);

    const name = user?.displayName || 'Student Candidate';
    const roll = user?.rollNo || '2026-CS-001';
    const course = user?.courseName || 'B.Tech Computer Science & Engineering';
    const sem = user?.semester || 5;

    doc.setFont('helvetica', 'bold');
    doc.text('CANDIDATE INFORMATION', 14, 50);
    doc.setFont('helvetica', 'normal');

    doc.text(`Candidate Name: ${name}`, 14, 58);
    doc.text(`Roll Number: ${roll}`, 14, 65);
    doc.text(`Course: ${course}`, 110, 58);
    doc.text(`Semester: Semester ${sem}`, 110, 65);

    // Timetable Schedule Table
    const tableData = this.exams().map(e => [
      e.date,
      e.subjectCode,
      e.subjectName,
      `${e.startTime} - ${e.endTime}`,
      e.roomNo
    ]);

    autoTable(doc, {
      startY: 74,
      head: [['Exam Date', 'Code', 'Subject Title', 'Session Timing', 'Room / Hall']],
      body: tableData,
      headStyles: { fillColor: [79, 70, 229] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;

    // Instructions Box
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('EXAMINATION REGULATIONS FOR CANDIDATES:', 14, finalY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('1. Entry into examination hall requires this printed Admit Card and university identity badge.', 14, finalY + 7);
    doc.text('2. Mobile phones, smart devices, and electronic material are strictly banned.', 14, finalY + 13);
    doc.text('3. Candidates arriving more than 15 minutes late will not be permitted.', 14, finalY + 19);

    // Signature Area
    doc.setFontSize(9);
    doc.text('Candidate Signature', 14, finalY + 45);
    doc.text('Controller of Examinations', 135, finalY + 45);
    doc.line(14, finalY + 40, 65, finalY + 40);
    doc.line(135, finalY + 40, 190, finalY + 40);

    doc.save(`EduPortal_AdmitCard_${roll}.pdf`);
    this.toast.success('Official Admit Card PDF downloaded!');
  }
}
