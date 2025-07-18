import { Component, OnInit } from '@angular/core';
import { DiaryEntry, Mood, MoodDisplayInfo, MoodDisplay } from '../models/diary-entry.model';
import { Book } from '../models/book.model';
import { DiaryService } from '../services/diary.service';
import { BookService } from '../services/book.service';

@Component({
  selector: 'app-diary',
  templateUrl: './diary.component.html',
  styleUrls: ['./diary.component.scss']
})
export class DiaryComponent implements OnInit {
  entries: DiaryEntry[] = [];
  moods = Object.values(Mood);
  loading = false;
  showAddForm = false;
  editingEntry: DiaryEntry | null = null;
  
  // Enhanced search properties
  searchQuery = '';
  titleSearchQuery = '';
  textSearchQuery = '';
  filterMood: Mood | null = null; // Changed from string to Mood | null
  
  // Book search properties
  showBookSearch = false;
  bookSearchResults: Book[] = [];
  savedBooks: Book[] = [];
  bookSearchQuery = '';
  bookTitleQuery = '';
  bookAuthorQuery = '';
  isSearchingBooks = false;
  
  currentEntry: DiaryEntry = {
    title: '',
    content: '',
    mood: Mood.NEUTRAL,
    tags: []
  };
  
  tagsString = '';

  constructor(
    private diaryService: DiaryService,
    private bookService: BookService
  ) {}

  ngOnInit() {
    this.loadEntries();
    this.loadSavedBooks();
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

  loadSavedBooks() {
    this.bookService.getSavedBooks().subscribe({
      next: (books) => {
        this.savedBooks = books;
      },
      error: (error) => {
        console.error('Error loading saved books:', error);
      }
    });
  }

  saveEntry() {
    const entry = {
      ...this.currentEntry,
      tags: this.tagsString.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    if (this.editingEntry) {
      this.diaryService.updateEntry(this.editingEntry.id!, entry).subscribe({
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
      this.diaryService.createEntry(entry).subscribe({
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
    this.showBookSearch = false;
  }

  // Enhanced search methods
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

  onAdvancedSearch() {
    // Implement advanced search combining title, text, and mood
    const searchTerm = this.titleSearchQuery || this.textSearchQuery || '';
    const mood = this.filterMood; // No need for || null since it's already Mood | null
    
    if (searchTerm.trim() || mood) {
      this.diaryService.searchByTextAndMood(searchTerm, mood).subscribe({
        next: (entries: DiaryEntry[]) => {
          this.entries = entries;
        },
        error: (error: any) => {
          console.error('Error in advanced search:', error);
        }
      });
    } else {
      this.loadEntries();
    }
  }

  onMoodFilter() {
    if (this.filterMood) {
      this.diaryService.getEntriesByMood(this.filterMood).subscribe({ // No need for 'as Mood' cast
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

  // Book search methods
  toggleBookSearch() {
    this.showBookSearch = !this.showBookSearch;
    if (this.showBookSearch) {
      this.loadSavedBooks();
    }
  }

  searchBooks() {
    if (!this.bookSearchQuery.trim() && !this.bookTitleQuery.trim() && !this.bookAuthorQuery.trim()) {
      return;
    }

    this.isSearchingBooks = true;
    this.bookService.searchBooksAdvanced(
      this.bookSearchQuery,
      this.bookTitleQuery,
      this.bookAuthorQuery,
      0,
      20
    ).subscribe({
      next: (books) => {
        this.bookSearchResults = books;
        this.isSearchingBooks = false;
      },
      error: (error) => {
        console.error('Error searching books:', error);
        this.isSearchingBooks = false;
      }
    });
  }

  selectBook(book: Book) {
    this.currentEntry.associatedBook = book;
    this.showBookSearch = false;
  }

  selectSavedBook(book: Book) {
    this.currentEntry.associatedBook = book;
  }

  removeSelectedBook() {
    this.currentEntry.associatedBook = undefined;
  }

  getMoodDisplay(mood: Mood): MoodDisplayInfo {
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

  truncateDescription(description: string, maxLength: number = 100): string {
    if (!description) return '';
    return description.length > maxLength ? description.substring(0, maxLength) + '...' : description;
  }
}