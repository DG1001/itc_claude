package com.snappic.controller;

import com.snappic.dto.ImageDto;
import com.snappic.dto.UploadResponse;
import com.snappic.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ImageController {
    
    @Autowired
    private ImageService imageService;
    
    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> uploadImage(
            @RequestParam("image") MultipartFile file,
            @RequestParam(value = "comment", required = false) String comment) {
        
        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(UploadResponse.error("No image file provided"));
        }
        
        if (!imageService.isAllowedExtension(file.getOriginalFilename())) {
            return ResponseEntity.badRequest()
                .body(UploadResponse.error("Invalid file format. Use JPG, PNG, or WEBP"));
        }
        
        if (file.getSize() > 5 * 1024 * 1024) { // 5MB
            return ResponseEntity.badRequest()
                .body(UploadResponse.error("File too large. Maximum size is 5MB"));
        }
        
        if (comment != null && comment.length() > 100) {
            return ResponseEntity.badRequest()
                .body(UploadResponse.error("Comment too long (max 100 characters)"));
        }
        
        try {
            String filename = imageService.saveImage(
                file.getBytes(), 
                file.getOriginalFilename(), 
                comment != null ? comment.trim() : ""
            );
            
            return ResponseEntity.ok(UploadResponse.success("Image uploaded successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(UploadResponse.error("Failed to save image"));
        }
    }
    
    @GetMapping("/images")
    public ResponseEntity<List<ImageDto>> getImages() {
        List<ImageDto> images = imageService.getImagesWithState();
        return ResponseEntity.ok(images);
    }
    
    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("uploads").resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() || resource.isReadable()) {
                String contentType = "application/octet-stream";
                if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (filename.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                } else if (filename.toLowerCase().endsWith(".webp")) {
                    contentType = "image/webp";
                }
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}