import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * ====================================================================================
 * [EXPERIMENT 26] - Share a counter state between two components using a service
 * [UNIT 4 SYLLABUS] - State Management Basics & Angular Signals (Overview & Live Demo)
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Do tarah ka state management provide karta hai:
 * 1. Traditional RxJS BehaviorSubject<number> (Exp 26): Observables & async pipe stream.
 * 2. Modern Angular 18 Signals: `signal()`, `computed()` reactive primitives (Unit 4 syllabus).
 * 
 * [KAISE KAAM KARTA HAI?]:
 * - Jab bhi counter badalta hai, RxJS stream aur Angular Signal dono update hote hain.
 * - Components bina kisi parent-child hierarchy ke, instant real-time synchronization me rehte hain.
 */

@Injectable({
  providedIn: 'root'
})
export class CounterService {
  private initialCount = 12; // e.g., 12 active student submissions
  private counterSubject = new BehaviorSubject<number>(this.initialCount);

  // RxJS Stream for Exp 26
  public counter$: Observable<number> = this.counterSubject.asObservable();

  // Angular 18 Signals for Unit 4 State Management Syllabus
  public signalCount = signal<number>(this.initialCount);
  public doubleCount = computed(() => this.signalCount() * 2);
  public isEven = computed(() => this.signalCount() % 2 === 0);

  get currentCount(): number {
    return this.counterSubject.getValue();
  }

  increment(): void {
    const nextVal = this.counterSubject.getValue() + 1;
    this.counterSubject.next(nextVal);
    this.signalCount.set(nextVal);
  }

  decrement(): void {
    const nextVal = Math.max(0, this.counterSubject.getValue() - 1);
    this.counterSubject.next(nextVal);
    this.signalCount.set(nextVal);
  }

  reset(): void {
    this.counterSubject.next(0);
    this.signalCount.set(0);
  }

  setCount(val: number): void {
    this.counterSubject.next(val);
    this.signalCount.set(val);
  }
}
