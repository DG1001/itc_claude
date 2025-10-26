package com.snappic.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ImageDto {
    private String filename;
    private String comment;
    private String timestamp;
    private double age;
    private String state;
    private String url;
    
    public ImageDto() {}
    
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
    
    public String getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
    
    @JsonProperty("age")
    public double getAge() {
        return age;
    }
    
    public void setAge(double age) {
        this.age = age;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public String getUrl() {
        return url;
    }
    
    public void setUrl(String url) {
        this.url = url;
    }
}