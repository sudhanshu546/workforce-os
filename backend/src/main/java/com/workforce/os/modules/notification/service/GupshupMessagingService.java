package com.workforce.os.modules.notification.service;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;

@Service
@Slf4j
@ConditionalOnProperty(name = "application.messaging.provider", havingValue = "GUPSHUP")
public class GupshupMessagingService implements MessagingService {

    @Value("${application.messaging.gupshup.client-id}")
    private String clientId;

    @Value("${application.messaging.gupshup.client-secret}")
    private String clientSecret;

    @Value("${application.messaging.gupshup.app-id}")
    private String appId;

    private final RestTemplate restTemplate = new RestTemplate();
    
    private String cachedToken;
    private Instant tokenExpiry;

    @Override
    @io.github.resilience4j.bulkhead.annotation.Bulkhead(name = "gupshupService")
    public void sendMessage(String to, String message) {
        String token = getAccessToken();
        if (token == null) {
            log.error("Cannot send message: Failed to obtain Gupshup access token");
            return;
        }

        // Using Gupshup V3 Messaging API
        String url = "https://partner.gupshup.io/partner/app/" + appId + "/v3/message";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Standard WhatsApp V3 payload
        String payload = String.format(
            "{\"messaging_product\":\"whatsapp\",\"recipient_type\":\"individual\",\"to\":\"%s\",\"type\":\"text\",\"text\":{\"body\":\"%s\"}}",
            to, message
        );

        HttpEntity<String> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Message sent via Gupshup V3 to {}", to);
            } else {
                log.error("Gupshup API returned error: {}", response.getBody());
            }
        } catch (Exception e) {
            log.error("Failed to send message via Gupshup V3 to {}: {}", to, e.getMessage());
        }
    }

    private synchronized String getAccessToken() {
        if (cachedToken != null && tokenExpiry != null && Instant.now().isBefore(tokenExpiry.minusSeconds(60))) {
            return cachedToken;
        }

        log.info("Fetching new Gupshup access token...");
        String url = "https://partner.gupshup.io/partner/account/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        try {
            TokenResponse response = restTemplate.postForObject(url, request, TokenResponse.class);
            if (response != null && response.getAccess_token() != null) {
                this.cachedToken = response.getAccess_token();
                this.tokenExpiry = Instant.now().plusSeconds(response.getExpires_in());
                return cachedToken;
            }
        } catch (Exception e) {
            log.error("Failed to fetch Gupshup token: {}", e.getMessage());
        }
        return null;
    }

    @Data
    private static class TokenResponse {
        private String access_token;
        private String token_type;
        private long expires_in;
    }
}
