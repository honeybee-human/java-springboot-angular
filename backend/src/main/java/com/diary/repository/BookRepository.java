package com.diary.repository;

import com.diary.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, String> {
    List<Book> findByIsSavedTrue();
    List<Book> findByTitleContainingIgnoreCase(String title);
    void deleteByGoogleBooksId(String googleBooksId);
    Optional<Book> findByGoogleBooksId(String googleBooksId);
}