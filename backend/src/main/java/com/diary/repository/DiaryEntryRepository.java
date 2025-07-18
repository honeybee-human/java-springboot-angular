package com.diary.repository;

import com.diary.model.DiaryEntry;
import com.diary.model.Mood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DiaryEntryRepository extends JpaRepository<DiaryEntry, Long> {
    
    @Query("SELECT d FROM DiaryEntry d WHERE d.title LIKE %:searchTerm% OR d.content LIKE %:searchTerm%")
    List<DiaryEntry> findByTitleOrContentContaining(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT d FROM DiaryEntry d JOIN d.tags t WHERE t = :tag")
    List<DiaryEntry> findByTag(@Param("tag") String tag);
    
    List<DiaryEntry> findByMood(Mood mood);
    
    List<DiaryEntry> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    List<DiaryEntry> findAllByOrderByCreatedAtDesc();
    
    // New methods for book-related searches
    @Query("SELECT d FROM DiaryEntry d WHERE d.associatedBook.title LIKE %:bookTitle%")
    List<DiaryEntry> findByBookTitle(@Param("bookTitle") String bookTitle);
    
    @Query("SELECT d FROM DiaryEntry d WHERE d.associatedBook IS NOT NULL")
    List<DiaryEntry> findEntriesWithBooks();
    
    @Query("SELECT d FROM DiaryEntry d WHERE (d.title LIKE %:searchTerm% OR d.content LIKE %:searchTerm% OR d.associatedBook.title LIKE %:searchTerm%) AND (:mood IS NULL OR d.mood = :mood)")
    List<DiaryEntry> findByTextAndMood(@Param("searchTerm") String searchTerm, @Param("mood") Mood mood);
}