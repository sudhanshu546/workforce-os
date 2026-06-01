package com.workforce.os.modules.operations.service;

import com.workforce.os.common.exception.BusinessException;
import com.workforce.os.common.exception.ResourceNotFoundException;
import com.workforce.os.modules.operations.domain.Review;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.operations.dto.ReviewRequest;
import com.workforce.os.modules.operations.repository.ReviewRepository;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.workforce.os.common.util.MessageConstants.WORK_ORDER_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final WorkOrderRepository workOrderRepository;
    private final com.workforce.os.modules.workforce.service.GamificationService gamificationService;
    private final SentimentAnalysisService sentimentAnalysisService;

    @Transactional
    public Review submitReview(ReviewRequest request) {
        WorkOrder workOrder = workOrderRepository.findById(request.getWorkOrderId())
                .orElseThrow(() -> new ResourceNotFoundException(WORK_ORDER_NOT_FOUND));

        if (workOrder.getStatus() != WorkOrder.WorkOrderStatus.COMPLETED) {
            throw new BusinessException("Review can only be submitted for completed orders");
        }

        if (reviewRepository.findByWorkOrderId(workOrder.getId()).isPresent()) {
            throw new BusinessException("Review already exists for this order");
        }

        Review review = Review.builder()
                .workOrder(workOrder)
                .customer(workOrder.getCustomer())
                .worker(workOrder.getAssignedWorker())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        
        review.setTenantId(workOrder.getTenantId());

        // New AI-driven sentiment analysis
        sentimentAnalysisService.analyzeReview(review);

        Review saved = reviewRepository.save(review);
        gamificationService.awardPointsForReview(saved);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Review> getWorkerReviews(Long workerId) {
        return reviewRepository.findByWorkerId(workerId);
    }

    @Transactional(readOnly = true)
    public Double getAverageRating(Long workerId) {
        List<Review> reviews = reviewRepository.findByWorkerId(workerId);
        if (reviews.isEmpty()) return 5.0; // Default high rating for new workers
        return reviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
    }

    public com.workforce.os.modules.operations.dto.SentimentInsightDTO getSentimentInsights() {
        String tenantId = com.workforce.os.common.context.TenantContext.getCurrentTenant();
        List<Review> allReviews = reviewRepository.findAll().stream()
            .filter(r -> tenantId.equals(r.getTenantId()))
            .toList();

        if (allReviews.isEmpty()) {
            return com.workforce.os.modules.operations.dto.SentimentInsightDTO.builder()
                .overallSentimentScore(0.0)
                .reviewsAnalyzed(0L)
                .criticalReviews(0L)
                .issueDistribution(java.util.Collections.emptyMap())
                .build();
        }

        double avgSentiment = allReviews.stream()
            .mapToDouble(r -> r.getSentimentScore() != null ? r.getSentimentScore() : 0.0)
            .average().orElse(0.0);

        java.util.Map<String, Long> distribution = allReviews.stream()
            .flatMap(r -> r.getIdentifiedIssues().stream())
            .collect(java.util.stream.Collectors.groupingBy(java.util.function.Function.identity(), java.util.stream.Collectors.counting()));

        long criticalCount = allReviews.stream()
            .filter(r -> !r.getIdentifiedIssues().isEmpty())
            .count();

        return com.workforce.os.modules.operations.dto.SentimentInsightDTO.builder()
            .overallSentimentScore(avgSentiment)
            .reviewsAnalyzed((long) allReviews.size())
            .criticalReviews(criticalCount)
            .issueDistribution(distribution)
            .build();
    }
}
