package com.diary.controller;

import com.diary.model.Book;
import com.diary.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "http://localhost:4200")
public class BookController {
    
    @Autowired
    private BookService bookService;
    
    @GetMapping("/search")
    public List<Book> searchBooks(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String subject,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) { // Changed from 20 to 6
        return bookService.searchBooks(q, subject, page, size);
    }
    
    @GetMapping("/popular")
    public List<Book> getPopularBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) { // Changed from 20 to 6
        return bookService.getPopularBooks(page, size);
    }
    
    @PostMapping("/save")
    public Book saveBook(@RequestBody Book book) {
        return bookService.saveBook(book);
    }
    
    @GetMapping("/collection")
    public List<Book> getSavedBooks() {
        return bookService.getSavedBooks();
    }
    
    @DeleteMapping("/collection/{id}")
    public ResponseEntity<Void> removeFromCollection(@PathVariable String id) {
        bookService.removeFromCollection(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/subjects")
    public List<String> getWellnessSubjects() {
        return bookService.getWellnessSubjects();
    }
}