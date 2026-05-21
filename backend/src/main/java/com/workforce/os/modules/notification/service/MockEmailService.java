package com.workforce.os.modules.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@ConditionalOnProperty(name = "application.messaging.email-provider", havingValue = "NONE", matchIfMissing = true)
public class MockEmailService implements EmailService {

    @Override
    public void sendEmail(String to, String subject, String body) {
        log.info("[MOCK EMAIL] To: {}, Subject: {}, Body: {}", to, subject, body);
    }
}
