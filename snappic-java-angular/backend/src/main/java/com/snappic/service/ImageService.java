package com.snappic.service;

import com.snappic.dto.ImageDto;
import com.snappic.model.ImageMetadata;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class ImageService {
    
    @Value("${app.upload.dir}")
    private String uploadDir;
    
    @Value("${app.max.images}")
    private int maxImages;
    
    @Value("${app.image.display.seconds}")
    private int displaySeconds;
    
    @Value("${app.image.fadeout.seconds}")
    private int fadeoutSeconds;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Path dataFilePath;
    private final Path uploadPath;
    private final Object fileLock = new Object();
    
    public ImageService() {
        this.dataFilePath = Paths.get("data.json");
        this.uploadPath = Paths.get("uploads");
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create upload directory", e);
        }
    }
    
    public List<ImageMetadata> loadImages() {
        synchronized (fileLock) {
            try {
                if (!Files.exists(dataFilePath)) {
                    return new ArrayList<>();
                }
                return objectMapper.readValue(dataFilePath.toFile(), 
                    new TypeReference<List<ImageMetadata>>() {});
            } catch (IOException e) {
                return new ArrayList<>();
            }
        }
    }
    
    private void saveImages(List<ImageMetadata> images) {
        synchronized (fileLock) {
            try {
                objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValue(dataFilePath.toFile(), images);
            } catch (IOException e) {
                throw new RuntimeException("Failed to save images", e);
            }
        }
    }
    
    public String saveImage(byte[] imageData, String originalFilename, String comment) {
        String extension = getFileExtension(originalFilename);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            .replace(":", "-").replace(".", "-");
        String filename = timestamp + "-" + UUID.randomUUID().toString().substring(0, 8) + "." + extension;
        
        try {
            Path filePath = uploadPath.resolve(filename);
            Files.write(filePath, imageData);
            
            List<ImageMetadata> images = loadImages();
            ImageMetadata newImage = new ImageMetadata(filename, comment, LocalDateTime.now());
            images.add(newImage);
            
            // Enforce FIFO
            while (images.size() > maxImages) {
                ImageMetadata oldImage = images.remove(0);
                Path oldFilePath = uploadPath.resolve(oldImage.getFilename());
                try {
                    Files.deleteIfExists(oldFilePath);
                } catch (IOException e) {
                    // Log error but continue
                }
            }
            
            saveImages(images);
            return filename;
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
    }
    
    public List<ImageDto> getImagesWithState() {
        List<ImageMetadata> images = loadImages();
        LocalDateTime now = LocalDateTime.now();
        List<ImageDto> result = new ArrayList<>();
        
        for (ImageMetadata image : images) {
            long ageSeconds = ChronoUnit.SECONDS.between(image.getTimestamp(), now);
            
            String state;
            if (ageSeconds <= displaySeconds) {
                state = "visible";
            } else if (ageSeconds <= displaySeconds + fadeoutSeconds) {
                state = "fading";
            } else {
                continue; // Will be cleaned up
            }
            
            ImageDto dto = new ImageDto();
            dto.setFilename(image.getFilename());
            dto.setComment(image.getComment());
            dto.setTimestamp(image.getTimestamp().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            dto.setAge(ageSeconds);
            dto.setState(state);
            dto.setUrl("/uploads/" + image.getFilename());
            
            result.add(dto);
        }
        
        return result;
    }
    
    @Scheduled(fixedDelay = 1000)
    @Async
    public void cleanupExpiredImages() {
        List<ImageMetadata> images = loadImages();
        LocalDateTime now = LocalDateTime.now();
        boolean updated = false;
        
        List<ImageMetadata> toRemove = new ArrayList<>();
        for (ImageMetadata image : images) {
            long ageSeconds = ChronoUnit.SECONDS.between(image.getTimestamp(), now);
            if (ageSeconds > displaySeconds + fadeoutSeconds) {
                toRemove.add(image);
                Path filePath = uploadPath.resolve(image.getFilename());
                try {
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    // Log error but continue
                }
                updated = true;
            }
        }
        
        if (updated) {
            images.removeAll(toRemove);
            saveImages(images);
        }
    }
    
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "jpg";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
    
    public boolean isAllowedExtension(String filename) {
        String extension = getFileExtension(filename);
        return List.of("jpg", "jpeg", "png", "webp").contains(extension);
    }
}