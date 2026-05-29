package com.workforce.os.modules.operations.repository;

import com.workforce.os.modules.operations.domain.WorkOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {
        "customer", "assignedWorker", "assignedWorker.user", "tasks", "evidence", "materials", "materials.material",
        "quotation", "quotation.items", "quotation.lead", "quotation.lead.requestedService"
    })
    List<WorkOrder> findAllByTenantIdOrderByCreatedAtDesc(String tenantId);
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {
        "customer", "assignedWorker", "assignedWorker.user", "tasks", "evidence", "materials", "materials.material",
        "quotation", "quotation.items", "quotation.lead", "quotation.lead.requestedService"
    })
    Page<WorkOrder> findByTenantIdOrderByCreatedAtDesc(String tenantId, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {
        "customer", "assignedWorker", "assignedWorker.user", "tasks", "evidence", "materials", "materials.material",
        "quotation", "quotation.items", "quotation.lead", "quotation.lead.requestedService"
    })
    Page<WorkOrder> findByAssignedWorkerIdOrderByCreatedAtDesc(Long workerId, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {
        "customer", "assignedWorker", "assignedWorker.user", "tasks", "evidence", "materials", "materials.material",
        "quotation", "quotation.items", "quotation.lead", "quotation.lead.requestedService"
    })
    Page<WorkOrder> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {
        "customer", "assignedWorker", "assignedWorker.user", "tasks", "evidence", "materials", "materials.material",
        "quotation", "quotation.items", "quotation.lead", "quotation.lead.requestedService"
    })
    Optional<WorkOrder> findByIdAndTenantId(Long id, String tenantId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {
        "customer", "assignedWorker", "assignedWorker.user", "tasks", "evidence", "materials", "materials.material",
        "quotation", "quotation.items", "quotation.lead", "quotation.lead.requestedService"
    })
    Optional<WorkOrder> findById(Long id);
    long countByTenantId(String tenantId);
    long countByAssignedWorkerIdAndStatusNot(Long workerId, WorkOrder.WorkOrderStatus status);
    long countByAssignedWorkerIdAndStatus(Long workerId, WorkOrder.WorkOrderStatus status);

    Optional<WorkOrder> findByQuotationId(Long id);

    List<WorkOrder> findByTenantIdAndStatus(String tenantId, WorkOrder.WorkOrderStatus status);
}
