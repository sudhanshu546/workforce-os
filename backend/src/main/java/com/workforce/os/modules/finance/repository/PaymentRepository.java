package com.workforce.os.modules.finance.repository;

import com.workforce.os.modules.finance.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findAllByInvoiceId(Long invoiceId);
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"invoice", "invoice.customer", "collectedByWorker", "collectedByWorker.user"})
    Page<Payment> findByCollectedByWorkerId(Long workerId, Pageable pageable);
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"invoice", "invoice.customer", "collectedByWorker", "collectedByWorker.user"})
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Payment p WHERE p.tenantId = :tenantId ORDER BY p.createdAt DESC")
    Page<Payment> findAllByTenantId(@org.springframework.data.repository.query.Param("tenantId") String tenantId, Pageable pageable);
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"invoice", "invoice.customer", "collectedByWorker", "collectedByWorker.user"})
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Payment p WHERE p.tenantId = :tenantId " +
           "AND (:method IS NULL OR p.paymentMethod = :method) " +
           "AND (:status IS NULL OR p.paymentStatus = :status) ORDER BY p.createdAt DESC")
    Page<Payment> findAllByTenantIdAndFilters(
            @org.springframework.data.repository.query.Param("tenantId") String tenantId,
            @org.springframework.data.repository.query.Param("method") String method,
            @org.springframework.data.repository.query.Param("status") String status,
            Pageable pageable
    );
}
