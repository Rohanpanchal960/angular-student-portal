import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * ====================================================================================
 * [EXPERIMENT 26] - Share a counter state between two components using a service
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Do completely alag components ke beech real-time data sharing provide karta hai.
 * Component A (Counter Controller) count ko increase/decrease/reset karta hai, aur
 * Component B (Counter Listener/Display) bagair kisi direct relation ke real-time me update hota hai.
 * 
 * [KAISE KAAM KARTA HAI?]:
 * 1. `BehaviorSubject<number>(0)` ek initial value (0) ke saath reactive state hold karta hai.
 * 2. `count$` observable banakar components ko expose kiya jaata hai jise async pipe ya .subscribe() se read kiya jaata hai.
 * 3. `increment()`, `decrement()`, aur `reset()` methods nayi value `next()` ke through emit karte hain.
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Cart count, live attendance count, ya notification badges ko navbar aur page
 * components ke beech synchronized rakhne ke liye ye pattern use hota hai.
 */

@Injectable({
  providedIn: 'root'
})
export class CounterService {
  private initialCount = 12; // e.g., 12 active student lab submissions
  private counterSubject = new BehaviorSubject<number>(this.initialCount);

  // Components can subscribe to this observable or use Angular async pipe
  public counter$: Observable<number> = this.counterSubject.asObservable();

  get currentCount(): number {
    return this.counterSubject.getValue();
  }

  increment(): void {
    const nextVal = this.counterSubject.getValue() + 1;
    this.counterSubject.next(nextVal);
  }

  decrement(): void {
    const nextVal = Math.max(0, this.counterSubject.getValue() - 1);
    this.counterSubject.next(nextVal);
  }

  reset(): void {
    this.counterSubject.next(0);
  }

  setCount(val: number): void {
    this.counterSubject.next(val);
  }
}
