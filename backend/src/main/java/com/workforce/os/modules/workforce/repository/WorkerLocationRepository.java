package com.workforce.os.modules.workforce.repository;

import com.workforce.os.modules.workforce.domain.WorkerLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerLocationRepository extends JpaRepository<WorkerLocation, Long> {
    
    @Query("SELECT wl FROM WorkerLocation wl WHERE wl.worker.id = ?1 AND wl.tenantId = ?2 ORDER BY wl.timestamp DESC LIMIT 1")
    Optional<WorkerLocation> findLatestByWorkerIdAndTenantId(Long workerId, String tenantId);

    @Query("SELECT wl FROM WorkerLocation wl WHERE wl.id IN " +
           "(SELECT MAX(l.id) FROM WorkerLocation l WHERE l.tenantId = ?1 GROUP BY l.worker.id)")
    List<WorkerLocation> findLatestLocationsByTenant(String tenantId);

    List<WorkerLocation> findByWorkerIdAndTimestampBetweenOrderByTimestampAsc(Long workerId, LocalDateTime start, LocalDateTime end);
}
