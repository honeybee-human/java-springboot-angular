import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:8080/api/books';

  constructor(private http: HttpClient) {}

  searchBooksAdvanced(descriptionQuery: string, titleQuery: string, authorQuery: string, page: number, size: number): Observable<Book[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (descriptionQuery) {
      params = params.set('description', descriptionQuery);
    }
    if (titleQuery) {
      params = params.set('title', titleQuery);
    }
    if (authorQuery) {
      params = params.set('author', authorQuery);
    }

    return this.http.get<Book[]>(`${this.apiUrl}/search-advanced`, { params });
  }

  getPopularBooks(page: number, size: number): Observable<Book[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Book[]>(`${this.apiUrl}/popular`, { params });
  }

  saveBook(book: Book): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}/save`, book);
  }

  getSavedBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/saved`);
  }

  removeFromCollection(bookId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/saved/${bookId}`);
  }

  getWellnessSubjects(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/subjects`);
  }
}