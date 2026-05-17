package com.workforce.os.modules.notification.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponseDTO {
    private Long id;
    private String title;
    private String body;
    private String route;
    private boolean read;
    private LocalDateTime createdAt;
}
