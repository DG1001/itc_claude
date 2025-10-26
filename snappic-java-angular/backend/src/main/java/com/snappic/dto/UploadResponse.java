package com.snappic.dto;

public class UploadResponse {
    private boolean success;
    private String message;
    private String error;
    
    public UploadResponse() {}
    
    public UploadResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public static UploadResponse success(String message) {
        return new UploadResponse(true, message);
    }
    
    public static UploadResponse error(String error) {
        UploadResponse response = new UploadResponse();
        response.success = false;
        response.error = error;
        return response;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
}