package com.workforce.os.common.web;

import com.workforce.os.common.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }
        
        try {
            String fileName = fileStorageService.storeFile(file);
            String fileUrl = fileName.startsWith("http") ? fileName : "/api/v1/files/download/" + fileName;
            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        Resource resource = fileStorageService.loadFileAsResource(fileName);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG) // Assuming images for now
                .body(resource);
    }
}
