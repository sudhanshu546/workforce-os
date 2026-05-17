package com.workforce.os.modules.finance.repository;

import com.workforce.os.modules.finance.domain.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"worker", "worker.user", "workOrder"})
    List<Expense> findByWorkOrderId(Long workOrderId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"worker", "worker.user", "workOrder"})
    Page<Expense> findByTenantIdOrderByCreatedAtDesc(String tenantId, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"worker", "worker.user", "workOrder"})
    Page<Expense> findByWorkerIdOrderByCreatedAtDesc(Long workerId, Pageable pageable);
}
