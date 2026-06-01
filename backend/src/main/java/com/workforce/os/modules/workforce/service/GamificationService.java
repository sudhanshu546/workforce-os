package com.workforce.os.modules.workforce.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.operations.domain.Review;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.domain.WorkerStats;
import com.workforce.os.modules.workforce.repository.WorkerStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class GamificationService {

    private final WorkerStatsRepository workerStatsRepository;

    @Transactional
    public void awardPointsForCompletion(WorkOrder workOrder) {
        if (workOrder.getAssignedWorker() == null) return;
        
        WorkerStats stats = getOrCreateStats(workOrder.getAssignedWorker());
        int pointsToAdd = 50; // Base completion points
        
        stats.setTotalPoints(stats.getTotalPoints() + pointsToAdd);
        stats.setCompletedJobs(stats.getCompletedJobs() + 1);
        
        checkAndAwardBadges(stats);
        updateLevel(stats);
        workerStatsRepository.save(stats);
    }

    @Transactional
    public void awardPointsForReview(Review review) {
        WorkerStats stats = getOrCreateStats(review.getWorker());
        int pointsToAdd = review.getRating() * 20; // 5 stars = 100 points
        
        stats.setTotalPoints(stats.getTotalPoints() + pointsToAdd);
        
        // Update average rating
        double currentTotalRating = stats.getAverageRating() * (stats.getCompletedJobs() - 1);
        stats.setAverageRating((currentTotalRating + review.getRating()) / stats.getCompletedJobs());
        
        checkAndAwardBadges(stats);
        workerStatsRepository.save(stats);
    }

    public List<WorkerStats> getLeaderboard() {
        return workerStatsRepository.findTopPerformers(TenantContext.getCurrentTenant());
    }

    public WorkerStats getWorkerStats(Long workerId) {
        return workerStatsRepository.findByWorkerId(workerId).orElse(null);
    }

    private WorkerStats getOrCreateStats(WorkerProfile worker) {
        return workerStatsRepository.findByWorkerId(worker.getId())
                .orElseGet(() -> {
                    WorkerStats newStats = WorkerStats.builder()
                            .worker(worker)
                            .totalPoints(0)
                            .level(1)
                            .completedJobs(0)
                            .averageRating(0.0)
                            .badges(new java.util.HashSet<>())
                            .build();
                    newStats.setTenantId(worker.getTenantId());
                    return workerStatsRepository.save(newStats);
                });
    }

    private void checkAndAwardBadges(WorkerStats stats) {
        if (stats.getCompletedJobs() >= 10 && !stats.getBadges().contains("MILESTONE_10")) {
            stats.getBadges().add("MILESTONE_10");
        }
        if (stats.getAverageRating() >= 4.8 && stats.getCompletedJobs() >= 5 && !stats.getBadges().contains("FIVE_STAR_PRO")) {
            stats.getBadges().add("FIVE_STAR_PRO");
        }
        if (stats.getTotalPoints() >= 1000 && !stats.getBadges().contains("ELITE_WORKER")) {
            stats.getBadges().add("ELITE_WORKER");
        }
    }

    private void updateLevel(WorkerStats stats) {
        // Simple level logic: every 500 points
        stats.setLevel((stats.getTotalPoints() / 500) + 1);
    }
}
