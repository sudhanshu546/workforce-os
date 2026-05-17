package com.workforce.os.modules.finance.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.finance.domain.Invoice;
import com.workforce.os.modules.finance.domain.Payment;
import com.workforce.os.modules.finance.dto.InvoiceResponseDTO;
import com.workforce.os.modules.finance.dto.PaymentResponseDTO;
import com.workforce.os.modules.finance.mapper.FinanceMapper;
import com.workforce.os.modules.finance.service.FinanceService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/finance")
@RequiredArgsConstructor
public class FinanceController {
    private final FinanceService financeService;
    private final FinanceMapper financeMapper;

    @GetMapping("/invoices")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<InvoiceResponseDTO>>> getInvoices() {
        List<Invoice> invoices = financeService.getAllInvoices();
        List<InvoiceResponseDTO> dtos = invoices.stream().map(financeMapper::toInvoiceDTO).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "Invoices retrieved successfully"));
    }

    @GetMapping("/invoices/{id}/pdf")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long id) {
        Invoice invoice = financeService.getInvoiceById(id);
        // Industry recommendation: Verify customer ownership if role is CUSTOMER
        byte[] pdfBytes = financeService.getPdfService().generateInvoicePdf(invoice);
        
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=invoice-" + invoice.getInvoiceNumber() + ".pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/invoices/customer/{customerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<InvoiceResponseDTO>>> getInvoicesByCustomer(@PathVariable Long customerId) {
        // In a real app, verify customerId matches authenticated user ID
        List<Invoice> invoices = financeService.getInvoicesByCustomer(customerId);
        List<InvoiceResponseDTO> dtos = invoices.stream().map(financeMapper::toInvoiceDTO).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "Invoices retrieved successfully"));
    }


    @PostMapping("/payments/cash")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> recordCashPayment(@Valid @RequestBody PaymentRequest request) {
        Payment payment = financeService.recordPayment(
                request.getInvoiceId(),
                request.getAmount(),
                "CASH",
                request.getTransactionReference()
        );
        return ResponseEntity.ok(ApiResponse.success(financeMapper.toPaymentDTO(payment), "Cash payment confirmed and order completed"));
    }

    @PostMapping("/invoices/{id}/payment-order")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> createPaymentOrder(@PathVariable Long id) throws Exception {
        String orderId = financeService.createPaymentOrder(id);
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("orderId", orderId);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment order created"));
    }

    @PostMapping("/work-orders/{workOrderId}/payment-order")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> createPaymentOrderByWorkOrder(@PathVariable Long workOrderId) throws Exception {
        Invoice invoice = financeService.getOrCreateInvoice(workOrderId);
        String orderId = financeService.createPaymentOrder(invoice.getId());
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("orderId", orderId);
        response.put("invoiceId", invoice.getId().toString());
        return ResponseEntity.ok(ApiResponse.success(response, "Payment order created with auto-generated invoice"));
    }

    @PostMapping("/payments/verify")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> verifyPayment(@Valid @RequestBody VerificationRequest request) {
        Payment payment = financeService.verifyAndRecordPayment(
                request.getInvoiceId(),
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature(),
                request.getPaymentMethod()
        );
        return ResponseEntity.ok(ApiResponse.success(financeMapper.toPaymentDTO(payment), "Payment verified and recorded"));
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
