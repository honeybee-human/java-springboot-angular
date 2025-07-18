import { Component, OnInit } from '@angular/core';
import { DiaryEntry, Mood, MoodDisplay } from '../models/diary-entry.model';
import { DiaryService } from '../services/diary.service';

@Component({
  selector: 'app-diary',
  template: `
    <div class="diary-container">
      <!-- Header with Search and Add Button -->
      <div class="diary-header">
        <div class="search-section">
          <input 
            type="text" 
            placeholder="Search entries..." 
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            class="search-input">
          <select [(ngModel)]="filterMood" (change)="onMoodFilter()" class="mood-filter">
            <option value="">All Moods</option>
            <option *ngFor="let mood of moods" [value]="mood">
              {{getMoodDisplay(mood).emoji}} {{getMoodDisplay(mood).description}}
            </option>
          </select>
        </div>
        <button class="add-btn" (click)="showAddForm = true">
          ✏️ New Entry
        </button>
      </div>

      <!-- Add/Edit Form -->
      <div *ngIf="showAddForm || editingEntry" class="entry-form-card">
        <h3>{{editingEntry ? 'Edit Entry' : 'New Diary Entry'}}</h3>
        <form (ngSubmit)="saveEntry()" #entryForm="ngForm">
          <div class="form-group">
            <label for="title">Title</label>
            <input 
              type="text" 
              id="title"
              [(ngModel)]="currentEntry.title" 
              name="title"
              required
              class="form-control">
          </div>
          
          <div class="form-group">
            <label for="mood">How are you feeling?</label>
            <div class="mood-selector">
              <div 
                *ngFor="let mood of moods" 
                class="mood-option"
                [class.selected]="currentEntry.mood === mood"
                (click)="currentEntry.mood = mood">
                <span class="mood-emoji">{{getMoodDisplay(mood).emoji}}</span>
                <span class="mood-label">{{getMoodDisplay(mood).description}}</span>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="content">Content</label>
            <textarea 
              id="content"
              [(ngModel)]="currentEntry.content" 
              name="content"
              required
              rows="6"
              class="form-control"
              placeholder="Write about your day..."></textarea>
          </div>
          
          <div class="form-group">
            <label for="tags">Tags (comma separated)</label>
            <input 
              type="text" 
              id="tags"
              [(ngModel)]="tagsString" 
              name="tags"
              class="form-control"
              placeholder="work, family, travel">
          </div>
          
          <div class="form-actions">
            <button type="submit" class="save-btn" [disabled]="!entryForm.valid">
              {{editingEntry ? 'Update' : 'Save'}} Entry
            </button>
            <button type="button" class="cancel-btn" (click)="cancelEdit()">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Entries List -->
      <div class="entries-list">
        <div *ngIf="loading" class="loading">Loading entries...</div>
        <div *ngIf="!loading && entries.length === 0" class="no-entries">
          <p>No diary entries yet. Start writing your first entry!</p>
        </div>
        
        <div *ngFor="let entry of entries" class="entry-card">
          <div class="entry-header">
            <h3 class="entry-title">{{entry.title}}</h3>
            <div class="entry-mood">
              <span class="mood-display">
                {{getMoodDisplay(entry.mood).emoji}} {{getMoodDisplay(entry.mood).description}}
              </span>
            </div>
          </div>
          
          <div class="entry-meta">
            <span class="entry-date">{{formatDate(entry.createdAt)}}</span>
            <div class="entry-tags">
              <span *ngFor="let tag of entry.tags" class="tag">{{tag}}</span>
            </div>
          </div>
          
          <div class="entry-content">
            <p>{{entry.content}}</p>
          </div>
          
          <div class="entry-actions">
            <button class="edit-btn" (click)="editEntry(entry)">✏️ Edit</button>
            <button class="delete-btn" (click)="deleteEntry(entry.id!)">
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .diary-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .diary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      gap: 20px;
    }
    
    .search-section {
      display: flex;
      gap: 15px;
      flex: 1;
    }
    
    .search-input, .mood-filter {
      padding: 12px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s ease;
    }
    
    .search-input {
      flex: 1;
    }
    
    .search-input:focus, .mood-filter:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .add-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .add-btn:hover {
      background: #5a6fd8;
      transform: translateY(-2px);
    }
    
    .entry-form-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .entry-form-card h3 {
      margin: 0 0 25px 0;
      color: #333;
      font-size: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #555;
    }
    
    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .mood-selector {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    
    .mood-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px 10px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
    }
    
    .mood-option:hover {
      border-color: #667eea;
      background: #f8f9ff;
    }
    
    .mood-option.selected {
      border-color: #667eea;
      background: #667eea;
      color: white;
    }
    
    .mood-emoji {
      font-size: 24px;
      margin-bottom: 5px;
    }
    
    .mood-label {
      font-size: 12px;
      font-weight: 500;
    }
    
    .form-actions {
      display: flex;
      gap: 15px;
      margin-top: 25px;
    }
    
    .save-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .save-btn:hover:not(:disabled) {
      background: #218838;
    }
    
    .save-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .cancel-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .cancel-btn:hover {
      background: #5a6268;
    }
    
    .entries-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .loading, .no-entries {
      text-align: center;
      padding: 40px;
      color: #666;
      font-style: italic;
    }
    
    .entry-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }
    
    .entry-card:hover {
      transform: translateY(-2px);
    }
    
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .entry-title {
      margin: 0;
      color: #333;
      font-size: 1.3rem;
    }
    
    .mood-display {
      background: #f8f9fa;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
    
    .entry-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      font-size: 14px;
      color: #666;
    }
    
    .entry-tags {
      display: flex;
      gap: 8px;
    }
    
    .tag {
      background: #e9ecef;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .entry-content {
      margin-bottom: 20px;
      line-height: 1.6;
      color: #444;
    }
    
    .entry-actions {
      display: flex;
      gap: 10px;
    }
    
    .edit-btn, .delete-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .edit-btn {
      background: #ffc107;
      color: #212529;
    }
    
    .edit-btn:hover {
      background: #e0a800;
    }
    
    .delete-btn {
      background: #dc3545;
      color: white;
    }
    
    .delete-btn:hover {
      background: #c82333;
    }
    
    @media (max-width: 768px) {
      .diary-header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .search-section {
        flex-direction: column;
      }
      
      .mood-selector {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .entry-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      
      .entry-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
    }
  `]
})
export class DiaryComponent implements OnInit {
  entries: DiaryEntry[] = [];
  moods = Object.values(Mood);
  loading = false;
  showAddForm = false;
  editingEntry: DiaryEntry | null = null;
  searchQuery = '';
  filterMood = '';
  
  currentEntry: DiaryEntry = {
    title: '',
    content: '',
    mood: Mood.NEUTRAL,
    tags: []
  };
  
  tagsString = '';

  constructor(private diaryService: DiaryService) {}

  ngOnInit() {
    this.loadEntries();
  }

  loadEntries() {
    this.loading = true;
    this.diaryService.getAllEntries().subscribe({
      next: (entries) => {
        this.entries = entries;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading entries:', error);
        this.loading = false;
      }
    });
  }

  saveEntry() {
    // Convert tags string to array
    this.currentEntry.tags = this.tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (this.editingEntry) {
      // Update existing entry
      this.diaryService.updateEntry(this.editingEntry.id!, this.currentEntry).subscribe({
        next: (updatedEntry) => {
          const index = this.entries.findIndex(e => e.id === updatedEntry.id);
          if (index !== -1) {
            this.entries[index] = updatedEntry;
          }
          this.cancelEdit();
        },
        error: (error) => {
          console.error('Error updating entry:', error);
        }
      });
    } else {
      // Create new entry
      this.diaryService.createEntry(this.currentEntry).subscribe({
        next: (newEntry) => {
          this.entries.unshift(newEntry);
          this.cancelEdit();
        },
        error: (error) => {
          console.error('Error creating entry:', error);
        }
      });
    }
  }

  editEntry(entry: DiaryEntry) {
    this.editingEntry = entry;
    this.currentEntry = { ...entry };
    this.tagsString = entry.tags.join(', ');
    this.showAddForm = false;
  }

  deleteEntry(id: number) {
    if (confirm('Are you sure you want to delete this entry?')) {
      this.diaryService.deleteEntry(id).subscribe({
        next: () => {
          this.entries = this.entries.filter(e => e.id !== id);
        },
        error: (error) => {
          console.error('Error deleting entry:', error);
        }
      });
    }
  }

  cancelEdit() {
    this.showAddForm = false;
    this.editingEntry = null;
    this.currentEntry = {
      title: '',
      content: '',
      mood: Mood.NEUTRAL,
      tags: []
    };
    this.tagsString = '';
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.diaryService.searchEntries(this.searchQuery).subscribe({
        next: (entries) => {
          this.entries = entries;
        },
        error: (error) => {
          console.error('Error searching entries:', error);
        }
      });
    } else {
      this.loadEntries();
    }
  }

  onMoodFilter() {
    if (this.filterMood) {
      this.diaryService.getEntriesByMood(this.filterMood as Mood).subscribe({
        next: (entries) => {
          this.entries = entries;
        },
        error: (error) => {
          console.error('Error filtering by mood:', error);
        }
      });
    } else {
      this.loadEntries();
    }
  }

  getMoodDisplay(mood: Mood) {
    return MoodDisplay[mood];
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}