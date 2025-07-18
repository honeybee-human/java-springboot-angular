package com.diary.service;

import com.diary.model.Book;
import com.diary.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
        return bookRepository.save(book);
    }
    
    public List<Book> getSavedBooks() {
        return bookRepository.findAll();
    }
    
    public void removeFromCollection(String googleBooksId) {
        bookRepository.deleteByGoogleBooksId(googleBooksId);
    }
    
    public List<String> getWellnessSubjects() {
        return googleBooksService.getWellnessSubjects();
    }
}