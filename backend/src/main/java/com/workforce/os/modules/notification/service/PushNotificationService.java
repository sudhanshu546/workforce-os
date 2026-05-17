package com.workforce.os.modules.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workforce.os.modules.notification.domain.PushSubscription;
import com.workforce.os.modules.notification.repository.PushSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.security.Security;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PushNotificationService {

    private final PushSubscriptionRepository repository;
    private final ObjectMapper objectMapper;

    @Value("${vapid.public.key}")
    private String publicKey;

    @Value("${vapid.private.key}")
    private String privateKey;

    @Value("${vapid.subject}")
    private String subject;

    private PushService pushService;

    @PostConstruct
    public void init() {
        Security.addProvider(new BouncyCastleProvider());
        try {
            pushService = new PushService(publicKey, privateKey, subject);
        } catch (Exception e) {
            log.error("Failed to initialize PushService", e);
        }
    }

    public void sendPush(Long userId, String title, String body, String url) {
        List<PushSubscription> subscriptions = repository.findByUserId(userId);
        
        Map<String, String> payload = new HashMap<>();
        payload.put("title", title);
        payload.put("body", body);
        payload.put("url", url);

        try {
            String payloadJson = objectMapper.writeValueAsString(payload);
            
            for (PushSubscription sub : subscriptions) {
                try {
                    Notification notification = new Notification(
                        sub.getEndpoint(),
                        sub.getP256dh(),
                        sub.getAuth(),
                        payloadJson
                    );
                    pushService.send(notification);
                } catch (Exception e) {
                    log.warn("Failed to send push to endpoint: {}", sub.getEndpoint());
                    // If 410 Gone, remove subscription
                    if (e.getMessage() != null && e.getMessage().contains("410")) {
                        repository.delete(sub);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to serialize push payload", e);
        }
    }
}
