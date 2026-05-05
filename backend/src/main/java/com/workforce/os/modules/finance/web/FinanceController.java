package com.workforce.os.modules.finance.web;

import com.workforce.os.modules.finance.domain.Invoice;
import com.workforce.os.modules.finance.domain.Payment;
import com.workforce.os.modules.finance.service.FinanceService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/finance")
@RequiredArgsConstructor
public class FinanceController {
    private final FinanceService financeService;

    @GetMapping("/invoices")
    public ResponseEntity<List<Invoice>> getInvoices() {
        return ResponseEntity.ok(financeService.getAllInvoices());
    }

    @PostMapping("/payments")
    public ResponseEntity<Payment> recordPayment(@RequestBody PaymentRequest request) {
        return ResponseEntity.ok(financeService.recordPayment(
                request.getInvoiceId(),
                request.getAmount(),
                request.getPaymentMethod(),
                request.getTransactionReference()
        ));
    }

    @Data
    public static class PaymentRequest {
        private Long invoiceId;
        private Double amount;
        private String paymentMethod;
        private String transactionReference;
    }
}
