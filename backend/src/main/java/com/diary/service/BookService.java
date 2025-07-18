package com.diary.service;

import com.diary.model.Book;
import com.diary.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private GoogleBooksService googleBooksService;
    
    public List<Book> searchBooks(String query, String subject, int page, int size) {
        if (query == null || query.trim().isEmpty()) {
            // If no search query, return all books
            return googleBooksService.getAllBooks(page, size);
        }
        return googleBooksService.searchAllBooks(query, subject, page, size);
    }
    
    public List<Book> getAllBooks(int page, int size) {
        return googleBooksService.getAllBooks(page, size);
    }
    
    // Keep backward compatibility
    public List<Book> searchBooks(String query, String subject) {
        return searchBooks(query, subject, 0, 20);
    }
    
    public List<Book> getAllWellnessBooks(int page, int size) {
        return googleBooksService.getAllWellnessBooks(page, size);
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