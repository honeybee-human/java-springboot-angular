import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators'; // Add catchError to the import
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:8080/api/books';

  constructor(private http: HttpClient) {}

  searchBooks(query?: string, subject?: string, page: number = 0, size: number = 6): Observable<Book[]> {
    let params = `page=${page}&size=${size}`;
    if (query) params += `&q=${encodeURIComponent(query)}`;
    if (subject) params += `&subject=${encodeURIComponent(subject)}`;
    
    console.log('API Request:', `${this.apiUrl}/search?${params}`);
    
    return this.http.get<Book[]>(`${this.apiUrl}/search?${params}`).pipe(
      tap(books => console.log('API Response:', books))
    );
  }

  getPopularBooks(page: number = 0, size: number = 6): Observable<Book[]> {
    console.log('Popular Books Request:', `${this.apiUrl}/popular?page=${page}&size=${size}`);
    
    return this.http.get<Book[]>(`${this.apiUrl}/popular?page=${page}&size=${size}`).pipe(
      tap(books => console.log('Popular Books Response:', books))
    );
  }

  saveBook(book: Book): Observable<Book> {
    console.log('Saving book:', book);
    return this.http.post<Book>(`${this.apiUrl}/save`, book).pipe(
      tap(savedBook => console.log('Book saved successfully:', savedBook)),
      catchError(error => {
        console.error('Error saving book:', error);
        throw error;
      })
    );
  }

  getSavedBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/collection`);
  }

  removeFromCollection(bookId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/collection/${bookId}`);
  }

  getWellnessSubjects(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/subjects`);
  }
}