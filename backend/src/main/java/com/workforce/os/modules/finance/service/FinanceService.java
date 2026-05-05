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

    @Transactional
    public Invoice generateInvoice(WorkOrder workOrder) {
        // Check if invoice already exists
        if (invoiceRepository.findByWorkOrderId(workOrder.getId()).isPresent()) {
            return invoiceRepository.findByWorkOrderId(workOrder.getId()).get();
        }

        Quotation quotation = workOrder.getQuotation();
        
        Invoice invoice = new Invoice();
        invoice.setWorkOrder(workOrder);
        invoice.setInvoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        invoice.setSubtotal(quotation.getSubtotal());
        invoice.setTax(quotation.getTax());
        invoice.setTotal(quotation.getTotalAmount());
        invoice.setStatus(Invoice.InvoiceStatus.ISSUED);
        invoice.setTenantId(TenantContext.getCurrentTenant());
        
        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAllByTenantId(TenantContext.getCurrentTenant());
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
        payment.setTenantId(TenantContext.getCurrentTenant());
        
        // Update invoice status if fully paid
        // For simplicity, mark as PAID immediately in this version
        invoice.setStatus(Invoice.InvoiceStatus.PAID);
        invoiceRepository.save(invoice);
        
        return paymentRepository.save(payment);
    }
}
