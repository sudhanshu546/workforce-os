package com.workforce.os.modules.operations.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.operations.domain.Review;
import com.workforce.os.modules.operations.dto.ReviewRequest;
import com.workforce.os.modules.operations.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Review>> submitReview(@RequestBody ReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.submitReview(request), "Review submitted successfully"));
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<ApiResponse<List<Review>>> getWorkerReviews(@PathVariable Long workerId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getWorkerReviews(workerId), "Worker reviews retrieved"));
    }

    @GetMapping("/worker/{workerId}/rating")
    public ResponseEntity<ApiResponse<Double>> getAverageRating(@PathVariable Long workerId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getAverageRating(workerId), "Average rating retrieved"));
    }
}
