package com.workforce.os.modules.chat.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.chat.domain.ChatMessage;
import com.workforce.os.modules.chat.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.workforce.os.common.util.MessageConstants.*;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatRestController {

    private final ChatMessageRepository chatMessageRepository;
    private final com.workforce.os.modules.chat.mapper.ChatMapper chatMapper;

    @GetMapping("/history/{conversationId}")
    public ResponseEntity<ApiResponse<List<com.workforce.os.modules.chat.dto.ChatMessageDTO>>> getHistory(@PathVariable String conversationId) {
        List<com.workforce.os.modules.chat.dto.ChatMessageDTO> history = chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(chatMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(history, CHAT_HISTORY_RETRIEVED));
    }

    @GetMapping("/conversations/{userId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getConversations(@PathVariable String userId) {
        log.info("Fetching conversations for userId: {}", userId);
        List<ChatMessage> latestMessages = chatMessageRepository.findLatestMessagesPerConversation(userId);
        log.info("Found {} conversations for userId: {}", latestMessages.size(), userId);
        
        List<Map<String, Object>> summaries = latestMessages.stream().map(msg -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("conversationId", msg.getConversationId());
            map.put("lastMessage", msg.getContent());
            map.put("timestamp", msg.getCreatedAt());
            map.put("unreadCount", chatMessageRepository.countUnreadByConversation(userId, msg.getConversationId()));
            
            // Determine other participant
            if (msg.getSenderId().equals(userId)) {
                map.put("participantId", msg.getRecipientId());
                map.put("participantName", "User " + msg.getRecipientId()); // Fallback
            } else {
                map.put("participantId", msg.getSenderId());
                map.put("participantName", msg.getSenderName());
                map.put("participantRole", msg.getSenderRole());
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(summaries, CONVERSATIONS_RETRIEVED));
    }

    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(chatMessageRepository.countUnreadMessages(userId), UNREAD_COUNT_RETRIEVED));
    }

    @PatchMapping("/read/{conversationId}/{userId}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable String conversationId, @PathVariable String userId) {
        List<ChatMessage> unread = chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .filter(m -> m.getRecipientId().equals(userId) && !m.isRead())
                .collect(Collectors.toList());
        
        unread.forEach(m -> m.setRead(true));
        chatMessageRepository.saveAll(unread);
        return ResponseEntity.ok(ApiResponse.success(null, CHAT_MARKED_READ));
    }
}
