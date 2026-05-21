package com.workforce.os.modules.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@ConditionalOnProperty(name = "application.messaging.provider", havingValue = "NONE", matchIfMissing = true)
public class MockMessagingService implements MessagingService {

    @Override
    public void sendMessage(String to, String message) {
        log.info("[MOCK SMS] To: {}, Message: {}", to, message);
    }
}
