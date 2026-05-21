package com.workforce.os.modules.chat.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.chat.domain.ChatMessage;
import com.workforce.os.modules.chat.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatMessageRepository chatMessageRepository;

    @GetMapping("/history/{conversationId}")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getHistory(@PathVariable String conversationId) {
        return ResponseEntity.ok(ApiResponse.success(
                chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId),
                "History retrieved"
        ));
    }
}
