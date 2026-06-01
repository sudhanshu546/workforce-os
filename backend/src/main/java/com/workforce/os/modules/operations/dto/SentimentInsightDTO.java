package com.workforce.os.modules.operations.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class SentimentInsightDTO {
    private Double overallSentimentScore; // Average sentiment
    private Map<String, Long> issueDistribution; // count of each issue type
    private Long reviewsAnalyzed;
    private Long criticalReviews; // count of reviews with issues
}
