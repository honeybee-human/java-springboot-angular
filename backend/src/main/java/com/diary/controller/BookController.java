package com.diary.controller;

import com.diary.model.Book;
import com.diary.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public Book saveBook(@RequestBody Book book) {
        return bookService.saveBook(book);
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