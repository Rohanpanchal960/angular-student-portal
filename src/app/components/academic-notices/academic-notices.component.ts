import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ApiPost, ApiUser } from '../../services/api.service';

/**
 * ====================================================================================
 * [EXPERIMENT 16] - Use HttpClient to fetch data from a public API (jsonplaceholder posts)
 * [EXPERIMENT 17] - Use Observables and subscribe() to load a user list (jsonplaceholder users)
 * ====================================================================================
 */

@Component({
  selector: 'app-academic-notices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notices-page">
      <!-- Header -->
      <div class="notices-hero">
        <div class="badges-row">
          <span class="badge-tag">Experiment 16 (HttpClient REST API)</span>
          <span class="badge-tag">Experiment 17 (RxJS Observables & subscribe)</span>
        </div>
        <h1>Live Academic Notices & Remote Directory</h1>
        <p>
          Demonstrating remote asynchronous communication using Angular's <code>HttpClient</code> module 
          and RxJS <code>Observable.subscribe()</code> streaming from a public REST API.
        </p>

        <!-- Mode Switcher -->
        <div class="feed-switcher">
          <button 
            (click)="activeTab = 'posts'" 
            class="switch-tab-btn" 
            [class.active]="activeTab === 'posts'">
            <i class="fa-solid fa-bullhorn me-2"></i> Academic Notices Board (Exp 16)
          </button>
          <button 
            (click)="activeTab = 'users'" 
            class="switch-tab-btn" 
            [class.active]="activeTab === 'users'">
            <i class="fa-solid fa-users me-2"></i> Remote Users Directory (Exp 17)
          </button>
        </div>
      </div>

      <!-- Live Fetch Controls Bar -->
      <div class="controls-card">
        <div class="controls-left">
          <button (click)="refreshCurrentData()" [disabled]="isLoading" class="btn-refresh">
            <i class="fa-solid fa-arrows-rotate me-1" [class.fa-spin]="isLoading"></i>
            <span>{{ isLoading ? 'Fetching from API...' : 'Fetch Live API Data' }}</span>
          </button>
          <span class="api-endpoint-label">
            Endpoint: <code>{{ activeTab === 'posts' ? 'jsonplaceholder/posts' : 'jsonplaceholder/users' }}</code>
          </span>
        </div>

        <div class="search-wrap">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Filter live results..." 
            class="filter-input" />
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state-card">
        <div class="loader-spinner"></div>
        <h3>Connecting to Remote REST API...</h3>
        <p>Subscribing to RxJS Observable stream via HttpClient.</p>
      </div>

      <!-- POSTS FEED (EXPERIMENT 16) -->
      <div *ngIf="activeTab === 'posts' && !isLoading" class="posts-grid">
        <div *ngFor="let post of filteredPosts" class="post-card">
          <div class="post-top">
            <span class="post-id-badge">Notice #{{ post.id }}</span>
            <span class="post-author-pill">Author ID: {{ post.userId }}</span>
          </div>
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-body">{{ post.body }}</p>
          <div class="post-footer">
            <span class="status-verified"><i class="fa-solid fa-circle-check me-1"></i> Fetched via HttpClient.get()</span>
          </div>
        </div>
      </div>

      <!-- USERS DIRECTORY (EXPERIMENT 17) -->
      <div *ngIf="activeTab === 'users' && !isLoading" class="users-grid">
        <div *ngFor="let u of filteredUsers" class="user-card">
          <div class="user-avatar-wrap">
            <img [src]="'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.name" [alt]="u.name" class="user-avatar" />
            <div>
              <h3>{{ u.name }}</h3>
              <span class="user-handle">&#64;{{ u.username }}</span>
            </div>
          </div>
          <div class="user-details">
            <div class="detail-row">
              <i class="fa-solid fa-envelope detail-icon"></i>
              <span>{{ u.email }}</span>
            </div>
            <div class="detail-row">
              <i class="fa-solid fa-phone detail-icon"></i>
              <span>{{ u.phone }}</span>
            </div>
            <div class="detail-row">
              <i class="fa-solid fa-building detail-icon"></i>
              <span>{{ u.company.name }}</span>
            </div>
            <div class="detail-row">
              <i class="fa-solid fa-globe detail-icon"></i>
              <span>{{ u.website }}</span>
            </div>
          </div>
          <div class="user-card-footer">
            <span class="obs-badge"><i class="fa-solid fa-bolt me-1"></i> Observable.subscribe() loaded</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notices-page { display: flex; flex-direction: column; gap: 2rem; max-width: 1400px; margin: 0 auto; }
    .notices-hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%);
      color: #ffffff;
      padding: 2.75rem 2.5rem;
      border-radius: 24px;
      box-shadow: 0 16px 36px -6px rgba(15, 23, 42, 0.25);
    }
    .badges-row { display: flex; gap: 0.6rem; margin-bottom: 0.85rem; flex-wrap: wrap; }
    .notices-hero h1 { margin: 0 0 0.65rem 0; font-size: 2.2rem; font-weight: 800; letter-spacing: -0.5px; }
    .notices-hero p { margin: 0 0 1.75rem 0; font-size: 1rem; opacity: 0.9; max-width: 750px; line-height: 1.6; }
    
    .feed-switcher { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .switch-tab-btn {
      background: rgba(255, 255, 255, 0.12);
      border: 1.5px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.88rem;
      padding: 0.75rem 1.4rem;
      border-radius: 12px;
      transition: all 0.2s;
    }
    .switch-tab-btn:hover { background: rgba(255, 255, 255, 0.2); }
    .switch-tab-btn.active {
      background: #ffffff;
      color: #1e1b4b;
      border-color: #ffffff;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
    }

    .controls-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.25rem 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.25rem;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
      flex-wrap: wrap;
    }
    .controls-left { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .btn-refresh {
      background: #4f46e5;
      color: #ffffff;
      padding: 0.7rem 1.25rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.88rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-refresh:hover:not(:disabled) { background: #4338ca; }
    .btn-refresh:disabled { opacity: 0.6; cursor: not-allowed; }

    .api-endpoint-label { font-size: 0.85rem; color: #64748b; }
    .filter-input {
      padding: 0.65rem 1rem;
      border-radius: 10px;
      border: 1.5px solid #cbd5e1;
      width: 260px;
      font-size: 0.9rem;
    }
    .filter-input:focus { border-color: #6366f1; }

    .loading-state-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 20px;
      padding: 3.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .loader-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e0e7ff;
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: spin 0.8s infinite linear;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    .posts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    .users-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }

    @media (max-width: 600px) {
      .notices-hero { padding: 1.5rem 1.1rem; }
      .notices-hero h1 { font-size: 1.7rem; }
      .feed-switcher { flex-direction: column; width: 100%; }
      .switch-tab-btn { width: 100%; text-align: center; }
      .controls-card { padding: 1rem; }
      .controls-left { width: 100%; }
      .btn-refresh { width: 100%; justify-content: center; }
      .search-wrap { width: 100%; }
      .filter-input { width: 100%; }
      .posts-grid { grid-template-columns: 1fr; }
      .users-grid { grid-template-columns: 1fr; }
    }
    .post-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.75rem;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .post-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08); }
    .post-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; }
    .post-id-badge { background: #e0e7ff; color: #4338ca; font-weight: 800; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 6px; }
    .post-author-pill { font-size: 0.75rem; color: #64748b; font-weight: 600; }
    .post-title { margin: 0 0 0.65rem 0; font-size: 1.15rem; color: #0f172a; text-transform: capitalize; line-height: 1.35; font-weight: 700; }
    .post-body { margin: 0 0 1.25rem 0; font-size: 0.9rem; color: #475569; line-height: 1.6; flex: 1; }
    .post-footer { padding-top: 1rem; border-top: 1px solid #f1f5f9; }
    .status-verified { font-size: 0.78rem; font-weight: 700; color: #16a34a; }

    .users-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .user-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.75rem;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .user-avatar-wrap { display: flex; align-items: center; gap: 1rem; }
    .user-avatar { width: 50px; height: 50px; border-radius: 14px; background: #e0e7ff; padding: 4px; }
    .user-avatar-wrap h3 { margin: 0; font-size: 1.1rem; color: #0f172a; font-weight: 700; }
    .user-handle { font-size: 0.8rem; color: #6366f1; font-weight: 600; }
    .user-details { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.88rem; color: #334155; }
    .detail-row { display: flex; align-items: center; gap: 0.65rem; word-break: break-word; }
    .detail-icon { font-size: 1rem; }
    .user-card-footer { padding-top: 0.85rem; border-top: 1px solid #f1f5f9; }
    .obs-badge { font-size: 0.75rem; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 0.2rem 0.6rem; border-radius: 6px; }
  `]
})
export class AcademicNoticesComponent implements OnInit {
  activeTab: 'posts' | 'users' = 'posts';
  isLoading = false;
  posts: ApiPost[] = [];
  users: ApiUser[] = [];
  searchQuery = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchPosts();
  }

  fetchPosts(): void {
    this.isLoading = true;
    // [EXPERIMENT 16 & 17]: HttpClient get & subscribe
    this.apiService.getPosts().subscribe({
      next: (data) => {
        this.posts = data.slice(0, 15); // Show first 15 notices
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  fetchUsers(): void {
    this.isLoading = true;
    this.apiService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  refreshCurrentData(): void {
    if (this.activeTab === 'posts') {
      this.fetchPosts();
    } else {
      this.fetchUsers();
    }
  }

  get filteredPosts(): ApiPost[] {
    if (!this.searchQuery) return this.posts;
    const q = this.searchQuery.toLowerCase();
    return this.posts.filter(p => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q));
  }

  get filteredUsers(): ApiUser[] {
    if (!this.searchQuery) return this.users;
    const q = this.searchQuery.toLowerCase();
    return this.users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
}
