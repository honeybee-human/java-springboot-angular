import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:8080/api/books';

  constructor(private http: HttpClient) {}

  searchBooks(query?: string, subject?: string, page: number = 0, size: number = 20): Observable<Book[]> {
    let params = `page=${page}&size=${size}`;
    if (query) params += `&q=${encodeURIComponent(query)}`;
    if (subject) params += `&subject=${encodeURIComponent(subject)}`;
    return this.http.get<Book[]>(`${this.apiUrl}/search?${params}`);
  }
  
  getAllWellnessBooks(page: number = 0, size: number = 20): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/wellness?page=${page}&size=${size}`);
  }

  saveBook(book: Book): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}/save`, book);
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