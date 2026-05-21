package com.workforce.os.modules.notification.web;

import com.workforce.os.modules.notification.service.MessagingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/test/messaging")
@RequiredArgsConstructor
public class MessagingTestController {

    private final MessagingService messagingService;

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendTestMessage(
            @RequestParam String to,
            @RequestParam String message) {
        
        messagingService.sendMessage(to, message);
        return ResponseEntity.ok(Map.of("status", "Message request sent", "to", to));
    }
}
