package com.diary.service;

import com.diary.model.DiaryEntry;
import com.diary.model.Mood;
import com.diary.repository.DiaryEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DiaryService {
    
    @Autowired
    private DiaryEntryRepository diaryEntryRepository;
    
    public List<DiaryEntry> getAllEntries() {
        return diaryEntryRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public Optional<DiaryEntry> getEntryById(Long id) {
        return diaryEntryRepository.findById(id);
    }
    
    public DiaryEntry saveEntry(DiaryEntry entry) {
        return diaryEntryRepository.save(entry);
    }
    
    public DiaryEntry updateEntry(Long id, DiaryEntry updatedEntry) {
        return diaryEntryRepository.findById(id)
            .map(entry -> {
                entry.setTitle(updatedEntry.getTitle());
                entry.setContent(updatedEntry.getContent());
                entry.setMood(updatedEntry.getMood());
                entry.setTags(updatedEntry.getTags());
                entry.setUpdatedAt(LocalDateTime.now());
                return diaryEntryRepository.save(entry);
            })
            .orElseThrow(() -> new RuntimeException("Entry not found with id: " + id));
    }
    
    public void deleteEntry(Long id) {
        diaryEntryRepository.deleteById(id);
    }
    
    public List<DiaryEntry> searchEntries(String searchTerm) {
        return diaryEntryRepository.findByTitleOrContentContaining(searchTerm);
    }
    
    public List<DiaryEntry> getEntriesByTag(String tag) {
        return diaryEntryRepository.findByTag(tag);
    }
    
    public List<DiaryEntry> getEntriesByMood(Mood mood) {
        return diaryEntryRepository.findByMood(mood);
    }
    
    public List<DiaryEntry> getEntriesByDateRange(LocalDateTime start, LocalDateTime end) {
        return diaryEntryRepository.findByCreatedAtBetween(start, end);
    }
}