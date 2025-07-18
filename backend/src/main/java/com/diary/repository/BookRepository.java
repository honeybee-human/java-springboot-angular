package com.diary.repository;

import com.diary.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, String> {
    List<Book> findByIsSavedTrue();
    List<Book> findByTitleContainingIgnoreCase(String title);
}