package com.workforce.os.modules.workforce.repository;

import com.workforce.os.modules.workforce.domain.WorkerStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface WorkerStatsRepository extends JpaRepository<WorkerStats, Long> {
    Optional<WorkerStats> findByWorkerId(Long workerId);

    @Query("SELECT s FROM WorkerStats s JOIN FETCH s.worker w JOIN FETCH w.user u " +
           "WHERE s.tenantId = :tenantId ORDER BY s.totalPoints DESC")
    List<WorkerStats> findTopPerformers(@Param("tenantId") String tenantId);
}
