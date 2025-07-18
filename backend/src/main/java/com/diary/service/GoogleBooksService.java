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
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GoogleBooksService {
    
    @Value("${google.books.api.key:}")
    private String apiKey;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Target wellness categories that we want to filter by
    private static final List<String> WELLNESS_CATEGORIES = Arrays.asList(
        "Personal Growth", "Motivational", "Self-Help", "Mindfulness"
    );
    
    // Specific subject queries for targeted Google Books API calls
    private static final String[] TARGETED_SUBJECTS = {
        "subject:self-help",
        "subject:productivity", 
        "subject:personal+development",
        "subject:mental+health"
    };
    
    public List<Book> searchBooks(String query, String category, int page, int size) {
        try {
            // Limit size to maximum of 48
            size = Math.min(size, 48);
            
            if (category != null && !category.trim().isEmpty() && WELLNESS_CATEGORIES.contains(category)) {
                // Search for books and filter by specific category
                return searchBooksForCategory(query, category, page, size);
            } else {
                // Search across all wellness subjects and filter by categories
                return searchBooksAcrossAllSubjects(query, page, size);
            }
        } catch (Exception e) {
            System.err.println("Error searching books: " + e.getMessage());
            throw new RuntimeException("Error searching books: " + e.getMessage());
        }
    }
    
    public List<Book> getPopularBooks(int page, int size) {
        try {
            // Limit size to maximum of 48
            size = Math.min(size, 48);
            
            // Get popular books from targeted subjects and filter by categories
            return getPopularBooksFromTargetedSubjects(page, size);
        } catch (Exception e) {
            System.err.println("Error fetching popular books: " + e.getMessage());
            throw new RuntimeException("Error fetching popular books: " + e.getMessage());
        }
    }
    
    private List<Book> searchBooksForCategory(String query, String category, int page, int size) {
        List<Book> allBooks = new ArrayList<>();
        int booksPerSubject = Math.max(1, (size * 2) / TARGETED_SUBJECTS.length); // Get more to account for filtering
        
        for (String subjectQuery : TARGETED_SUBJECTS) {
            try {
                String searchQuery = query != null && !query.trim().isEmpty() 
                    ? query.trim().replace(" ", "+") + "+AND+" + subjectQuery
                    : subjectQuery;
                
                int startIndex = page * booksPerSubject;
                String url = "https://www.googleapis.com/books/v1/volumes?q=" + searchQuery
                           + "&maxResults=" + booksPerSubject + "&startIndex=" + startIndex
                           + "&printType=books&langRestrict=en";
                
                if (!apiKey.isEmpty()) {
                    url += "&key=" + apiKey;
                }
                
                System.out.println("Category search URL for " + subjectQuery + ": " + url);
                String response = restTemplate.getForObject(url, String.class);
                List<Book> subjectBooks = parseGoogleBooksResponse(response);
                allBooks.addAll(subjectBooks);
                
            } catch (Exception e) {
                System.err.println("Error fetching books for subject: " + subjectQuery + ", " + e.getMessage());
            }
        }
        
        // Filter by specific category and remove duplicates
        List<Book> filteredBooks = filterBooksByCategory(allBooks, category);
        List<Book> uniqueBooks = removeDuplicateBooks(filteredBooks);
        return uniqueBooks.stream().limit(size).collect(Collectors.toList());
    }
    
    private List<Book> searchBooksAcrossAllSubjects(String query, int page, int size) {
        List<Book> allBooks = new ArrayList<>();
        int booksPerSubject = Math.max(1, (size * 2) / TARGETED_SUBJECTS.length); // Get more to account for filtering
        
        for (String subjectQuery : TARGETED_SUBJECTS) {
            try {
                String searchQuery = query != null && !query.trim().isEmpty() 
                    ? query.trim().replace(" ", "+") + "+AND+" + subjectQuery
                    : subjectQuery;
                
                int startIndex = page * booksPerSubject;
                String url = "https://www.googleapis.com/books/v1/volumes?q=" + searchQuery
                           + "&maxResults=" + booksPerSubject + "&startIndex=" + startIndex
                           + "&printType=books&langRestrict=en";
                
                if (!apiKey.isEmpty()) {
                    url += "&key=" + apiKey;
                }
                
                System.out.println("Multi-subject search URL for " + subjectQuery + ": " + url);
                String response = restTemplate.getForObject(url, String.class);
                List<Book> subjectBooks = parseGoogleBooksResponse(response);
                allBooks.addAll(subjectBooks);
                
            } catch (Exception e) {
                System.err.println("Error fetching books for subject: " + subjectQuery + ", " + e.getMessage());
            }
        }
        
        // Filter by all wellness categories and remove duplicates
        List<Book> filteredBooks = filterBooksByAllCategories(allBooks);
        List<Book> uniqueBooks = removeDuplicateBooks(filteredBooks);
        return uniqueBooks.stream().limit(size).collect(Collectors.toList());
    }
    
    private List<Book> getPopularBooksFromTargetedSubjects(int page, int size) {
        List<Book> allBooks = new ArrayList<>();
        int booksPerSubject = Math.max(1, (size * 2) / TARGETED_SUBJECTS.length); // Get more to account for filtering
        
        for (String subjectQuery : TARGETED_SUBJECTS) {
            try {
                int startIndex = page * booksPerSubject;
                String url = "https://www.googleapis.com/books/v1/volumes?q=" + subjectQuery
                           + "&orderBy=relevance&maxResults=" + booksPerSubject + "&startIndex=" + startIndex
                           + "&printType=books&langRestrict=en";
                
                if (!apiKey.isEmpty()) {
                    url += "&key=" + apiKey;
                }
                
                System.out.println("Popular books URL for " + subjectQuery + ": " + url);
                String response = restTemplate.getForObject(url, String.class);
                List<Book> subjectBooks = parseGoogleBooksResponse(response);
                allBooks.addAll(subjectBooks);
                
            } catch (Exception e) {
                System.err.println("Error fetching popular books for subject: " + subjectQuery + ", " + e.getMessage());
            }
        }
        
        // Filter by wellness categories and remove duplicates
        List<Book> filteredBooks = filterBooksByAllCategories(allBooks);
        List<Book> uniqueBooks = removeDuplicateBooks(filteredBooks);
        return uniqueBooks.stream().limit(size).collect(Collectors.toList());
    }
    
    private List<Book> filterBooksByCategory(List<Book> books, String targetCategory) {
        List<Book> filteredBooks = new ArrayList<>();
        
        for (Book book : books) {
            if (book.getCategories() != null && !book.getCategories().isEmpty()) {
                for (String category : book.getCategories()) {
                    String lowerCategory = category.toLowerCase();
                    String lowerTarget = targetCategory.toLowerCase();
                    
                    // Check for exact matches or partial matches for wellness categories
                    if (lowerCategory.contains(lowerTarget) ||
                        (lowerTarget.equals("personal growth") && (lowerCategory.contains("personal development") || lowerCategory.contains("self-improvement"))) ||
                        (lowerTarget.equals("motivational") && lowerCategory.contains("motivation")) ||
                        (lowerTarget.equals("self-help") && (lowerCategory.contains("self-help") || lowerCategory.contains("self help"))) ||
                        (lowerTarget.equals("mindfulness") && (lowerCategory.contains("mindfulness") || lowerCategory.contains("meditation")))) {
                        filteredBooks.add(book);
                        break;
                    }
                }
            }
        }
        
        System.out.println("Filtered books for category '" + targetCategory + "': " + filteredBooks.size() + " from " + books.size());
        return filteredBooks;
    }
    
    private List<Book> filterBooksByAllCategories(List<Book> books) {
        // Since we're already searching targeted wellness subjects (self-help, productivity, etc.),
        // we can be more trusting of the results and do minimal filtering
        List<Book> filteredBooks = new ArrayList<>();
        
        for (Book book : books) {
            // Only exclude books with clearly non-wellness categories
            boolean shouldExclude = false;
            
            if (book.getCategories() != null && !book.getCategories().isEmpty()) {
                for (String category : book.getCategories()) {
                    String lowerCategory = category.toLowerCase();
                    // Exclude clearly non-wellness categories
                    if (lowerCategory.contains("fiction") ||
                        lowerCategory.contains("novel") ||
                        lowerCategory.contains("romance") ||
                        lowerCategory.contains("mystery") ||
                        lowerCategory.contains("fantasy") ||
                        lowerCategory.contains("science fiction") ||
                        lowerCategory.contains("cooking") ||
                        lowerCategory.contains("travel") ||
                        lowerCategory.contains("history") ||
                        lowerCategory.contains("biography") && !lowerCategory.contains("self")) {
                        shouldExclude = true;
                        break;
                    }
                }
            }
            
            if (!shouldExclude) {
                filteredBooks.add(book);
            }
        }
        
        System.out.println("Filtered books for all wellness categories: " + filteredBooks.size() + " from " + books.size());
        return filteredBooks;
    }
    
    private List<Book> removeDuplicateBooks(List<Book> books) {
        List<Book> uniqueBooks = new ArrayList<>();
        Set<String> seenIds = new HashSet<>();
        
        for (Book book : books) {
            if (book.getGoogleBooksId() != null && !seenIds.contains(book.getGoogleBooksId())) {
                seenIds.add(book.getGoogleBooksId());
                uniqueBooks.add(book);
            }
        }
        
        System.out.println("Removed duplicates: " + books.size() + " -> " + uniqueBooks.size() + " unique books");
        return uniqueBooks;
    }
    
    private List<Book> parseGoogleBooksResponse(String response) throws Exception {
        List<Book> books = new ArrayList<>();
        
        if (response == null || response.trim().isEmpty()) {
            System.err.println("Empty response from Google Books API");
            return books;
        }
        
        JsonNode root = objectMapper.readTree(response);
        JsonNode items = root.get("items");
        
        if (items != null && items.isArray()) {
            for (JsonNode item : items) {
                try {
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
                } catch (Exception e) {
                    System.err.println("Error parsing individual book: " + e.getMessage());
                }
            }
        }
        
        return books;
    }
    
    private String getTextValue(JsonNode node, String fieldName) {
        JsonNode field = node.get(fieldName);
        return field != null ? field.asText() : null;
    }
    
    public List<String> getWellnessSubjects() {
        return WELLNESS_CATEGORIES;
    }
}