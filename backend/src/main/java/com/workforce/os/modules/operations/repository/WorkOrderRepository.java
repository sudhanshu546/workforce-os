package com.workforce.os.modules.operations.repository;

import com.workforce.os.modules.operations.domain.WorkOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    List<WorkOrder> findAllByTenantId(String tenantId);
    Page<WorkOrder> findByTenantId(String tenantId, Pageable pageable);
    List<WorkOrder> findByAssignedWorkerId(Long workerId);
    Page<WorkOrder> findByAssignedWorkerId(Long workerId, Pageable pageable);
}
