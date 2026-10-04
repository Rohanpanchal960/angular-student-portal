import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

/**
 * ====================================================================================
 * [EXPERIMENT 13] - Create a custom directive to highlight overdue tasks
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Ye ek custom Attribute Directive hai jiska selector `[appHighlightOverdue]` hai.
 * Ye kisi bhi task element ke DOM ko inspect karti hai aur agar `dueDate` current date se
 * pehle ki hai (overdue hai), toh use highlight karti hai.
 * 
 * [KAISE KAAM KARTA HAI?]:
 * 1. `@Input('appHighlightOverdue') dueDate: string` se task ki submission deadline pass ki jaati hai.
 * 2. `@Input() isCompleted: boolean` se check hota hai ki task submit hua ya pending hai.
 * 3. Renderer2 ka use karke DOM elements par safe styling lagayi jaati hai (soft red background,
 *    red border, overdue label/badge), Angular security best practices ke mutabiq.
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Students ke pending assignments, fee submissions aur exam registration deadlines ko
 * highlight karne ke liye is directive ka use student dashboard & task list me hota hai.
 */

@Directive({
  selector: '[appHighlightOverdue]',
  standalone: true
})
export class HighlightOverdueDirective implements OnInit {
  @Input('appHighlightOverdue') dueDate: string | Date = '';
  @Input() isCompleted: boolean = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.checkAndHighlight();
  }

  private checkAndHighlight(): void {
    if (!this.dueDate || this.isCompleted) {
      return;
    }

    const taskDate = new Date(this.dueDate);
    const today = new Date();
    // Reset hours to compare pure calendar dates
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);

    // Agar task ki due date guzar chuki hai (overdue)
    if (taskDate.getTime() < today.getTime()) {
      // Highlight in red styling
      this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', '#fef2f2');
      this.renderer.setStyle(this.el.nativeElement, 'borderColor', '#ef4444');
      this.renderer.setStyle(this.el.nativeElement, 'borderLeftWidth', '5px');
      this.renderer.setStyle(this.el.nativeElement, 'borderLeftStyle', 'solid');
      this.renderer.setStyle(this.el.nativeElement, 'color', '#991b1b');
      this.renderer.setAttribute(this.el.nativeElement, 'title', '⚠️ OVERDUE TASK: Due date has passed!');
    }
  }
}
