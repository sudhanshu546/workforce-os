package com.workforce.os.modules.finance.repository;

import com.workforce.os.modules.finance.domain.Invoice;
import com.workforce.os.modules.finance.dto.InvoiceSummaryProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    @Query("SELECT DISTINCT i FROM Invoice i " +
           "LEFT JOIN FETCH i.items " +
           "WHERE i.id = :id AND i.tenantId = :tenantId")
    Optional<Invoice> findByIdAndTenantId(@Param("id") Long id, @Param("tenantId") String tenantId);

    @Query("SELECT DISTINCT i FROM Invoice i " +
           "LEFT JOIN FETCH i.items " +
           "WHERE i.id = :id AND i.customer.id = :customerId")
    Optional<Invoice> findByIdAndCustomerId(@Param("id") Long id, @Param("customerId") Long customerId);

    @Query("SELECT DISTINCT i FROM Invoice i " +
           "LEFT JOIN FETCH i.items " +
           "WHERE i.id = :id")
    Optional<Invoice> findById(@Param("id") Long id);

    @Query("SELECT DISTINCT i FROM Invoice i " +
           "LEFT JOIN FETCH i.items " +
           "WHERE i.tenantId = :tenantId ORDER BY i.createdAt DESC")
    List<Invoice> findAllByTenantId(@Param("tenantId") String tenantId);

    @Query("SELECT DISTINCT i FROM Invoice i " +
           "LEFT JOIN FETCH i.items " +
           "WHERE i.tenantId = :tenantId ORDER BY i.createdAt DESC")
    Page<Invoice> findAllByTenantId(@Param("tenantId") String tenantId, Pageable pageable);

    @Query("SELECT i.id AS id, i.invoiceNumber AS invoiceNumber, i.total AS total, i.status AS status, c.name AS customerName " +
           "FROM Invoice i JOIN i.customer c WHERE i.tenantId = :tenantId ORDER BY i.createdAt DESC")
    Page<InvoiceSummaryProjection> findAllSummariesByTenantId(@Param("tenantId") String tenantId, Pageable pageable);
    
    Optional<Invoice> findByWorkOrderId(Long workOrderId);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    
    @Query("SELECT DISTINCT i FROM Invoice i " +
           "LEFT JOIN FETCH i.items " +
           "JOIN i.workOrder wo " +
           "WHERE wo.customer.id = :customerId ORDER BY i.createdAt DESC")
    List<Invoice> findByCustomerId(@Param("customerId") Long customerId);

    @Query(value = "SELECT i FROM Invoice i JOIN i.workOrder wo WHERE wo.customer.id = :customerId",
           countQuery = "SELECT COUNT(i) FROM Invoice i JOIN i.workOrder wo WHERE wo.customer.id = :customerId")
    Page<Invoice> findByCustomerId(@Param("customerId") Long customerId, Pageable pageable);
    
    @Query("SELECT SUM(i.total) FROM Invoice i WHERE i.tenantId = :tenantId AND i.status = 'PAID'")
    Double sumTotalByTenantIdAndStatusPaid(@Param("tenantId") String tenantId);
}
