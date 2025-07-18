package com.diary.service;

import com.diary.model.Book;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class GoogleBooksService {
    
    @Value("${google.books.api.key:}")
    private String apiKey;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private static final List<String> WELLNESS_SUBJECTS = Arrays.asList(
        "psychology", "productivity", "personal development", 
        "mental health", "wellness", "motivation"
    );
    
    public List<Book> searchBooks(String query, String subject, int page, int size) {
        try {
            String searchQuery = buildSearchQuery(query, subject);
            int startIndex = page * size;
            String url = "https://www.googleapis.com/books/v1/volumes?q=" + searchQuery 
                       + "&maxResults=" + size + "&startIndex=" + startIndex;
            
            if (!apiKey.isEmpty()) {
                url += "&key=" + apiKey;
            }
            
            System.out.println("Google Books API URL: " + url); // Add this log
            String response = restTemplate.getForObject(url, String.class);
            System.out.println("Google Books API Response: " + response); // Add this log
            
            List<Book> books = parseGoogleBooksResponse(response);
            System.out.println("Parsed books count: " + books.size()); // Add this log
            return books;
        } catch (Exception e) {
            System.err.println("Error searching books: " + e.getMessage());
            throw new RuntimeException("Error searching books: " + e.getMessage());
        }
    }
    
    public List<Book> getPopularBooks(int page, int size) {
        try {
            int startIndex = page * size;
            // Use a broader, more reliable query that will return more results
            String url = "https://www.googleapis.com/books/v1/volumes?q=wellness+OR+self-help+OR+motivation+OR+psychology+OR+productivity"
                       + "&orderBy=relevance&maxResults=" + size + "&startIndex=" + startIndex
                       + "&printType=books&langRestrict=en";
            
            if (!apiKey.isEmpty()) {
                url += "&key=" + apiKey;
            }
            
            System.out.println("Popular Books API URL: " + url);
            String response = restTemplate.getForObject(url, String.class);
            System.out.println("API Response received, length: " + (response != null ? response.length() : "null"));
            
            List<Book> books = parseGoogleBooksResponse(response);
            System.out.println("Parsed books count: " + books.size());
            return books;
        } catch (Exception e) {
            System.err.println("Error fetching popular books: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error fetching popular books: " + e.getMessage());
        }
    }
    
    private String buildSearchQuery(String query, String subject) {
        StringBuilder searchQuery = new StringBuilder();
        
        if (query != null && !query.trim().isEmpty()) {
            searchQuery.append(query.trim().replace(" ", "+"));
        } else {
            // Default broad search when no specific query
            searchQuery.append("wellness+OR+self-help+OR+motivation+OR+psychology");
        }
        
        if (subject != null && !subject.trim().isEmpty() && WELLNESS_SUBJECTS.contains(subject.toLowerCase())) {
            searchQuery.append("+subject:").append(subject.replace(" ", "+"));
        }
        
        System.out.println("Built search query: " + searchQuery.toString());
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
}