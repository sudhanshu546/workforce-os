package com.workforce.os.modules.identity.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {
    private final StringRedisTemplate redisTemplate;
    private static final String BLACKLIST_PREFIX = "jwt_blacklist:";

    public void blacklistToken(String token, long expirationMs) {
        if (expirationMs > 0) {
            redisTemplate.opsForValue().set(
                BLACKLIST_PREFIX + token, 
                "revoked", 
                expirationMs, 
                TimeUnit.MILLISECONDS
            );
        }
    }

    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token));
    }
}
