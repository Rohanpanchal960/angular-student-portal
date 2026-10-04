import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

/**
 * ====================================================================================
 * [EXPERIMENT 16] - Use HttpClient to fetch data from a public API
 * [EXPERIMENT 17] - Use Observables and subscribe() to load a user list
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Angular ka `HttpClient` module HTTP requests (GET, POST, PUT, DELETE) karne ke liye use hota hai.
 * Ye methods RxJS `Observable` return karte hain.
 * 
 * [KAISE KAAM KARTA HAI?]:
 * 1. Exp 16: `getPosts()` method `https://jsonplaceholder.typicode.com/posts` se
 *    college academic notice board & student announcements fetch karta hai.
 * 2. Exp 17: `getUsers()` method `https://jsonplaceholder.typicode.com/users` se user/student
 *    directory data load karta hai, jise component me `.subscribe()` karke render kiya jaata hai.
 * 3. `catchError` operator error handling provide karta hai taaki agar internet slow ya offline ho
 *    toh graceful mock data fallback ho sake.
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Real-world student portals backend REST APIs se communicate karte hain. Ye service
 * remote communication aur asynchronous RxJS reactive programming ko implement karti hai.
 */

export interface ApiPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface ApiUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly postsUrl = 'https://jsonplaceholder.typicode.com/posts';
  private readonly usersUrl = 'https://jsonplaceholder.typicode.com/users';

  constructor(private http: HttpClient) {}

  /**
   * [EXPERIMENT 16]: Fetch public API posts
   */
  getPosts(): Observable<ApiPost[]> {
    return this.http.get<ApiPost[]>(this.postsUrl).pipe(
      catchError(error => {
        console.warn('API Error in getPosts, providing fallback data', error);
        // Fallback mock notices in case of offline/network block
        return of([
          { userId: 1, id: 1, title: 'Notice: Angular Framework Mid-Term Exam Schedule', body: 'The mid-term examination for MCA and BCA students will commence from next Monday in Lab 3.' },
          { userId: 1, id: 2, title: 'Notice: Submission of Capstone Project Proposals', body: 'Final year BCA Hons and iMCA students are requested to submit project topics by this Friday.' },
          { userId: 2, id: 3, title: 'Notice: Workshop on RxJS Observables and Reactive Forms', body: 'Department of Computer Science is organizing a hands-on session on modern Angular architecture.' }
        ]);
      })
    );
  }

  /**
   * [EXPERIMENT 17]: Fetch users using Observable stream
   */
  getUsers(): Observable<ApiUser[]> {
    return this.http.get<ApiUser[]>(this.usersUrl).pipe(
      catchError(error => {
        console.warn('API Error in getUsers, providing fallback data', error);
        return of([
          { id: 1, name: 'Prof. Leanne Graham', username: 'Bret', email: 'lgraham@university.edu', phone: '1-770-736-8031', website: 'hildegard.org', company: { name: 'Faculty of Computer Science', catchPhrase: 'Multi-layered client-server neural-net' } },
          { id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'ehowell@university.edu', phone: '010-692-6593', website: 'anastasia.net', company: { name: 'Department of Information Tech', catchPhrase: 'Proactive didactic contingency' } },
          { id: 3, name: 'Clementine Bauch', username: 'Samantha', email: 'cbauch@university.edu', phone: '1-463-123-4447', website: 'ramiro.info', company: { name: 'Placement & Career Cell', catchPhrase: 'Face to face bifurcated interface' } }
        ]);
      })
    );
  }
}
