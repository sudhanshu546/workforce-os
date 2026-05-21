package com.workforce.os.common.service;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final FileStorageProvider fileStorageProvider;

    public String storeFile(MultipartFile file) {
        return fileStorageProvider.storeFile(file);
    }

    public Resource loadFileAsResource(String fileName) {
        return fileStorageProvider.loadFileAsResource(fileName);
    }
}
