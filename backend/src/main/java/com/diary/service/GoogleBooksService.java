package com.diary.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.diary.model.Book;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GoogleBooksService {
    
    @Value("${google.books.api.key:}")
    private String apiKey;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private static final List<String> WELLNESS_SUBJECTS = Arrays.asList(
        "psychology", "productivity", "personal development", 
        "mental health", "wellness", "motivation", "self-help",
        "mindfulness", "meditation", "stress management", "life coaching",
        "positive psychology", "emotional intelligence", "resilience"
    );
    
    // Add pagination support
    public List<Book> searchBooks(String query, String subject, int page, int size) {
        try {
            String searchQuery = buildSearchQuery(query, subject);
            int startIndex = page * size;
            String url = "https://www.googleapis.com/books/v1/volumes?q=" + searchQuery + 
                        "&maxResults=" + size + "&startIndex=" + startIndex;
            
            if (!apiKey.isEmpty()) {
                url += "&key=" + apiKey;
            }
            
            String response = restTemplate.getForObject(url, String.class);
            List<Book> books = parseGoogleBooksResponse(response);
            
            // Filter books to only include wellness-related categories
            return filterWellnessBooks(books);
        } catch (Exception e) {
            throw new RuntimeException("Error searching books: " + e.getMessage());
        }
    }
    
    // Keep the old method for backward compatibility
    public List<Book> searchBooks(String query, String subject) {
        return searchBooks(query, subject, 0, 20);
    }
    
    private List<Book> filterWellnessBooks(List<Book> books) {
        return books.stream()
            .filter(book -> {
                if (book.getCategories() == null || book.getCategories().isEmpty()) {
                    return false;
                }
                
                // Check if any category matches wellness subjects
                return book.getCategories().stream()
                    .anyMatch(category -> 
                        WELLNESS_SUBJECTS.stream()
                            .anyMatch(subject -> 
                                category.toLowerCase().contains(subject.toLowerCase()) ||
                                subject.toLowerCase().contains(category.toLowerCase())
                            )
                    );
            })
            .collect(Collectors.toList());
    }
    
    // Add method to get all wellness books without search query
    public List<Book> getAllWellnessBooks(int page, int size) {
        try {
            // Search for each wellness subject and combine results
            List<Book> allBooks = new ArrayList<>();
            
            for (String subject : WELLNESS_SUBJECTS) {
                int startIndex = page * size;
                String url = "https://www.googleapis.com/books/v1/volumes?q=subject:" + subject + 
                            "&maxResults=" + Math.min(size / WELLNESS_SUBJECTS.size() + 1, 10) + 
                            "&startIndex=" + startIndex;
                
                if (!apiKey.isEmpty()) {
                    url += "&key=" + apiKey;
                }
                
                try {
                    String response = restTemplate.getForObject(url, String.class);
                    List<Book> books = parseGoogleBooksResponse(response);
                    allBooks.addAll(filterWellnessBooks(books));
                } catch (Exception e) {
                    // Continue with other subjects if one fails
                    continue;
                }
            }
            
            // Remove duplicates and limit results
            return allBooks.stream()
                .distinct()
                .limit(size)
                .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching wellness books: " + e.getMessage());
        }
    }
    
    private String buildSearchQuery(String query, String subject) {
        StringBuilder searchQuery = new StringBuilder();
        
        if (query != null && !query.trim().isEmpty()) {
            searchQuery.append(query.trim().replace(" ", "+"));
        }
        
        if (subject != null && !subject.trim().isEmpty() && WELLNESS_SUBJECTS.contains(subject.toLowerCase())) {
            if (searchQuery.length() > 0) {
                searchQuery.append("+");
            }
            searchQuery.append("subject:").append(subject.replace(" ", "+"));
        }
        
        return searchQuery.toString();
    }
    
    private List<Book> parseGoogleBooksResponse(String response) throws Exception {
        List<Book> books = new ArrayList<>();
        JsonNode root = objectMapper.readTree(response);
        JsonNode items = root.get("items");
        
        if (items != null) {
            for (JsonNode item : items) {
                Book book = new Book();
                book.setGoogleBooksId(item.get("id").asText());
                
                JsonNode volumeInfo = item.get("volumeInfo");
                if (volumeInfo != null) {
                    book.setTitle(getTextValue(volumeInfo, "title"));
                    book.setSubtitle(getTextValue(volumeInfo, "subtitle"));
                    book.setPublisher(getTextValue(volumeInfo, "publisher"));
                    book.setPublishedDate(getTextValue(volumeInfo, "publishedDate"));
                    book.setDescription(getTextValue(volumeInfo, "description"));
                    
                    // Authors
                    JsonNode authors = volumeInfo.get("authors");
                    if (authors != null && authors.isArray()) {
                        List<String> authorList = new ArrayList<>();
                        for (JsonNode author : authors) {
                            authorList.add(author.asText());
                        }
                        book.setAuthors(authorList);
                    }
                    
                    // Categories
                    JsonNode categories = volumeInfo.get("categories");
                    if (categories != null && categories.isArray()) {
                        List<String> categoryList = new ArrayList<>();
                        for (JsonNode category : categories) {
                            categoryList.add(category.asText());
                        }
                        book.setCategories(categoryList);
                    }
                    
                    // Image
                    JsonNode imageLinks = volumeInfo.get("imageLinks");
                    if (imageLinks != null) {
                        book.setThumbnail(getTextValue(imageLinks, "thumbnail"));
                    }
                    
                    // Preview link
                    book.setPreviewLink(getTextValue(volumeInfo, "previewLink"));
                    
                    // Ratings
                    if (volumeInfo.has("averageRating")) {
                        book.setAverageRating(volumeInfo.get("averageRating").asDouble());
                    }
                    if (volumeInfo.has("ratingsCount")) {
                        book.setRatingsCount(volumeInfo.get("ratingsCount").asInt());
                    }
                }
                
                books.add(book);
            }
        }
        
        return books;
    }
    
    private String getTextValue(JsonNode node, String fieldName) {
        JsonNode field = node.get(fieldName);
        return field != null ? field.asText() : null;
    }
    
    public List<String> getWellnessSubjects() {
        return WELLNESS_SUBJECTS;
    }
    
    // Add new method to search all books without filtering
    public List<Book> searchAllBooks(String query, String subject, int page, int size) {
        try {
            String searchQuery = buildSearchQuery(query, subject);
            int startIndex = page * size;
            String url = "https://www.googleapis.com/books/v1/volumes?q=" + searchQuery + 
                        "&maxResults=" + size + "&startIndex=" + startIndex;
            
            if (!apiKey.isEmpty()) {
                url += "&key=" + apiKey;
            }
            
            String response = restTemplate.getForObject(url, String.class);
            return parseGoogleBooksResponse(response); // No filtering
        } catch (Exception e) {
            throw new RuntimeException("Error searching books: " + e.getMessage());
        }
    }
    
    // Add method to get all books without wellness filtering
    public List<Book> getAllBooks(int page, int size) {
        try {
            int startIndex = page * size;
            // Search for popular/recent books instead of wellness-specific
            String url = "https://www.googleapis.com/books/v1/volumes?q=*&orderBy=newest&maxResults=" + size + "&startIndex=" + startIndex;
            
            if (!apiKey.isEmpty()) {
                url += "&key=" + apiKey;
            }
            
            String response = restTemplate.getForObject(url, String.class);
            return parseGoogleBooksResponse(response); // No filtering
        } catch (Exception e) {
            throw new RuntimeException("Error fetching books: " + e.getMessage());
        }
    }
}