package com.workforce.os.modules.operations.service;

import com.workforce.os.modules.operations.domain.Review;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@Slf4j
public class SentimentAnalysisService {

    /**
     * Analyzes review comment for sentiment score and identifies "Hidden Issues"
     * In a production environment, this would call an LLM (Gemini/OpenAI) or a dedicated NLP service.
     */
    public void analyzeReview(Review review) {
        String comment = review.getComment();
        if (comment == null || comment.isBlank()) {
            review.setSentimentScore(0.0);
            return;
        }

        String lowerComment = comment.toLowerCase();
        Set<String> issues = new HashSet<>();
        double score = 0.0;

        // 1. Punctuality Analysis
        if (lowerComment.contains("late") || lowerComment.contains("delayed") || lowerComment.contains("wait")) {
            issues.add("LATENCY");
            score -= 0.3;
        }

        // 2. Cleanliness Analysis
        if (lowerComment.contains("mess") || lowerComment.contains("dirty") || lowerComment.contains("cleaned")) {
            issues.add("CLEANLINESS");
            score -= 0.3;
        }

        // 3. Soft Skills / Behavior
        if (lowerComment.contains("rude") || lowerComment.contains("unprofessional") || lowerComment.contains("attitude")) {
            issues.add("BEHAVIOR");
            score -= 0.4;
        }

        // 4. Positive Sentiment Boosters
        if (lowerComment.contains("great") || lowerComment.contains("excellent") || lowerComment.contains("perfect") || lowerComment.contains("polite")) {
            score += 0.5;
        }

        // Final score capping
        review.setSentimentScore(Math.max(-1.0, Math.min(1.0, score)));
        review.setIdentifiedIssues(issues);

        log.info("Sentiment analysis completed for review {}. Score: {}, Issues found: {}", 
            review.getId(), review.getSentimentScore(), issues);
    }
}
