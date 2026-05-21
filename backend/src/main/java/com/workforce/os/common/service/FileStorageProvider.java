package com.workforce.os.common.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageProvider {
    String storeFile(MultipartFile file);
    Resource loadFileAsResource(String fileName);
}
