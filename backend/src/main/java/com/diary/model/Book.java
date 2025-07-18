package com.diary.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "books")
public class Book {
    @Id
    private String googleBooksId;
    
    @Column(length = 1000) // Increased from default 255
    private String title;
    
    @Column(length = 1000) // Increased from default 255
    private String subtitle;
    
    @ElementCollection
    @CollectionTable(name = "book_authors", joinColumns = @JoinColumn(name = "book_id"))
    @Column(name = "author", length = 500) // Increased from default 255
    private List<String> authors;
    
    @Column(length = 500) // Increased from default 255
    private String publisher;
    
    private String publishedDate;
    
    @Column(columnDefinition = "TEXT") // Allow unlimited length for descriptions
    private String description;
    
    @Column(length = 1000) // Increased from default 255
    private String thumbnail;
    
    @Column(length = 1000) // Increased from default 255
    private String previewLink;
    
    @ElementCollection
    @CollectionTable(name = "book_categories", joinColumns = @JoinColumn(name = "book_id"))
    @Column(name = "category", length = 500) // Increased from default 255
    private List<String> categories;
    
    private Double averageRating;
    private Integer ratingsCount;
    private Boolean isSaved = false;
    
    // Constructors
    public Book() {}
    
    // Getters and Setters
    public String getGoogleBooksId() { return googleBooksId; }
    public void setGoogleBooksId(String googleBooksId) { this.googleBooksId = googleBooksId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }
    
    public List<String> getAuthors() { return authors; }
    public void setAuthors(List<String> authors) { this.authors = authors; }
    
    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }
    
    public String getPublishedDate() { return publishedDate; }
    public void setPublishedDate(String publishedDate) { this.publishedDate = publishedDate; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }
    
    public String getPreviewLink() { return previewLink; }
    public void setPreviewLink(String previewLink) { this.previewLink = previewLink; }
    
    public List<String> getCategories() { return categories; }
    public void setCategories(List<String> categories) { this.categories = categories; }
    
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    
    public Integer getRatingsCount() { return ratingsCount; }
    public void setRatingsCount(Integer ratingsCount) { this.ratingsCount = ratingsCount; }
    
    public Boolean getIsSaved() { 
        return isSaved != null ? isSaved : false; 
    }
    
    public void setIsSaved(Boolean isSaved) { 
        this.isSaved = isSaved != null ? isSaved : false; 
    }
}