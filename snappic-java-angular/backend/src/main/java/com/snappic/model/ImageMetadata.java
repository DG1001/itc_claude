package com.snappic.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class ImageMetadata {
    private String filename;
    private String comment;
    private LocalDateTime timestamp;
    
    public ImageMetadata() {}
    
    public ImageMetadata(String filename, String comment, LocalDateTime timestamp) {
        this.filename = filename;
        this.comment = comment;
        this.timestamp = timestamp;
    }
    
    public String getFilename() {
        return filename;
    }
    
    public void setFilename(String filename) {
        this.filename = filename;
    }
    
    public String getComment() {
        return comment;
    }
    
    public void setComment(String comment) {
        this.comment = comment;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}