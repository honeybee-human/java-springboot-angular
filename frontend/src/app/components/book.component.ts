import { Component, OnInit } from '@angular/core';
import { BookService } from '../services/book.service';
import { Book } from '../models/book.model';

@Component({
  selector: 'app-book',
  template: `
    <div class="book-container">
      <!-- Search Section -->
      <div class="search-section">
        <h2>📚 Book Search & Collection</h2>
        
        <div class="search-form">
          <div class="search-inputs">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search books by title, author, or keyword..."
              class="search-input"
              (keyup.enter)="searchBooks()">
            
            <select [(ngModel)]="selectedSubject" class="subject-select">
              <option value="">All Subjects</option>
              <option *ngFor="let subject of wellnessSubjects" [value]="subject">
                {{ subject | titlecase }}
              </option>
            </select>
            
            <button (click)="searchBooks()" class="search-btn" [disabled]="isSearching">
              {{ isSearching ? '🔍 Searching...' : '🔍 Search' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'search'"
          (click)="setActiveTab('search')">
          🔍 Search Results ({{ displayedSearchResults.length }})
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'collection'"
          (click)="setActiveTab('collection'); loadCollection()">
          📖 My Collection ({{ savedBooks.length }})
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'practice'"
          (click)="setActiveTab('practice')">
          🎯 Practice Books ({{ fakeBooks.length }})
        </button>
      </div>

      <!-- Search Results Tab -->
      <div *ngIf="activeTab === 'search'" class="tab-content">
        <div *ngIf="displayedSearchResults.length === 0 && !isSearching && hasSearched" class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>Cannot Currently Find Books</h3>
          <p>We couldn't find any books matching your search criteria.</p>
          <p>This might be due to:</p>
          <ul class="empty-reasons">
            <li>No API key configured</li>
            <li>Network connectivity issues</li>
            <li>No matching results for your search terms</li>
          </ul>
          <p>Try the <strong>Practice Books</strong> tab to explore sample motivational books!</p>
          <button (click)="setActiveTab('practice')" class="practice-btn">
            🎯 View Practice Books
          </button>
        </div>
        
        <div *ngIf="!hasSearched && !isSearching" class="empty-state">
          <div class="empty-icon">📚</div>
          <h3>Discover Motivational Books</h3>
          <p>Popular motivational books are loaded automatically. Use the search above to find specific books!</p>
        </div>

        <div class="books-grid">
          <div *ngFor="let book of displayedSearchResults" class="book-card">
            <div class="book-image">
              <img [src]="book.thumbnail || getPlaceholderImage()" 
                   [alt]="book.title" 
                   onerror="this.src=getPlaceholderImage()">
            </div>
            
            <div class="book-info">
              <h3 class="book-title">{{ book.title }}</h3>
              <p class="book-subtitle" *ngIf="book.subtitle">{{ book.subtitle }}</p>
              <p class="book-authors" *ngIf="book.authors?.length">
                👤 {{ book.authors?.join(', ') }}
              </p>
              <p class="book-publisher" *ngIf="book.publisher">
                🏢 {{ book.publisher }}
              </p>
              <p class="book-date" *ngIf="book.publishedDate">
                📅 {{ book.publishedDate }}
              </p>
              
              <div class="book-rating" *ngIf="book.averageRating">
                <span class="stars">{{ getStars(book.averageRating) }}</span>
                <span class="rating-text">{{ book.averageRating }}/5 ({{ book.ratingsCount || 0 }} reviews)</span>
              </div>
              
              <p class="book-description" *ngIf="book.description">
                {{ truncateDescription(book.description) }}
              </p>
              
              <div class="book-categories" *ngIf="book.categories?.length">
                <span *ngFor="let category of book.categories?.slice(0, 3)" class="category-tag">
                  {{ category }}
                </span>
              </div>
            </div>
            
            <div class="book-actions">
              <button 
                (click)="saveBook(book)" 
                class="save-btn"
                [disabled]="book.isSaved">
                {{ book.isSaved ? 'Saved' : 'Save to Collection' }}
              </button>
              
              <a *ngIf="book.previewLink" 
                 [href]="book.previewLink" 
                 target="_blank" 
                 class="preview-btn">
                Preview
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Collection Tab -->
      <div *ngIf="activeTab === 'collection'" class="tab-content">
        <div *ngIf="savedBooks.length === 0 && !isLoadingCollection" class="empty-state">
          <div class="empty-icon">📚</div>
          <h3>Your Collection is Empty</h3>
          <p>Start building your motivational library by saving books!</p>
          <button (click)="setActiveTab('search')" class="search-tab-btn">
            🔍 Search Books
          </button>
          <button (click)="setActiveTab('practice')" class="practice-btn">
            🎯 Try Practice Books
          </button>
        </div>
        
        <div *ngIf="isLoadingCollection" class="loading">
          <div class="loading-icon">📖</div>
          <p>Loading your collection...</p>
        </div>

        <div class="books-grid">
          <div *ngFor="let book of savedBooks" class="book-card">
            <div class="book-image">
              <img [src]="book.thumbnail || getPlaceholderImage()" 
                   [alt]="book.title"
                   onerror="this.src=getPlaceholderImage()">
            </div>
            
            <div class="book-info">
              <h3 class="book-title">{{ book.title }}</h3>
              <p class="book-subtitle" *ngIf="book.subtitle">{{ book.subtitle }}</p>
              <p class="book-authors" *ngIf="book.authors?.length">
                👤 {{ book.authors?.join(', ') }}
              </p>
              <p class="book-publisher" *ngIf="book.publisher">
                🏢 {{ book.publisher }}
              </p>
              
              <div class="book-rating" *ngIf="book.averageRating">
                <span class="stars">{{ getStars(book.averageRating) }}</span>
                <span class="rating-text">{{ book.averageRating }}/5</span>
              </div>
              
              <p class="book-description" *ngIf="book.description">
                {{ truncateDescription(book.description) }}
              </p>
            </div>
            
            <div class="book-actions">
              <button 
                (click)="removeFromCollection(book.googleBooksId)" 
                class="remove-btn">
                Remove
              </button>
              
              <a *ngIf="book.previewLink" 
                 [href]="book.previewLink" 
                 target="_blank" 
                 class="preview-btn">
                Preview
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Practice Books Tab -->
      <div *ngIf="activeTab === 'practice'" class="tab-content">
        <div class="practice-header">
          <h3>🎯 Practice with Sample Books</h3>
          <p>Explore these motivational books to practice using the collection features!</p>
        </div>

        <div class="books-grid">
          <div *ngFor="let book of fakeBooks" class="book-card">
            <div class="book-image">
              <img [src]="book.thumbnail" [alt]="book.title">
            </div>
            
            <div class="book-info">
              <h3 class="book-title">{{ book.title }}</h3>
              <p class="book-subtitle" *ngIf="book.subtitle">{{ book.subtitle }}</p>
              <p class="book-authors" *ngIf="book.authors?.length">
                👤 {{ book.authors?.join(', ') }}
              </p>
              <p class="book-publisher" *ngIf="book.publisher">
                🏢 {{ book.publisher }}
              </p>
              <p class="book-date" *ngIf="book.publishedDate">
                📅 {{ book.publishedDate }}
              </p>
              
              <div class="book-rating" *ngIf="book.averageRating">
                <span class="stars">{{ getStars(book.averageRating) }}</span>
                <span class="rating-text">{{ book.averageRating }}/5 ({{ book.ratingsCount || 0 }} reviews)</span>
              </div>
              
              <p class="book-description" *ngIf="book.description">
                {{ truncateDescription(book.description) }}
              </p>
              
              <div class="book-categories" *ngIf="book.categories?.length">
                <span *ngFor="let category of book.categories?.slice(0, 3)" class="category-tag">
                  {{ category }}
                </span>
              </div>
            </div>
            
            <div class="book-actions">
              <button 
                (click)="saveFakeBook(book)" 
                class="save-btn"
                [disabled]="book.isSaved">
                {{ book.isSaved ? 'Saved' : 'Save to Collection' }}
              </button>
              
              <button class="preview-btn" disabled>
                Preview (Demo)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .book-container {
      max-width: 1200px;
      margin: 0 auto;
      background: #f8fffe;
      min-height: 100vh;
      padding: 20px;
    }

    .search-section {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(34, 139, 34, 0.1);
      border: 1px solid #e8f5e8;
    }

    .search-section h2 {
      margin: 0 0 20px 0;
      color: #2d5a2d;
      font-weight: 600;
    }

    .search-inputs {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .search-input {
      flex: 1;
      min-width: 300px;
      padding: 12px 16px;
      border: 2px solid #e8f5e8;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease;
      background: white;
    }

    .search-input:focus {
      outline: none;
      border-color: #228b22;
      box-shadow: 0 0 0 3px rgba(34, 139, 34, 0.1);
    }

    .subject-select {
      padding: 12px 16px;
      border: 2px solid #e8f5e8;
      border-radius: 8px;
      font-size: 16px;
      background: white;
      min-width: 200px;
      color: #2d5a2d;
    }

    .search-btn {
      padding: 12px 24px;
      background: white;
      color: #228b22;
      border: 2px solid #228b22;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
      font-weight: 500;
    }

    .search-btn:hover:not(:disabled) {
      background: #228b22;
      color: white;
      transform: translateY(-2px);
    }

    .search-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .tab-btn {
      padding: 12px 24px;
      border: 2px solid #e8f5e8;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 16px;
      color: #2d5a2d;
      font-weight: 500;
    }

    .tab-btn.active {
      background: #228b22;
      color: white;
      border-color: #228b22;
    }

    .tab-btn:hover:not(.active) {
      background: #f0f8f0;
      border-color: #228b22;
    }

    .books-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 30px;
    }

    .book-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(34, 139, 34, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      display: flex;
      flex-direction: column;
      border: 1px solid #e8f5e8;
    }

    .book-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 20px rgba(34, 139, 34, 0.15);
    }

    .book-image {
      text-align: center;
      margin-bottom: 15px;
    }

    .book-image img {
      max-width: 100px;
      max-height: 140px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .book-info {
      flex: 1;
    }

    .book-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #2d5a2d;
      line-height: 1.4;
    }

    .book-subtitle {
      font-size: 14px;
      color: #666;
      margin: 0 0 10px 0;
      font-style: italic;
    }

    .book-authors, .book-publisher, .book-date {
      font-size: 14px;
      color: #666;
      margin: 5px 0;
    }

    .book-rating {
      margin: 10px 0;
    }

    .stars {
      font-size: 16px;
      margin-right: 8px;
    }

    .rating-text {
      font-size: 14px;
      color: #666;
    }

    .book-description {
      font-size: 14px;
      color: #555;
      line-height: 1.5;
      margin: 15px 0;
    }

    .book-categories {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 15px 0;
    }

    .category-tag {
      background: #f0f8f0;
      color: #2d5a2d;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      border: 1px solid #e8f5e8;
    }

    .book-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .save-btn, .remove-btn, .preview-btn, .search-tab-btn, .practice-btn {
      flex: 1;
      padding: 10px 16px;
      border: 2px solid;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
      background: white;
      text-decoration: none;
      text-align: center;
      font-weight: 500;
    }

    .save-btn {
      color: #228b22;
      border-color: #228b22;
    }

    .save-btn:hover:not(:disabled) {
      background: #228b22;
      color: white;
    }

    .save-btn:disabled {
      background: #f8f9fa;
      color: #6c757d;
      border-color: #dee2e6;
      cursor: not-allowed;
    }

    .remove-btn {
      color: #dc3545;
      border-color: #dc3545;
    }

    .remove-btn:hover {
      background: #dc3545;
      color: white;
    }

    .preview-btn {
      color: #228b22;
      border-color: #228b22;
    }

    .preview-btn:hover:not(:disabled) {
      background: #228b22;
      color: white;
      text-decoration: none;
    }

    .preview-btn:disabled {
      color: #6c757d;
      border-color: #dee2e6;
      cursor: not-allowed;
    }

    .search-tab-btn, .practice-btn {
      color: #228b22;
      border-color: #228b22;
      margin: 10px 5px;
    }

    .search-tab-btn:hover, .practice-btn:hover {
      background: #228b22;
      color: white;
    }

    .empty-state, .loading {
      text-align: center;
      padding: 60px 20px;
      color: #666;
      background: white;
      border-radius: 12px;
      border: 1px solid #e8f5e8;
    }

    .empty-icon, .loading-icon {
      font-size: 48px;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      color: #2d5a2d;
      margin: 20px 0;
      font-size: 24px;
    }

    .empty-state p {
      font-size: 16px;
      margin: 10px 0;
    }

    .empty-reasons {
      text-align: left;
      max-width: 400px;
      margin: 20px auto;
      padding-left: 20px;
    }

    .empty-reasons li {
      margin: 8px 0;
      color: #666;
    }

    .practice-header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      border: 1px solid #e8f5e8;
    }

    .practice-header h3 {
      color: #2d5a2d;
      margin: 0 0 10px 0;
      font-size: 24px;
    }

    .practice-header p {
      color: #666;
      margin: 0;
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .search-inputs {
        flex-direction: column;
      }

      .search-input {
        min-width: auto;
      }

      .books-grid {
        grid-template-columns: 1fr;
      }

      .tabs {
        flex-direction: column;
      }

      .book-container {
        padding: 10px;
      }
    }
  `]
})
export class BookComponent implements OnInit {
  searchQuery = '';
  selectedSubject = '';
  searchResults: Book[] = [];
  savedBooks: Book[] = [];
  wellnessSubjects: string[] = [];
  activeTab: 'search' | 'collection' | 'practice' = 'search';
  isSearching = false;
  isLoadingCollection = false;
  hasSearched = false;
  
  // Add missing pagination properties
  currentPage = 0;
  pageSize = 20;
  isLoadingMore = false;
  hasMoreResults = true;
  
  fakeBooks: Book[] = [
    {
      googleBooksId: 'fake-1',
      title: 'The Power of Positive Thinking',
      subtitle: 'A Practical Guide to Mastering the Problems of Everyday Living',
      authors: ['Norman Vincent Peale'],
      publisher: 'Motivational Press',
      publishedDate: '2023',
      description: 'This classic self-help book teaches you how to harness the power of positive thinking to transform your life. Learn practical techniques to overcome challenges, build confidence, and achieve your goals through the power of optimistic thinking.',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE0MCIgdmlld0JveD0iMCAwIDEwMCAxNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTQwIiBmaWxsPSIjMjI4YjIyIi8+Cjx0ZXh0IHg9IjUwIiB5PSI3MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+UG9zaXRpdmU8L3RleHQ+Cjx0ZXh0IHg9IjUwIiB5PSI4NSIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+VGhpbmtpbmc8L3RleHQ+Cjwvc3ZnPg==',
      categories: ['Self-Help', 'Psychology', 'Personal Development'],
      averageRating: 4.5,
      ratingsCount: 1250,
      isSaved: false
    },
    {
      googleBooksId: 'fake-2',
      title: 'Atomic Habits',
      subtitle: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
      authors: ['James Clear'],
      publisher: 'Success Publishing',
      publishedDate: '2023',
      description: 'Transform your life through the power of tiny changes. This book reveals how small habits can lead to remarkable results and provides a proven framework for improving every day.',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE0MCIgdmlld0JveD0iMCAwIDEwMCAxNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTQwIiBmaWxsPSIjMzQ2ODM0Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI2NSIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+QXRvbWljPC90ZXh0Pgo8dGV4dCB4PSI1MCIgeT0iODAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPkhhYml0czwvdGV4dD4KPC9zdmc+',
      categories: ['Productivity', 'Self-Improvement', 'Psychology'],
      averageRating: 4.8,
      ratingsCount: 2100,
      isSaved: false
    },
    {
      googleBooksId: 'fake-3',
      title: 'Mindset: The New Psychology of Success',
      subtitle: 'How We Can Learn to Fulfill Our Potential',
      authors: ['Carol S. Dweck'],
      publisher: 'Growth Mindset Books',
      publishedDate: '2023',
      description: 'Discover the power of mindset in achieving success. Learn how a growth mindset can help you overcome challenges, embrace learning, and reach your full potential in all areas of life.',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE0MCIgdmlld0JveD0iMCAwIDEwMCAxNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTQwIiBmaWxsPSIjNDA4MDQwIi8+Cjx0ZXh0IHg9IjUwIiB5PSI3MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+TWluZHNldDwvdGV4dD4KPC9zdmc+',
      categories: ['Psychology', 'Education', 'Personal Growth'],
      averageRating: 4.6,
      ratingsCount: 1800,
      isSaved: false
    },
    {
      googleBooksId: 'fake-4',
      title: 'The 7 Habits of Highly Effective People',
      subtitle: 'Powerful Lessons in Personal Change',
      authors: ['Stephen R. Covey'],
      publisher: 'Effectiveness Press',
      publishedDate: '2023',
      description: 'A comprehensive guide to personal and professional effectiveness. Learn the seven fundamental habits that can transform your character and help you achieve lasting success.',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE0MCIgdmlld0JveD0iMCAwIDEwMCAxNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTQwIiBmaWxsPSIjMmU3ZDJlIi8+Cjx0ZXh0IHg9IjUwIiB5PSI2NSIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+NyBIYWJpdHM8L3RleHQ+Cjx0ZXh0IHg9IjUwIiB5PSI4MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+RWZmZWN0aXZlPC90ZXh0Pgo8L3N2Zz4=',
      categories: ['Leadership', 'Self-Help', 'Business'],
      averageRating: 4.7,
      ratingsCount: 3200,
      isSaved: false
    },
    {
      googleBooksId: 'fake-5',
      title: 'Grit: The Power of Passion and Perseverance',
      subtitle: 'Why Talent Isn\'t Everything',
      authors: ['Angela Duckworth'],
      publisher: 'Perseverance Publications',
      publishedDate: '2023',
      description: 'Discover why grit—a combination of passion and perseverance—is the secret to outstanding achievement. Learn how to develop this crucial trait and apply it to reach your long-term goals.',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE0MCIgdmlld0JveD0iMCAwIDEwMCAxNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTQwIiBmaWxsPSIjMzI2MTMyIi8+Cjx0ZXh0IHg9IjUwIiB5PSI3MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+R3JpdDwvdGV4dD4KPC9zdmc+',
      categories: ['Psychology', 'Motivation', 'Success'],
      averageRating: 4.4,
      ratingsCount: 1650,
      isSaved: false
    },
    {
      googleBooksId: 'fake-6',
      title: 'The Miracle Morning',
      subtitle: 'The Not-So-Obvious Secret Guaranteed to Transform Your Life',
      authors: ['Hal Elrod'],
      publisher: 'Morning Routine Press',
      publishedDate: '2023',
      description: 'Transform your life before 8AM with this revolutionary morning routine. Learn the six practices that will help you wake up each day with more energy, motivation, and focus.',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE0MCIgdmlld0JveD0iMCAwIDEwMCAxNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTQwIiBmaWxsPSIjNDA4MDQwIi8+Cjx0ZXh0IHg9IjUwIiB5PSI2NSIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+TWlyYWNsZTwvdGV4dD4KPHA+dGV4dCB4PSI1MCIgeT0iODAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPk1vcm5pbmc8L3RleHQ+Cjwvc3ZnPg==',
      categories: ['Productivity', 'Self-Help', 'Wellness'],
      averageRating: 4.3,
      ratingsCount: 980,
      isSaved: false
    }
  ];

  constructor(private bookService: BookService) {}

  ngOnInit() {
    this.loadWellnessSubjects();
    // Temporarily comment out API call and show practice books
    // this.loadPopularBooks();
    this.activeTab = 'practice';
  }

  // Add missing getter method
  get displayedSearchResults(): Book[] {
    return this.searchResults.length > 0 ? this.searchResults : [];
  }

  // Add missing loadWellnessSubjects method
  loadWellnessSubjects() {
    this.bookService.getWellnessSubjects().subscribe({
      next: (subjects) => {
        this.wellnessSubjects = subjects;
      },
      error: (error) => {
        console.error('Error loading wellness subjects:', error);
        // Fallback subjects if API fails
        this.wellnessSubjects = ['psychology', 'productivity', 'personal development', 'mental health', 'wellness', 'motivation'];
      }
    });
  }

  loadPopularBooks() {
    this.isSearching = true;
    this.hasSearched = true;
    
    // Temporarily use the old search method without pagination
    this.bookService.searchBooks('motivation', '', 0, this.pageSize).subscribe({
      next: (books) => {
        this.searchResults = books;
        this.currentPage = 0;
        this.hasMoreResults = books.length === this.pageSize;
        this.isSearching = false;
        this.checkSavedStatus();
      },
      error: (error) => {
        console.error('Error loading popular books:', error);
        this.searchResults = [];
        this.isSearching = false;
        this.hasMoreResults = false;
      }
    });
  }

  searchBooks() {
    this.currentPage = 0;
    this.searchResults = [];
    this.performSearch();
  }

  performSearch() {
    if (!this.searchQuery.trim() && !this.selectedSubject && this.currentPage === 0) {
      this.loadPopularBooks();
      return;
    }

    this.isSearching = this.currentPage === 0;
    this.isLoadingMore = this.currentPage > 0;
    this.hasSearched = true;

    this.bookService.searchBooks(this.searchQuery, this.selectedSubject, this.currentPage, this.pageSize).subscribe({
      next: (books) => {
        if (this.currentPage === 0) {
          this.searchResults = books;
        } else {
          this.searchResults = [...this.searchResults, ...books];
        }
        
        this.hasMoreResults = books.length === this.pageSize;
        this.isSearching = false;
        this.isLoadingMore = false;
        this.checkSavedStatus();
      },
      error: (error) => {
        console.error('Error searching books:', error);
        if (this.currentPage === 0) {
          this.searchResults = [];
        }
        this.isSearching = false;
        this.isLoadingMore = false;
        this.hasMoreResults = false;
      }
    });
  }

  loadMoreBooks() {
    if (this.hasMoreResults && !this.isLoadingMore) {
      this.currentPage++;
      this.performSearch();
    }
  }

  saveBook(book: Book) {
    this.bookService.saveBook(book).subscribe({
      next: (savedBook) => {
        book.isSaved = true;
        alert(`"${book.title}" has been saved to your collection!`);
      },
      error: (error) => {
        console.error('Error saving book:', error);
        alert('Error saving book. Please try again.');
      }
    });
  }

  saveFakeBook(book: Book) {
    // Simulate saving fake book locally
    book.isSaved = true;
    this.savedBooks.push({...book});
    alert(`"${book.title}" has been saved to your collection!`);
  }

  loadCollection() {
    this.isLoadingCollection = true;
    this.bookService.getSavedBooks().subscribe({
      next: (books) => {
        this.savedBooks = books;
        this.isLoadingCollection = false;
      },
      error: (error) => {
        console.error('Error loading collection:', error);
        this.isLoadingCollection = false;
        // Keep any locally saved fake books
      }
    });
  }

  removeFromCollection(bookId: string) {
    if (confirm('Are you sure you want to remove this book from your collection?')) {
      // Check if it's a fake book (remove locally)
      if (bookId.startsWith('fake-')) {
        this.savedBooks = this.savedBooks.filter(book => book.googleBooksId !== bookId);
        // Update fake books array
        const fakeBook = this.fakeBooks.find(book => book.googleBooksId === bookId);
        if (fakeBook) {
          fakeBook.isSaved = false;
        }
        return;
      }

      // Real book - remove from backend
      this.bookService.removeFromCollection(bookId).subscribe({
        next: () => {
          this.savedBooks = this.savedBooks.filter(book => book.googleBooksId !== bookId);
          const searchBook = this.searchResults.find(book => book.googleBooksId === bookId);
          if (searchBook) {
            searchBook.isSaved = false;
          }
        },
        error: (error) => {
          console.error('Error removing book:', error);
          alert('Error removing book. Please try again.');
        }
      });
    }
  }

  checkSavedStatus() {
    this.bookService.getSavedBooks().subscribe({
      next: (savedBooks) => {
        const savedIds = savedBooks.map(book => book.googleBooksId);
        this.searchResults.forEach(book => {
          book.isSaved = savedIds.includes(book.googleBooksId);
        });
      },
      error: (error) => {
        console.error('Error checking saved status:', error);
      }
    });
  }

  setActiveTab(tab: 'search' | 'collection' | 'practice') {
    this.activeTab = tab;
    if (tab === 'collection') {
      this.loadCollection();
    }
  }

  getStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '⭐'.repeat(fullStars);
    if (hasHalfStar) stars += '⭐';
    return stars;
  }

  truncateDescription(description: string): string {
    if (!description) return '';
    return description.length > 200 ? description.substring(0, 200) + '...' : description;
  }

  getPlaceholderImage(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE0MCIgdmlld0JveD0iMCAwIDEwMCAxNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTQwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI3MCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
  }
}