package com.workforce.os.modules.chat.domain;

import com.workforce.os.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "chat_messages")
public class ChatMessage extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String senderId;
    private String senderName;
    private String senderRole;
    private String recipientId;
    private String content;
    private String conversationId; // ID to group messages
    private boolean isRead = false;
}
