package com.workforce.os.modules.finance.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.finance.domain.Invoice;
import com.workforce.os.modules.finance.domain.Payment;
import com.workforce.os.modules.finance.dto.InvoiceResponseDTO;
import com.workforce.os.modules.finance.dto.PaymentResponseDTO;
import com.workforce.os.modules.finance.mapper.FinanceMapper;
import com.workforce.os.modules.finance.service.FinanceService;
import com.workforce.os.modules.operations.domain.WorkOrder;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.workforce.os.common.util.MessageConstants.*;

@RestController
@RequestMapping("/api/v1/finance")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class FinanceController {
    private final FinanceService financeService;
    private final FinanceMapper financeMapper;

    @GetMapping("/invoices")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<InvoiceResponseDTO>>> getInvoices(Pageable pageable) {
        log.info("Fetching all invoices, page: {}", pageable.getPageNumber());
        Page<Invoice> invoices = financeService.getAllInvoices(pageable);
        Page<InvoiceResponseDTO> dtos = invoices.map(financeMapper::toInvoiceDTO);
        return ResponseEntity.ok(ApiResponse.success(dtos, INVOICES_RETRIEVED));
    }

    @GetMapping("/invoices/{id}/pdf")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long id) {
        log.info("Downloading PDF for invoice ID: {}", id);
        Invoice invoice = financeService.getInvoiceById(id);
        byte[] pdfBytes = financeService.getPdfService().generateInvoicePdf(invoice);
        
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=invoice-" + invoice.getInvoiceNumber() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/work-orders/{id}/proof-pdf")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<byte[]> downloadProofOfServicePdf(@PathVariable Long id) {
        log.info("Downloading Proof of Service PDF for work order ID: {}", id);
        WorkOrder workOrder = financeService.getWorkOrderRepository().findById(id)
                .orElseThrow(() -> new com.workforce.os.common.exception.ResourceNotFoundException(WORK_ORDER_NOT_FOUND));
        
        java.util.Map<String, Object> vars = new java.util.HashMap<>();
        vars.put("workOrder", workOrder);
        
        byte[] pdfBytes = financeService.getPdfService().generatePdf("finance/proof-of-service", vars);
        
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=proof-of-service-" + (workOrder.getId() + 1000) + ".pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/invoices/customer/{customerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Page<InvoiceResponseDTO>>> getInvoicesByCustomer(@PathVariable Long customerId, Pageable pageable) {
        log.info("Fetching invoices for customer ID: {}, page: {}", customerId, pageable.getPageNumber());
        // In a real app, verify customerId matches authenticated user ID
        Page<Invoice> invoices = financeService.getInvoicesByCustomer(customerId, pageable);
        Page<InvoiceResponseDTO> dtos = invoices.map(financeMapper::toInvoiceDTO);
        return ResponseEntity.ok(ApiResponse.success(dtos, INVOICES_RETRIEVED));
    }


    @PostMapping("/payments/cash")
    @PreAuthorize("hasAnyRole('WORKER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> recordCashPayment(@Valid @RequestBody PaymentRequest request) {
        log.info("Recording cash payment for invoice ID: {}", request.getInvoiceId());
        Payment payment = financeService.recordPayment(
                request.getInvoiceId(),
                request.getAmount(),
                "CASH",
                request.getTransactionReference()
        );
        return ResponseEntity.ok(ApiResponse.success(financeMapper.toPaymentDTO(payment), PAYMENT_SUCCESSFUL));
    }

    @PostMapping("/invoices/{id}/payment-order")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> createPaymentOrder(@PathVariable Long id) throws Exception {
        log.info("Creating payment order for invoice ID: {}", id);
        String orderId = financeService.createPaymentOrder(id);
        Map<String, String> response = new HashMap<>();
        response.put("orderId", orderId);
        return ResponseEntity.ok(ApiResponse.success(response, PAYMENT_ORDER_CREATED));
    }

    @PostMapping("/work-orders/{workOrderId}/payment-order")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> createPaymentOrderByWorkOrder(@PathVariable Long workOrderId) throws Exception {
        log.info("Creating payment order for work order ID: {}", workOrderId);
        Invoice invoice = financeService.getOrCreateInvoice(workOrderId);
        String orderId = financeService.createPaymentOrder(invoice.getId());
        Map<String, String> response = new HashMap<>();
        response.put("orderId", orderId);
        response.put("invoiceId", invoice.getId().toString());
        return ResponseEntity.ok(ApiResponse.success(response, PAYMENT_ORDER_CREATED));
    }

    @PostMapping("/payments/verify")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> verifyPayment(@Valid @RequestBody VerificationRequest request) {
        log.info("Verifying payment for invoice ID: {}", request.getInvoiceId());
        Payment payment = financeService.verifyAndRecordPayment(
                request.getInvoiceId(),
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature(),
                request.getPaymentMethod()
        );
        return ResponseEntity.ok(ApiResponse.success(financeMapper.toPaymentDTO(payment), PAYMENT_SUCCESSFUL));
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
