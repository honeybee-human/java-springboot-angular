import { Component, OnInit } from '@angular/core';
import { DiaryEntry, Mood, MoodDisplayInfo, MoodDisplay } from '../models/diary-entry.model';
import { DiaryService } from '../services/diary.service';

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
    this.currentEntry.tags = this.tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (this.editingEntry) {
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
}