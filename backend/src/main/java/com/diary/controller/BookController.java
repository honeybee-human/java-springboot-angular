package com.diary.controller;

import com.diary.model.Book;
import com.diary.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "http://localhost:4200")
public class BookController {
    
    @Autowired
    private BookService bookService;
    
    @GetMapping("/search-advanced")
    public List<Book> searchBooksAdvanced(
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "16") int size) {
        return bookService.searchBooksAdvanced(description, title, author, page, size);
    }
    
    @GetMapping("/popular")
    public List<Book> getPopularBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "16") int size) {
        return bookService.getPopularBooks(page, size);
    }
    
    @PostMapping("/save")
    public ResponseEntity<?> saveBook(@RequestBody Book book) {
        try {
            Book savedBook = bookService.saveBook(book);
            return ResponseEntity.ok(savedBook);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace(); // Log the full stack trace for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to save book: " + e.getMessage()));
        }
    }
    
    @GetMapping("/saved")
    public List<Book> getSavedBooks() {
        return bookService.getSavedBooks();
    }
    
    @DeleteMapping("/saved/{id}")
    public void removeFromCollection(@PathVariable String id) {
        bookService.removeFromCollection(id);
    }
    
    @GetMapping("/subjects")
    public List<String> getWellnessSubjects() {
        return bookService.getWellnessSubjects();
    }
}