import { Directive, ElementRef, Input, OnInit, OnChanges, SimpleChanges, Renderer2 } from '@angular/core';

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
 * 1. `@Input('appHighlightOverdue') dueDate: string` se task ki submission deadline pass hoti hai.
 * 2. `@Input() isCompleted: boolean` se check hota hai ki task submit hua ya pending hai.
 * 3. `OnChanges` hook ensure karta hai ki jab user checkbox toggle kare ya date change kare,
 *    toh real-time me red highlight add ya remove ho sake (Reactive behavior)!
 * 4. Renderer2 ka use karke DOM elements par safe cross-browser styling lagayi jaati hai.
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Students ke pending assignments, fee submissions aur exam registration deadlines ko
 * highlight karne ke liye is directive ka use student dashboard & task list me hota hai.
 */

@Directive({
  selector: '[appHighlightOverdue]',
  standalone: true
})
export class HighlightOverdueDirective implements OnInit, OnChanges {
  @Input('appHighlightOverdue') dueDate: string | Date = '';
  @Input() isCompleted: boolean = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.checkAndHighlight();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dueDate'] || changes['isCompleted']) {
      this.checkAndHighlight();
    }
  }

  private checkAndHighlight(): void {
    if (!this.dueDate || this.isCompleted) {
      // Clear highlight if completed or missing date
      this.clearHighlight();
      return;
    }

    const taskDate = new Date(this.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);

    // Agar task ki due date guzar chuki hai (overdue)
    if (taskDate.getTime() < today.getTime()) {
      this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', '#fef2f2');
      this.renderer.setStyle(this.el.nativeElement, 'borderColor', '#ef4444');
      this.renderer.setStyle(this.el.nativeElement, 'borderLeftWidth', '6px');
      this.renderer.setStyle(this.el.nativeElement, 'borderLeftStyle', 'solid');
      this.renderer.setStyle(this.el.nativeElement, 'color', '#991b1b');
      this.renderer.setStyle(this.el.nativeElement, 'boxShadow', '0 4px 14px rgba(239, 68, 68, 0.12)');
      this.renderer.setAttribute(this.el.nativeElement, 'title', '⚠️ OVERDUE TASK: Submission due date has passed!');
    } else {
      this.clearHighlight();
    }
  }

  private clearHighlight(): void {
    this.renderer.removeStyle(this.el.nativeElement, 'backgroundColor');
    this.renderer.removeStyle(this.el.nativeElement, 'borderColor');
    this.renderer.removeStyle(this.el.nativeElement, 'borderLeftWidth');
    this.renderer.removeStyle(this.el.nativeElement, 'borderLeftStyle');
    this.renderer.removeStyle(this.el.nativeElement, 'color');
    this.renderer.removeStyle(this.el.nativeElement, 'boxShadow');
    this.renderer.removeAttribute(this.el.nativeElement, 'title');
  }
}
