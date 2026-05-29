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

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"worker", "worker.user", "workOrder"})
    java.util.Optional<Expense> findByIdAndTenantId(Long id, String tenantId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(e.amount) FROM Expense e WHERE e.worker.id = ?1 AND e.status = 'APPROVED' AND e.createdAt BETWEEN ?2 AND ?3")
    Double sumApprovedExpensesByWorkerAndPeriod(Long workerId, java.time.LocalDateTime start, java.time.LocalDateTime end);

    List<Expense> findByWorkerIdAndStatusAndCreatedAtBetween(Long workerId, Expense.ExpenseStatus status, java.time.LocalDateTime start, java.time.LocalDateTime end);
}
