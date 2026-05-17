package com.workforce.os.modules.operations.repository;

import com.workforce.os.modules.operations.domain.WorkOrderAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderAuditRepository extends JpaRepository<WorkOrderAudit, Long> {
    List<WorkOrderAudit> findByWorkOrderIdOrderByTimestampDesc(Long workOrderId);

    @org.springframework.data.jpa.repository.Query("SELECT wa FROM WorkOrderAudit wa " +
                   "JOIN FETCH wa.workOrder wo " +
                   "JOIN FETCH wo.customer " +
                   "LEFT JOIN FETCH wo.assignedWorker aw " +
                   "LEFT JOIN FETCH aw.user " +
                   "WHERE wa.id IN (SELECT max(a.id) FROM WorkOrderAudit a WHERE a.tenantId = ?1 AND a.latitude IS NOT NULL GROUP BY a.workOrder.id)")
    List<WorkOrderAudit> findLatestLocationsByTenant(String tenantId);
}
