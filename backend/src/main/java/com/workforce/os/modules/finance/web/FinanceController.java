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

    @GetMapping("/invoices/{id}/pdf")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long id) {
        Invoice invoice = financeService.getInvoiceById(id);
        byte[] pdfBytes = financeService.getPdfService().generateInvoicePdf(invoice);
        
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=invoice-" + invoice.getInvoiceNumber() + ".pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(financeService.getInvoiceById(id));
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

    @PostMapping("/invoices/{id}/payments")
    public ResponseEntity<Payment> recordPaymentForInvoice(@PathVariable Long id, @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(financeService.recordPayment(
                id,
                request.getAmount(),
                request.getPaymentMethod(),
                request.getTransactionReference()
        ));
    }

    @PostMapping("/invoices/{id}/payment-order")
    public ResponseEntity<java.util.Map<String, String>> createPaymentOrder(@PathVariable Long id) throws Exception {
        String orderId = financeService.createPaymentOrder(id);
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("orderId", orderId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/payments/verify")
    public ResponseEntity<Payment> verifyPayment(@RequestBody VerificationRequest request) {
        return ResponseEntity.ok(financeService.verifyAndRecordPayment(
                request.getInvoiceId(),
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature(),
                request.getPaymentMethod()
        ));
    }

    @Data
    public static class VerificationRequest {
        private Long invoiceId;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
        private String paymentMethod;
    }

    @Data
    public static class PaymentRequest {
        private Long invoiceId;
        private Double amount;
        private String paymentMethod;
        private String transactionReference;
    }
}
