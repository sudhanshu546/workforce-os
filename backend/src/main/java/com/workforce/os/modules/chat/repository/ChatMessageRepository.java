package com.workforce.os.modules.chat.repository;

import com.workforce.os.modules.chat.domain.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    @Query("SELECT m FROM ChatMessage m WHERE m.id IN (SELECT MAX(m2.id) FROM ChatMessage m2 WHERE m2.senderId = :userId OR m2.recipientId = :userId GROUP BY m2.conversationId) ORDER BY m.createdAt DESC")
    List<ChatMessage> findLatestMessagesPerConversation(@Param("userId") String userId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.recipientId = :userId AND m.isRead = false")
    long countUnreadMessages(@Param("userId") String userId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.recipientId = :userId AND m.conversationId = :conversationId AND m.isRead = false")
    long countUnreadByConversation(@Param("userId") String userId, @Param("conversationId") String conversationId);
}
