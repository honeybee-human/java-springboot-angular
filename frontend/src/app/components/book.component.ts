import { Component, OnInit } from '@angular/core';
import { BookService } from '../services/book.service';
import { Book } from '../models/book.model';
import { FAKE_BOOKS } from '../data/fake-books.data';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./styles/book/book.component.scss']
})
export class BookComponent implements OnInit {
  descriptionQuery = '';
  titleQuery = '';
  authorQuery = '';
  
  searchResults: Book[] = [];
  savedBooks: Book[] = [];
  activeTab: 'search' | 'collection' | 'practice' = 'search';
  isSearching = false;
  isLoadingCollection = false;
  hasSearched = false;
  
  currentPage = 1;
  pageSize = 16;
  totalResults = 0;
  totalPages = 0;
  
  fakeBooks = FAKE_BOOKS;
  Math = Math;

  constructor(private bookService: BookService) {}

  ngOnInit() {
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
    if (!this.descriptionQuery.trim() && !this.titleQuery.trim() && !this.authorQuery.trim()) {
      this.loadPopularBooks();
      return;
    }
    this.performSearch();
  }

  performSearch() {
    this.isSearching = true;
    this.currentPage = 1;
    
    this.bookService.searchBooksAdvanced(
      this.descriptionQuery.trim(),
      this.titleQuery.trim(), 
      this.authorQuery.trim(),
      this.currentPage - 1, 
      this.pageSize
    ).subscribe({
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
    this.totalResults = Math.max(this.totalResults, (this.currentPage - 1) * this.pageSize + resultsCount);
    this.totalPages = Math.ceil(this.totalResults / this.pageSize);
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
    
    const hasSearchTerms = this.descriptionQuery.trim() || this.titleQuery.trim() || this.authorQuery.trim();
    
    const searchMethod = hasSearchTerms ? 
      this.bookService.searchBooksAdvanced(
        this.descriptionQuery.trim(),
        this.titleQuery.trim(), 
        this.authorQuery.trim(),
        page - 1, 
        this.pageSize
      ) :
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

  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagination(this.searchResults.length);
    
    const hasSearchTerms = this.descriptionQuery.trim() || this.titleQuery.trim() || this.authorQuery.trim();
    if (hasSearchTerms) {
      this.performSearch();
    } else {
      this.loadPopularBooks();
    }
  }

  saveBook(book: Book) {
    const bookToSave: Book = {
      googleBooksId: book.googleBooksId || `temp_${Date.now()}`,
      title: book.title || 'Unknown Title',
      subtitle: book.subtitle || '',
      authors: book.authors && book.authors.length > 0 ? book.authors : ['Unknown Author'],
      publisher: book.publisher || '',
      publishedDate: book.publishedDate || '',
      description: book.description || '',
      thumbnail: book.thumbnail || '',
      previewLink: book.previewLink || '',
      categories: book.categories && book.categories.length > 0 ? book.categories : [],
      averageRating: book.averageRating || 0,
      ratingsCount: book.ratingsCount || 0,
      isSaved: true
    };

    if (!bookToSave.googleBooksId || !bookToSave.title) {
      console.error('Cannot save book: missing required fields');
      alert('Cannot save book: missing required information');
      return;
    }

    this.bookService.saveBook(bookToSave).subscribe({
      next: (savedBook) => {
        const existingIndex = this.savedBooks.findIndex(b => b.googleBooksId === book.googleBooksId);
        if (existingIndex === -1) {
          this.savedBooks.push(savedBook);
        }
        
        const index = this.searchResults.findIndex(b => b.googleBooksId === book.googleBooksId);
        if (index !== -1) {
          this.searchResults[index].isSaved = true;
        }
        
        console.log('Book saved successfully:', savedBook);
      },
      error: (error) => {
        console.error('Error saving book:', error);
        
        let errorMessage = 'Failed to save book. ';
        if (error.error && error.error.error) {
          errorMessage += error.error.error;
        } else {
          errorMessage += 'Please try again.';
        }
        
        alert(errorMessage);
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

  truncateDescription(description: string, maxLength: number = 250): string {
    if (!description) return '';
    return description.length > maxLength ? description.substring(0, maxLength) + '...' : description;
  }

  getAuthorDisplay(authors: string[] | undefined): string {
    if (!authors || authors.length === 0) {
      return 'Unknown Author';
    }
    
    if (authors.length === 1) {
      return `by ${authors[0]}`;
    }
    
    if (authors.length === 2) {
      return `by ${authors[0]} and ${authors[1]}`;
    }
    
    const remainingCount = authors.length - 2;
    return `by ${authors[0]}, ${authors[1]} +${remainingCount} more`;
  }

  getPlaceholderImage(): string {
    return 'https://via.placeholder.com/128x192/f0f0f0/666?text=No+Image';
  }

  saveFakeBook(book: Book) {
    const bookToSave: Book = {
      googleBooksId: book.googleBooksId || `fake_${Date.now()}`,
      title: book.title || 'Unknown Title',
      subtitle: book.subtitle || '',
      authors: book.authors && book.authors.length > 0 ? book.authors : ['Unknown Author'],
      publisher: book.publisher || '',
      publishedDate: book.publishedDate || '',
      description: book.description || '',
      thumbnail: book.thumbnail || '',
      previewLink: book.previewLink || '',
      categories: book.categories && book.categories.length > 0 ? book.categories : [],
      averageRating: book.averageRating || 0,
      ratingsCount: book.ratingsCount || 0,
      isSaved: true
    };

    this.bookService.saveBook(bookToSave).subscribe({
      next: (savedBook) => {
        const existingIndex = this.savedBooks.findIndex(b => b.googleBooksId === book.googleBooksId);
        if (existingIndex === -1) {
          this.savedBooks.push(savedBook);
        }
        
        const index = this.fakeBooks.findIndex(b => b.googleBooksId === book.googleBooksId);
        if (index !== -1) {
          this.fakeBooks[index].isSaved = true;
        }
        
        console.log('Fake book saved successfully:', savedBook);
      },
      error: (error) => {
        console.error('Error saving fake book:', error);
        
        let errorMessage = 'Failed to save book. ';
        if (error.error && error.error.error) {
          errorMessage += error.error.error;
        } else {
          errorMessage += 'Please try again.';
        }
        
        alert(errorMessage);
      }
    });
  }
}