package com.workforce.os.common.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitService {

    // Simple in-memory storage for demonstration. 
    // For production scaling, this would typically use Redis (Bucket4j-redis)
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String key) {
        return buckets.computeIfAbsent(key, this::newBucket);
    }

    private Bucket newBucket(String key) {
        // Limit: 50 requests per minute
        return Bucket.builder()
                .addLimit(Bandwidth.classic(50, Refill.intervally(50, Duration.ofMinutes(1))))
                .build();
    }
}
