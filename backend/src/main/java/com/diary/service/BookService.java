package com.diary.service;

import com.diary.model.Book;
import com.diary.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {
    
    @Autowired
    private GoogleBooksService googleBooksService;
    
    @Autowired
    private BookRepository bookRepository;
    
    public List<Book> searchBooksAdvanced(String description, String title, String author, int page, int size) {
        return googleBooksService.searchBooksAdvanced(description, title, author, page, size);
    }
    
    public List<Book> getPopularBooks(int page, int size) {
        return googleBooksService.getPopularBooks(page, size);
    }
    
    public Book saveBook(Book book) {
        // Check if book already exists
        Optional<Book> existingBook = bookRepository.findByGoogleBooksId(book.getGoogleBooksId());
        
        if (existingBook.isPresent()) {
            // Update existing book to mark as saved
            Book existing = existingBook.get();
            existing.setIsSaved(true);
            return bookRepository.save(existing);
        } else {
            // Save new book
            book.setIsSaved(true);
            return bookRepository.save(book);
        }
    }
    
    public List<Book> getSavedBooks() {
        return bookRepository.findByIsSavedTrue();
    }
    
    @Transactional
    public void removeFromCollection(String googleBooksId) {
        Optional<Book> book = bookRepository.findByGoogleBooksId(googleBooksId);
        if (book.isPresent()) {
            Book existingBook = book.get();
            existingBook.setIsSaved(false);
            bookRepository.save(existingBook);
        }
    }
    
    public List<String> getWellnessSubjects() {
        return googleBooksService.getWellnessSubjects();
    }
}