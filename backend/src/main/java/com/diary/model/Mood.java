package com.diary.model;

public enum Mood {
    VERY_HAPPY("😄", "Very Happy"),
    HAPPY("😊", "Happy"),
    NEUTRAL("😐", "Neutral"),
    SAD("😢", "Sad"),
    VERY_SAD("😭", "Very Sad"),
    ANGRY("😠", "Angry"),
    ANXIOUS("😰", "Anxious"),
    EXCITED("🤩", "Excited"),
    GRATEFUL("🙏", "Grateful"),
    PEACEFUL("😌", "Peaceful");
    
    private final String emoji;
    private final String description;
    
    Mood(String emoji, String description) {
        this.emoji = emoji;
        this.description = description;
    }
    
    public String getEmoji() { return emoji; }
    public String getDescription() { return description; }
}