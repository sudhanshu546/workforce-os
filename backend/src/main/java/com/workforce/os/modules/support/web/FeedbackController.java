package com.workforce.os.modules.support.web;

import com.workforce.os.modules.support.service.FeedbackService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
public class FeedbackController {
    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<Void> submitFeedback(@RequestBody FeedbackRequest request) {
        feedbackService.submitFeedback(request.getWorkOrderId(), request.getCustomerId(), request.getRating(), request.getComments());
        return ResponseEntity.ok().build();
    }

    @Data
    public static class FeedbackRequest {
        private Long workOrderId;
        private Long customerId;
        private Integer rating;
        private String comments;
    }
}
