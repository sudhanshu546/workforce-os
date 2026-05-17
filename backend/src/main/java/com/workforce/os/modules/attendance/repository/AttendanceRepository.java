package com.workforce.os.modules.attendance.repository;

import com.workforce.os.modules.attendance.domain.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"worker", "worker.user", "workOrder"})
    Optional<Attendance> findByWorkerIdAndClockOutIsNull(Long workerId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"worker", "worker.user", "workOrder"})
    Optional<Attendance> findByWorkerIdAndWorkOrderIdAndClockOutIsNull(Long workerId, Long workOrderId);
    
    List<Attendance> findAllByTenantId(String tenantId);
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"worker", "worker.user", "workOrder"})
    List<Attendance> findByTenantIdOrderByClockInDesc(String tenantId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"worker", "worker.user", "workOrder"})
    Page<Attendance> findByTenantIdOrderByClockInDesc(String tenantId, Pageable pageable);

    List<Attendance> findByWorkerIdAndStatusIn(Long workerId, List<com.workforce.os.modules.attendance.domain.Attendance.AttendanceStatus> statuses);
}
