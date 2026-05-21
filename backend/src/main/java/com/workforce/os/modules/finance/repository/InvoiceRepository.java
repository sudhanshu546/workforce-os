package com.workforce.os.modules.finance.repository;

import com.workforce.os.modules.finance.domain.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    @Query("SELECT DISTINCT i FROM Invoice i " +
           "LEFT JOIN FETCH i.items " +
           "WHERE i.id = :id")
    Optional<Invoice> findById(@Param("id") Long id);

    @Query("SELECT DISTINCT i FROM Invoice i " +
           "LEFT JOIN FETCH i.items " +
           "WHERE i.tenantId = :tenantId")
    List<Invoice> findAllByTenantId(@Param("tenantId") String tenantId);
    
    Optional<Invoice> findByWorkOrderId(Long workOrderId);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    
    @Query("SELECT DISTINCT i FROM Invoice i " +
           "LEFT JOIN FETCH i.items " +
           "JOIN i.workOrder wo " +
           "WHERE wo.customer.id = :customerId")
    List<Invoice> findByCustomerId(@Param("customerId") Long customerId);
    
    @Query("SELECT SUM(i.total) FROM Invoice i WHERE i.tenantId = :tenantId AND i.status = 'PAID'")
    Double sumTotalByTenantIdAndStatusPaid(@Param("tenantId") String tenantId);
}
