package com.diary.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.diary.model.Book;
import com.diary.repository.BookRepository;

@Service
public class BookService {
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private GoogleBooksService googleBooksService;
    
    // Updated to accept pagination parameters
    public List<Book> searchBooks(String query, String subject, int page, int size) {
        return googleBooksService.searchBooks(query, subject, page, size);
    }
    
    // Add the missing getPopularBooks method
    public List<Book> getPopularBooks(int page, int size) {
        return googleBooksService.getPopularBooks(page, size);
    }
    
    public Book saveBook(Book book) {
        book.setIsSaved(true);
        return bookRepository.save(book);
    }
    
    public List<Book> getSavedBooks() {
        return bookRepository.findByIsSavedTrue();
    }
    
    public void removeFromCollection(String bookId) {
        bookRepository.deleteById(bookId);
    }
    
    public Optional<Book> getBookById(String id) {
        return bookRepository.findById(id);
    }
    
    public List<String> getWellnessSubjects() {
        return googleBooksService.getWellnessSubjects();
    }
}