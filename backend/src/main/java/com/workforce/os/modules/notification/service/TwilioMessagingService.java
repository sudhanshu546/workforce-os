package com.workforce.os.modules.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;

@Service
@Slf4j
@ConditionalOnProperty(name = "application.messaging.provider", havingValue = "TWILIO")
public class TwilioMessagingService implements MessagingService {

    @Value("${application.messaging.twilio.account-sid}")
    private String accountSid;

    @Value("${application.messaging.twilio.auth-token}")
    private String authToken;

    @Value("${application.messaging.twilio.from-number}")
    private String fromNumber;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void sendMessage(String to, String message) {
        String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        String auth = accountSid + ":" + authToken;
        byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes());
        headers.set("Authorization", "Basic " + new String(encodedAuth));

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("To", to);
        map.add("From", fromNumber);
        map.add("Body", message);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            restTemplate.postForEntity(url, request, String.class);
            log.info("SMS sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send SMS via Twilio to {}: {}", to, e.getMessage());
        }
    }
}
