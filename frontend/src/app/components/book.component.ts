import { Component, OnInit } from '@angular/core';
import { BookService } from '../services/book.service';
import { Book } from '../models/book.model';
import { FAKE_BOOKS } from '../data/fake-books.data';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent implements OnInit {
  searchQuery = '';
  searchResults: Book[] = [];
  savedBooks: Book[] = [];
  wellnessSubjects: string[] = [];
  selectedSubject = '';
  activeTab: 'search' | 'collection' | 'practice' = 'search';
  isSearching = false;
  isLoadingCollection = false;
  hasSearched = false;
  
  // Pagination properties
  currentPage = 1;
  pageSize = 8; // Changed from 6 to 8
  pageSizeOptions = [8, 16, 24]; // Updated options
  maxResults = 48; // Add max results limit
  totalResults = 0;
  totalPages = 0;
  isLoadingMore = false;
  hasMoreResults = false;
  
  // Practice books
  fakeBooks = FAKE_BOOKS;
  Math = Math; // Make Math available in template

  constructor(private bookService: BookService) {}

  ngOnInit() {
    this.loadWellnessSubjects();
    this.loadPopularBooks();
    this.loadCollection();
  }

  get displayedSearchResults(): Book[] {
    return this.searchResults.map(book => ({
      ...book,
      isSaved: this.savedBooks.some(saved => saved.googleBooksId === book.googleBooksId)
    }));
  }

  get visiblePages(): number[] {
    return this.generateVisiblePages();
  }

  loadWellnessSubjects() {
    this.bookService.getWellnessSubjects().subscribe({
      next: (subjects) => {
        this.wellnessSubjects = subjects;
      },
      error: (error) => {
        console.error('Error loading wellness subjects:', error);
      }
    });
  }

  loadPopularBooks() {
    this.isSearching = true;
    this.bookService.getPopularBooks(this.currentPage - 1, this.pageSize).subscribe({
      next: (books) => {
        this.searchResults = books;
        this.updatePagination(books.length);
        this.isSearching = false;
        this.hasSearched = true;
      },
      error: (error) => {
        console.error('Error loading popular books:', error);
        this.isSearching = false;
      }
    });
  }

  searchBooks() {
    if (!this.searchQuery.trim()) {
      this.loadPopularBooks();
      return;
    }
    this.performSearch();
  }

  performSearch() {
    this.isSearching = true;
    this.currentPage = 1;
    
    this.bookService.searchBooks(this.searchQuery, this.selectedSubject, this.currentPage - 1, this.pageSize).subscribe({
      next: (books) => {
        this.searchResults = books;
        this.updatePagination(books.length);
        this.isSearching = false;
        this.hasSearched = true;
      },
      error: (error) => {
        console.error('Error searching books:', error);
        this.isSearching = false;
        this.hasSearched = true;
      }
    });
  }

  updatePagination(resultsCount: number) {
    this.hasMoreResults = resultsCount === this.pageSize && (this.currentPage * this.pageSize) < this.maxResults;
    this.totalResults = Math.min(Math.max(this.totalResults, (this.currentPage - 1) * this.pageSize + resultsCount), this.maxResults);
    
    if (this.hasMoreResults && (this.currentPage * this.pageSize) < this.maxResults) {
      this.totalResults = Math.min(this.currentPage * this.pageSize + 1, this.maxResults);
    }
    
    this.totalPages = Math.min(Math.ceil(this.totalResults / this.pageSize), Math.ceil(this.maxResults / this.pageSize));
  }

  generateVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  goToPage(page: number) {
    if (page === this.currentPage || page < 1 || page > this.totalPages) {
      return;
    }
    
    this.currentPage = page;
    this.isSearching = true;
    
    const searchMethod = this.searchQuery.trim() ? 
      this.bookService.searchBooks(this.searchQuery, this.selectedSubject, page - 1, this.pageSize) :
      this.bookService.getPopularBooks(page - 1, this.pageSize);
    
    searchMethod.subscribe({
      next: (books) => {
        this.searchResults = books;
        this.updatePagination(books.length);
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Error loading page:', error);
        this.isSearching = false;
      }
    });
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  saveBook(book: Book) {
    // Ensure isSaved is explicitly set
    const bookToSave = { ...book, isSaved: true };
    this.bookService.saveBook(bookToSave).subscribe({
      next: (savedBook) => {
        this.savedBooks.push(savedBook);
        const index = this.searchResults.findIndex(b => b.googleBooksId === book.googleBooksId);
        if (index !== -1) {
          this.searchResults[index].isSaved = true;
        }
        console.log('Book saved successfully:', savedBook);
      },
      error: (error) => {
        console.error('Error saving book:', error);
        alert('Failed to save book. Please try again.');
      }
    });
  }

  saveFakeBook(book: Book) {
    // Ensure isSaved is explicitly set
    const bookToSave = { ...book, isSaved: true };
    this.bookService.saveBook(bookToSave).subscribe({
      next: (savedBook) => {
        this.savedBooks.push(savedBook);
        const index = this.fakeBooks.findIndex(b => b.googleBooksId === book.googleBooksId);
        if (index !== -1) {
          this.fakeBooks[index].isSaved = true;
        }
        console.log('Fake book saved successfully:', savedBook);
      },
      error: (error) => {
        console.error('Error saving fake book:', error);
        alert('Failed to save book. Please try again.');
      }
    });
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
      }
    });
  }

  removeFromCollection(bookId: string) {
    this.bookService.removeFromCollection(bookId).subscribe({
      next: () => {
        this.savedBooks = this.savedBooks.filter(book => book.googleBooksId !== bookId);
        const searchIndex = this.searchResults.findIndex(b => b.googleBooksId === bookId);
        if (searchIndex !== -1) {
          this.searchResults[searchIndex].isSaved = false;
        }
        const fakeIndex = this.fakeBooks.findIndex(b => b.googleBooksId === bookId);
        if (fakeIndex !== -1) {
          this.fakeBooks[fakeIndex].isSaved = false;
        }
      },
      error: (error) => {
        console.error('Error removing from collection:', error);
      }
    });
  }

  checkSavedStatus(book: Book): boolean {
    return this.savedBooks.some(saved => saved.googleBooksId === book.googleBooksId);
  }

  setActiveTab(tab: 'search' | 'collection' | 'practice') {
    this.activeTab = tab;
  }

  getStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  }

  truncateDescription(description: string, maxLength: number = 200): string {
    if (!description) return '';
    return description.length > maxLength ? description.substring(0, maxLength) + '...' : description;
  }

  getPlaceholderImage(): string {
    return 'https://via.placeholder.com/128x192/f0f0f0/666?text=No+Image';
  }

  // Add new method to handle page size change
  onPageSizeChange() {
    // Ensure page size doesn't exceed max results
    this.pageSize = Math.min(this.pageSize, this.maxResults);
    this.currentPage = 1; // Reset to first page when changing page size
    this.updatePagination(this.searchResults.length);
    
    // Reload current search/popular books with new page size
    if (this.searchQuery.trim()) {
      this.performSearch();
    } else {
      this.loadPopularBooks();
    }
  }
}