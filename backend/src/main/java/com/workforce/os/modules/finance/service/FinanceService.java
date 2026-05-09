package com.workforce.os.modules.finance.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.finance.domain.Invoice;
import com.workforce.os.modules.finance.domain.Payment;
import com.workforce.os.modules.finance.repository.InvoiceRepository;
import com.workforce.os.modules.finance.repository.PaymentRepository;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.sales.domain.Quotation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinanceService {
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final RazorpayService razorpayService;
    private final PdfService pdfService;

    public PdfService getPdfService() {
        return pdfService;
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAllByTenantId(TenantContext.getCurrentTenant());
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id).orElseThrow();
    }

    @org.springframework.beans.factory.annotation.Value("${application.finance.tax.default-rate:18.0}")
    private Double defaultTaxRate;

    @Transactional
    public Invoice generateInvoice(WorkOrder workOrder) {
        // Check if invoice already exists
        if (invoiceRepository.findByWorkOrderId(workOrder.getId()).isPresent()) {
            return invoiceRepository.findByWorkOrderId(workOrder.getId()).get();
        }

        Quotation quotation = workOrder.getQuotation();
        
        // Calculate material costs
        double materialTotal = workOrder.getMaterials().stream()
                .mapToDouble(m -> m.getUnitPriceAtUse() * m.getQuantityUsed())
                .sum();

        double subtotal = quotation.getSubtotal() + materialTotal;
        // Recalculate tax based on full subtotal (including materials)
        double tax = subtotal * (defaultTaxRate / 100.0);

        Invoice invoice = new Invoice();
        invoice.setWorkOrder(workOrder);
        invoice.setInvoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        invoice.setSubtotal(subtotal);
        invoice.setTax(tax);
        invoice.setTotal(subtotal + tax - quotation.getDiscount());
        invoice.setStatus(Invoice.InvoiceStatus.ISSUED);
        
        // Ensure the invoice belongs to the organization's tenant
        invoice.setTenantId(workOrder.getTenantId());
        
        return invoiceRepository.save(invoice);
    }

    public String createPaymentOrder(Long invoiceId) throws Exception {
        Invoice invoice = invoiceRepository.findById(invoiceId).orElseThrow();
        return razorpayService.createOrder(invoice.getTotal(), invoice.getInvoiceNumber());
    }

    @Transactional
    public Payment verifyAndRecordPayment(Long invoiceId, String orderId, String paymentId, String signature, String method) {
        if (!razorpayService.verifyPayment(orderId, paymentId, signature)) {
            throw new RuntimeException("Payment verification failed");
        }

        return recordPayment(invoiceId, null, method, paymentId); // Use paymentId as reference
    }

    @Transactional
    public Payment recordPayment(Long invoiceId, Double amount, String method, String reference) {
        Invoice invoice = invoiceRepository.findById(invoiceId).orElseThrow();
        
        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setAmount(amount);
        payment.setPaymentMethod(method);
        payment.setPaymentStatus("SUCCESS");
        payment.setTransactionReference(reference);
        
        // Ensure the payment belongs to the organization's tenant
        payment.setTenantId(invoice.getTenantId());
        
        // Update invoice status if fully paid
        // For simplicity, mark as PAID immediately in this version
        invoice.setStatus(Invoice.InvoiceStatus.PAID);
        invoiceRepository.save(invoice);
        
        return paymentRepository.save(payment);
    }
}
