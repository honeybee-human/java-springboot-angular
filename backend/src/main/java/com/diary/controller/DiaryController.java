package com.diary.controller;

import com.diary.model.DiaryEntry;
import com.diary.model.Mood;
import com.diary.service.DiaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/diary")
@CrossOrigin(origins = "http://localhost:4200")
public class DiaryController {
    
    @Autowired
    private DiaryService diaryService;
    
    @GetMapping
    public List<DiaryEntry> getAllEntries() {
        return diaryService.getAllEntries();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<DiaryEntry> getEntryById(@PathVariable Long id) {
        return diaryService.getEntryById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public DiaryEntry createEntry(@RequestBody DiaryEntry entry) {
        return diaryService.saveEntry(entry);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<DiaryEntry> updateEntry(@PathVariable Long id, @RequestBody DiaryEntry entry) {
        try {
            DiaryEntry updatedEntry = diaryService.updateEntry(id, entry);
            return ResponseEntity.ok(updatedEntry);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
        diaryService.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    public List<DiaryEntry> searchEntries(@RequestParam String q) {
        return diaryService.searchEntries(q);
    }
    
    @GetMapping("/tag/{tag}")
    public List<DiaryEntry> getEntriesByTag(@PathVariable String tag) {
        return diaryService.getEntriesByTag(tag);
    }
    
    @GetMapping("/mood/{mood}")
    public List<DiaryEntry> getEntriesByMood(@PathVariable Mood mood) {
        return diaryService.getEntriesByMood(mood);
    }
    
    @GetMapping("/moods")
    public Mood[] getAllMoods() {
        return Mood.values();
    }
}