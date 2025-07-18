import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DiaryEntry, Mood } from '../models/diary-entry.model';

@Injectable({
  providedIn: 'root'
})
export class DiaryService {
  private apiUrl = 'http://localhost:8080/api/diary';

  constructor(private http: HttpClient) {}

  getAllEntries(): Observable<DiaryEntry[]> {
    return this.http.get<DiaryEntry[]>(this.apiUrl);
  }

  getEntryById(id: number): Observable<DiaryEntry> {
    return this.http.get<DiaryEntry>(`${this.apiUrl}/${id}`);
  }

  createEntry(entry: DiaryEntry): Observable<DiaryEntry> {
    return this.http.post<DiaryEntry>(this.apiUrl, entry);
  }

  updateEntry(id: number, entry: DiaryEntry): Observable<DiaryEntry> {
    return this.http.put<DiaryEntry>(`${this.apiUrl}/${id}`, entry);
  }

  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchEntries(query: string): Observable<DiaryEntry[]> {
    return this.http.get<DiaryEntry[]>(`${this.apiUrl}/search?q=${query}`);
  }

  getEntriesByTag(tag: string): Observable<DiaryEntry[]> {
    return this.http.get<DiaryEntry[]>(`${this.apiUrl}/tag/${tag}`);
  }

  getEntriesByMood(mood: Mood): Observable<DiaryEntry[]> {
    return this.http.get<DiaryEntry[]>(`${this.apiUrl}/mood/${mood}`);
  }

  getAllMoods(): Observable<Mood[]> {
    return this.http.get<Mood[]>(`${this.apiUrl}/moods`);
  }
}