package com.workforce.os.modules.notification.dto;

import lombok.Data;

@Data
public class SubscriptionRequest {
    private String endpoint;
    private Keys keys;

    @Data
    public static class Keys {
        private String p256dh;
        private String auth;
    }
}
