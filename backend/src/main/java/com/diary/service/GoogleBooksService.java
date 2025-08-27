package com.diary.service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
    
    private static final String[] TARGET_SUBJECTS = {
        "mindfulness", "motivation", "self-help"
    };
    
    public List<Book> searchBooksAdvanced(String descriptionQuery, String titleQuery, String authorQuery, int page, int size) {
        try {
            List<Book> allBooks = new ArrayList<>();
            
            for (String subject : TARGET_SUBJECTS) {
                try {
                    String query = buildSubjectQuery(subject, titleQuery, authorQuery);
                    List<Book> subjectBooks = fetchBooksFromAPI(query, page, size / TARGET_SUBJECTS.length);
                    allBooks.addAll(subjectBooks);
                } catch (Exception e) {
                    System.err.println("Error fetching books for subject: " + subject + ", " + e.getMessage());
                }
            }
            
            List<Book> uniqueBooks = removeDuplicateBooks(allBooks);
            
            if (descriptionQuery != null && !descriptionQuery.trim().isEmpty()) {
                uniqueBooks = filterBooksByDescription(uniqueBooks, descriptionQuery.trim());
            }
            
            return uniqueBooks.stream().limit(size).collect(Collectors.toList());
            
        } catch (Exception e) {
            System.err.println("Error in advanced search: " + e.getMessage());
            throw new RuntimeException("Error searching books: " + e.getMessage());
        }
    }
    
    public List<Book> getPopularBooks(int page, int size) {
        try {
            List<Book> allBooks = new ArrayList<>();
            
            for (String subject : TARGET_SUBJECTS) {
                try {
                    String query = "subject:" + subject;
                    List<Book> subjectBooks = fetchBooksFromAPI(query, page, size / TARGET_SUBJECTS.length);
                    allBooks.addAll(subjectBooks);
                } catch (Exception e) {
                    System.err.println("Error fetching popular books for subject: " + subject + ", " + e.getMessage());
                }
            }
            
            List<Book> uniqueBooks = removeDuplicateBooks(allBooks);
            return uniqueBooks.stream().limit(size).collect(Collectors.toList());
            
        } catch (Exception e) {
            System.err.println("Error fetching popular books: " + e.getMessage());
            throw new RuntimeException("Error fetching popular books: " + e.getMessage());
        }
    }
    
    private String buildSubjectQuery(String subject, String titleQuery, String authorQuery) throws UnsupportedEncodingException {
        StringBuilder query = new StringBuilder();
        query.append("subject:").append(subject);
        
        if (titleQuery != null && !titleQuery.trim().isEmpty()) {
            query.append("+intitle:").append(URLEncoder.encode(titleQuery.trim(), "UTF-8"));
        }
        
        if (authorQuery != null && !authorQuery.trim().isEmpty()) {
            query.append("+inauthor:").append(URLEncoder.encode(authorQuery.trim(), "UTF-8"));
        }
        
        return query.toString();
    }
    
    private List<Book> fetchBooksFromAPI(String query, int page, int maxResults) {
        try {
            maxResults = Math.max(maxResults, 10);
            int startIndex = page * maxResults;
            
            String url = "https://www.googleapis.com/books/v1/volumes?q=" + query
                       + "&maxResults=" + maxResults + "&startIndex=" + startIndex
                       + "&printType=books&langRestrict=en";
            
            if (!apiKey.isEmpty()) {
                url += "&key=" + apiKey;
            }
            
            System.out.println("API URL: " + url);
            String response = restTemplate.getForObject(url, String.class);
            return parseGoogleBooksResponse(response);
            
        } catch (Exception e) {
            System.err.println("Error fetching from API: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    private List<Book> filterBooksByDescription(List<Book> books, String descriptionQuery) {
        List<Book> filteredBooks = new ArrayList<>();
        String[] searchTerms = descriptionQuery.toLowerCase().split("\\s+");
        
        for (Book book : books) {
            if (book.getDescription() != null && !book.getDescription().trim().isEmpty()) {
                String description = book.getDescription().toLowerCase();
                
                boolean matches = false;
                for (String term : searchTerms) {
                    if (description.contains(term.toLowerCase())) {
                        matches = true;
                        break;
                    }
                }
                
                if (matches) {
                    filteredBooks.add(book);
                }
            }
        }
        
        System.out.println("Filtered by description '" + descriptionQuery + "': " + filteredBooks.size() + " from " + books.size());
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
        
        return uniqueBooks;
    }
    
    private List<Book> parseGoogleBooksResponse(String response) throws Exception {
        List<Book> books = new ArrayList<>();
        
        if (response == null || response.trim().isEmpty()) {
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
                        
                        JsonNode authors = volumeInfo.get("authors");
                        if (authors != null && authors.isArray()) {
                            List<String> authorList = new ArrayList<>();
                            for (JsonNode author : authors) {
                                authorList.add(author.asText());
                            }
                            book.setAuthors(authorList);
                        }
                        
                        JsonNode categories = volumeInfo.get("categories");
                        if (categories != null && categories.isArray()) {
                            List<String> categoryList = new ArrayList<>();
                            for (JsonNode category : categories) {
                                categoryList.add(category.asText());
                            }
                            book.setCategories(categoryList);
                        }
                        
                        JsonNode imageLinks = volumeInfo.get("imageLinks");
                        if (imageLinks != null) {
                            book.setThumbnail(getTextValue(imageLinks, "thumbnail"));
                        }
                        
                        book.setPreviewLink(getTextValue(volumeInfo, "previewLink"));
                        
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
        return Arrays.asList(TARGET_SUBJECTS);
    }
}