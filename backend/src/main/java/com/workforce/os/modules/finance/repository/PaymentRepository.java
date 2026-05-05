package com.workforce.os.modules.finance.repository;

import com.workforce.os.modules.finance.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findAllByInvoiceId(Long invoiceId);
}
