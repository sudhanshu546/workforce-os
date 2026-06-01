package com.workforce.os.modules.operations.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.operations.dto.ReviewRequest;
import com.workforce.os.modules.operations.dto.ReviewResponseDTO;
import com.workforce.os.modules.operations.mapper.WorkOrderMapper;
import com.workforce.os.modules.operations.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;
    private final WorkOrderMapper workOrderMapper;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> submitReview(@RequestBody ReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            workOrderMapper.toReviewDTO(reviewService.submitReview(request)),
            "Review submitted successfully"
        ));
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<ApiResponse<List<ReviewResponseDTO>>> getWorkerReviews(@PathVariable Long workerId) {
        List<ReviewResponseDTO> reviews = reviewService.getWorkerReviews(workerId).stream()
            .map(workOrderMapper::toReviewDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(reviews, "Worker reviews retrieved"));
    }

    @GetMapping("/worker/{workerId}/rating")
    public ResponseEntity<ApiResponse<Double>> getAverageRating(@PathVariable Long workerId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getAverageRating(workerId), "Average rating retrieved"));
    }

    @GetMapping("/insights")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<com.workforce.os.modules.operations.dto.SentimentInsightDTO>> getSentimentInsights() {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getSentimentInsights(), "Sentiment insights retrieved"));
    }
}
