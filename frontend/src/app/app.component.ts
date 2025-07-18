import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <nav class="navbar">
        <div class="nav-brand">
          <h1>🌟 Motivational Journal</h1>
        </div>
        <div class="nav-links">
          <button 
            class="nav-btn" 
            [class.active]="activeTab === 'diary'"
            (click)="setActiveTab('diary')">
            📝 Journal
          </button>
          <button 
            class="nav-btn" 
            [class.active]="activeTab === 'books'"
            (click)="setActiveTab('books')">
            📚 Books
          </button>
        </div>
      </nav>
      
      <main class="main-content">
        <app-diary *ngIf="activeTab === 'diary'"></app-diary>
        <app-book *ngIf="activeTab === 'books'"></app-book>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fffe 0%, #e8f5e8 100%);
    }
    
    .navbar {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 20px rgba(34, 139, 34, 0.1);
      border-bottom: 1px solid #e8f5e8;
    }
    
    .nav-brand h1 {
      margin: 0;
      color: #2d5a2d;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .nav-links {
      display: flex;
      gap: 1rem;
    }
    
    .nav-btn {
      padding: 0.75rem 1.5rem;
      border: 2px solid #e8f5e8;
      border-radius: 25px;
      background: white;
      color: #2d5a2d;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }
    
    .nav-btn:hover {
      background: #f0f8f0;
      border-color: #228b22;
      transform: translateY(-2px);
    }
    
    .nav-btn.active {
      background: #228b22;
      color: white;
      border-color: #228b22;
      box-shadow: 0 4px 15px rgba(34, 139, 34, 0.3);
    }
    
    .main-content {
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .navbar {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
      }
      
      .nav-links {
        width: 100%;
        justify-content: center;
      }
      
      .main-content {
        padding: 1rem;
      }
    }
  `]
})
export class AppComponent {
  activeTab: 'diary' | 'books' = 'diary';
  
  setActiveTab(tab: 'diary' | 'books') {
    this.activeTab = tab;
  }
}