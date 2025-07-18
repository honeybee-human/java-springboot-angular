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
}