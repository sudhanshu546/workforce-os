package com.workforce.os.common.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.util.Objects;
import java.util.UUID;

//@Service
@Slf4j
@ConditionalOnProperty(name = "application.storage.type", havingValue = "S3")
public class S3FileStorageProvider implements FileStorageProvider {

    @Value("${application.messaging.aws.access-key}")
    private String accessKey;

    @Value("${application.messaging.aws.secret-key}")
    private String secretKey;

    @Value("${application.messaging.aws.region}")
    private String region;

    @Value("${application.storage.aws.bucket-name}")
    private String bucketName;

    private S3Client s3Client;

    @PostConstruct
    public void init() {
        s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }

    @Override
    public String storeFile(MultipartFile file) {
        String fileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = "";
        int i = fileName.lastIndexOf('.');
        if (i > 0) {
            extension = fileName.substring(i);
        }
        String newFileName = UUID.randomUUID().toString() + extension;

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(newFileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            
            // Return the public URL or just the file name
            return s3Client.utilities().getUrl(GetUrlRequest.builder().bucket(bucketName).key(newFileName).build()).toString();
        } catch (IOException e) {
            throw new RuntimeException("Could not store file to S3", e);
        }
    }

    @Override
    public Resource loadFileAsResource(String fileName) {
        // For S3, fileName might already be a full URL if stored that way
        try {
            return new UrlResource(fileName);
        } catch (IOException e) {
            throw new RuntimeException("Could not load file from S3 URL: " + fileName, e);
        }
    }

    @PreDestroy
    public void cleanup() {
        if (s3Client != null) {
            s3Client.close();
        }
    }
}
