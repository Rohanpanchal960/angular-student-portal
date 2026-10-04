import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, SAMPLE_PRODUCTS } from '../../models/product.model';
import { Course, COURSE_LIST, COURSE_DETAILS_DATA } from '../../models/course.enum';
import { CounterService } from '../../services/counter.service';

/**
 * ====================================================================================
 * [EXPERIMENT 4] - Interface to define a product structure
 * [EXPERIMENT 5] - Enums & arrays in TypeScript to display course categories
 * [EXPERIMENT 9] - Product list using event binding (click) and "Buy Now" button
 * [EXPERIMENT 11] - Built-in pipes: Currency Pipe (₹ 1200) & Date Pipe (01/05/2025)
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Ye College Campus Stationery & Course Study Material Store hai:
 * 1. Exp 4: `Product` interface se defined catalog `{ id: 1, name: 'Mouse', price: 299, category: 'Electronics' }`.
 * 2. Exp 5: `Course` enum aur `COURSE_LIST` array se course category dropdown populate hoti hai.
 * 3. Exp 9: Har product ke paas `(click)="onBuyProduct(product)"` event binding hai jo purchase toast dikhata hai.
 * 4. Exp 11: Prices ko `{{ product.price | currency:'INR':'symbol':'1.0-0' }}` se Indian Rupee ₹ format
 *    me aur releaseDate ko `{{ product.releaseDate | date:'dd/MM/yyyy' }}` format me convert karta hai.
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Students apne courses (BCA, MCA, etc.) ke mutabiq recommended reference books,
 * electronics kits aur lab supplies order kar sakte hain.
 */

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent {
  // [EXPERIMENT 4]: Product list based on Product interface
  products: Product[] = SAMPLE_PRODUCTS;

  // [EXPERIMENT 5]: Enum courses array for dropdown menu
  courses = COURSE_LIST;
  selectedCourse: Course = Course.MCA;
  courseDetailsData = COURSE_DETAILS_DATA;

  selectedCategory: string = 'ALL';
  categories: string[] = ['ALL', 'Electronics', 'Books'];

  // [EXPERIMENT 9]: Toast message for event binding click response
  toastMessage: string | null = null;
  purchasedCount: number = 0;

  constructor(public counterService: CounterService) {}

  get currentCourseDetails() {
    return this.courseDetailsData[this.selectedCourse];
  }

  get filteredProducts(): Product[] {
    if (this.selectedCategory === 'ALL') {
      return this.products;
    }
    return this.products.filter(p => p.category === this.selectedCategory);
  }

  /**
   * [EXPERIMENT 9 METHOD]:
   * Triggered by (click) event binding on "Buy Now" button
   */
  onBuyProduct(product: Product): void {
    this.purchasedCount++;
    // Shared state counter increment (Exp 26)
    this.counterService.increment();

    // Log product name in console as required in syllabus
    console.log(`[EXPERIMENT 9 EVENT LOG]: Student clicked Buy Now for product -> ${product.name} (ID: ${product.id}, Price: ₹${product.price})`);

    // Show on-screen user confirmation toast
    this.toastMessage = `🎉 Order Placed! You successfully purchased "${product.name}" for ₹${product.price}.`;

    setTimeout(() => {
      this.toastMessage = null;
    }, 4500);
  }
}
