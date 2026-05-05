package com.workforce.os.modules.finance.repository;

import com.workforce.os.modules.finance.domain.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findAllByTenantId(String tenantId);
    Optional<Invoice> findByWorkOrderId(Long workOrderId);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
}
