package com.workforce.os.modules.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private Long id;
    private String senderId;
    private String senderName;
    private String senderRole;
    private String recipientId;
    private String content;
    private String conversationId;
    private boolean isRead;
    private LocalDateTime createdAt;
}
