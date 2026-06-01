package com.workforce.os.modules.finance.service;

import com.workforce.os.common.annotation.AuditLog;
import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.exception.BusinessException;
import com.workforce.os.common.exception.ResourceNotFoundException;
import com.workforce.os.common.util.MessageConstants;
import com.workforce.os.modules.finance.domain.Invoice;
import com.workforce.os.modules.finance.domain.InvoiceItem;
import com.workforce.os.modules.finance.domain.InvoiceItem.ItemType;
import com.workforce.os.modules.finance.domain.Payment;
import com.workforce.os.modules.finance.domain.TaxConfig;
import com.workforce.os.modules.finance.repository.InvoiceRepository;
import com.workforce.os.modules.finance.repository.PaymentRepository;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.operations.domain.WorkOrder.WorkOrderStatus;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.sales.domain.Quotation;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static com.workforce.os.common.util.MessageConstants.PAYMENT_VERIFICATION_FAILED;
import static com.workforce.os.common.util.MessageConstants.WORK_ORDER_NOT_FOUND;

@Service
@RequiredArgsConstructor
@Getter
@lombok.extern.slf4j.Slf4j
public class FinanceService extends com.workforce.os.common.service.BaseService {
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final WorkOrderRepository workOrderRepository;
    private final RazorpayService razorpayService;
    private final PdfService pdfService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final com.workforce.os.modules.notification.service.NotificationService notificationService;
    private final com.workforce.os.modules.finance.service.TaxService taxService;

    public PdfService getPdfService() {
        return pdfService;
    }

    @Transactional(readOnly = true)
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAllByTenantId(TenantContext.getCurrentTenant());
    }

    @Transactional(readOnly = true)
    public Page<Invoice> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findAllByTenantId(TenantContext.getCurrentTenant(), pageable);
    }

    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesByCustomer(Long customerId) {
        return invoiceRepository.findByCustomerId(customerId);
    }

    @Transactional(readOnly = true)
    public Page<Invoice> getInvoicesByCustomer(Long customerId, Pageable pageable) {
        return invoiceRepository.findByCustomerId(customerId, pageable);
    }

    @Transactional(readOnly = true)
    public Invoice getInvoiceById(Long id) {
        return getSecurely(id, invoiceRepository::findByIdAndTenantId, invoiceRepository::findByIdAndCustomerId);
    }

    private Invoice getInvoiceSecurely(Long id) {
        return getInvoiceById(id);
    }

    @Transactional(readOnly = true)
    public Page<Payment> getPaymentsByWorker(Long workerId, Pageable pageable) {
        return paymentRepository.findByCollectedByWorkerId(workerId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Payment> getAllPayments(String method, String status, Pageable pageable) {
        String tenantId = TenantContext.getCurrentTenant();
        if (method == null && status == null) {
            return paymentRepository.findAllByTenantId(tenantId, pageable);
        }
        return paymentRepository.findAllByTenantIdAndFilters(tenantId, method, status, pageable);
    }

    @Transactional
    public Invoice getOrCreateInvoice(Long workOrderId) {
        return invoiceRepository.findByWorkOrderId(workOrderId)
                .orElseGet(() -> {
                    // Note: WorkOrderRepository already has tenant-scoping in its implementation details 
                    // or should use findByIdAndTenantId for consistency if being cautious.
                    WorkOrder wo = workOrderRepository.findByIdAndTenantId(workOrderId, TenantContext.getCurrentTenant())
                            .orElseThrow(() -> new ResourceNotFoundException(WORK_ORDER_NOT_FOUND));
                    return generateInvoice(wo);
                });
    }

    @org.springframework.beans.factory.annotation.Value("")
    private Double defaultTaxRate;

    @Transactional
    @AuditLog("Generating invoice")
    public Invoice generateInvoice(WorkOrder workOrder) {
        // Check if invoice already exists
        if (invoiceRepository.findByWorkOrderId(workOrder.getId()).isPresent()) {
            return invoiceRepository.findByWorkOrderId(workOrder.getId()).get();
        }

        Quotation quotation = workOrder.getQuotation();
        Invoice invoice = new Invoice();
        invoice.setWorkOrder(workOrder);
        invoice.setCustomer(workOrder.getCustomer());
        invoice.setInvoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        invoice.setTenantId(workOrder.getTenantId());

        // 1. Add Service Items from Quotation
        quotation.getItems().forEach(qi -> {
            InvoiceItem item = InvoiceItem.builder()
                    .invoice(invoice)
                    .description(qi.getDescription())
                    .quantity(qi.getQuantity().doubleValue())
                    .unitPrice(qi.getUnitPrice())
                    .totalAmount(qi.getTotalAmount())
                    .type(ItemType.SERVICE)
                    .build();
            item.setTenantId(workOrder.getTenantId());
            invoice.getItems().add(item);
        });

        // 2. Add Material Items from Work Order
        workOrder.getMaterials().forEach(wm -> {
            InvoiceItem item = InvoiceItem.builder()
                    .invoice(invoice)
                    .description(wm.getMaterial().getName())
                    .quantity(wm.getQuantityUsed())
                    .unitPrice(wm.getUnitPriceAtUse())
                    .totalAmount(wm.getUnitPriceAtUse() * wm.getQuantityUsed())
                    .type(ItemType.MATERIAL)
                    .build();
            item.setTenantId(workOrder.getTenantId());
            invoice.getItems().add(item);
        });

        // Dynamic Tax Engine
        String region = workOrder.getServiceAddress() != null ? workOrder.getServiceAddress().getState() : null;
        TaxConfig taxConfig = taxService.getTaxConfig(region);
        
        double subtotal = invoice.getItems().stream().mapToDouble(InvoiceItem::getTotalAmount).sum();
        double discount = quotation.getDiscount() != null ? quotation.getDiscount() : 0.0;
        double tax = subtotal * (taxConfig.getRate() / 100.0);

        invoice.setSubtotal(subtotal);
        invoice.setTax(tax);
        invoice.setTotal(subtotal + tax - discount);
        invoice.setStatus(Invoice.InvoiceStatus.ISSUED);

        return invoiceRepository.save(invoice);
    }

    @Transactional
    @io.github.resilience4j.bulkhead.annotation.Bulkhead(name = "razorpayService")
    @AuditLog("Creating payment order")
    public String createPaymentOrder(Long invoiceId) throws Exception {
        Invoice invoice = getInvoiceSecurely(invoiceId);
        return razorpayService.createOrder(invoice.getTotal(), invoice.getInvoiceNumber());
    }

    @Transactional
    public Payment verifyAndRecordPayment(Long invoiceId, String orderId, String paymentId, String signature, String method) {
        if (!razorpayService.verifyPayment(orderId, paymentId, signature)) {
            throw new BusinessException(PAYMENT_VERIFICATION_FAILED);
        }

        return recordPayment(invoiceId, null, method, paymentId, null); // Online payments have no collectorId
    }

    @Transactional
    @AuditLog("Recording payment")
    public Payment recordPayment(Long invoiceId, Double amount, String method, String reference, Long collectorId) {
        Invoice invoice = getInvoiceSecurely(invoiceId);

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setAmount(amount != null ? amount : invoice.getTotal());
        payment.setPaymentMethod(method);
        payment.setTransactionReference(reference);
        payment.setCollectedByWorkerId(collectorId);

        // Accountability Logic: Cash requires owner verification
        if ("CASH".equalsIgnoreCase(method)) {
            payment.setPaymentStatus("PENDING_DEPOSIT"); // Worker has it, Owner doesn't yet
            log.info("Cash collection recorded for Invoice {}. Pending deposit by Worker {}.", invoice.getInvoiceNumber(), collectorId);
        } else {
            payment.setPaymentStatus("SUCCESS");
        }

        // Ensure the payment belongs to the organization's tenant
        payment.setTenantId(invoice.getTenantId());

        // Update invoice status
        invoice.setStatus(Invoice.InvoiceStatus.PAID);
        invoiceRepository.save(invoice);

        // Finalize Work Order directly to break circular dependency
        if (invoice.getWorkOrder() != null) {
            invoice.getWorkOrder().setStatus(WorkOrderStatus.COMPLETED);
        }

        Payment saved = paymentRepository.save(payment);
        notificationService.notifyManagementOfNewPayment(saved);
        return saved;
    }

    @Transactional
    @AuditLog("Verifying cash deposit")
    public Payment verifyCashDeposit(Long paymentId, Long ownerId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));

        if (!"CASH".equalsIgnoreCase(payment.getPaymentMethod())) {
            throw new BusinessException("Only cash payments require manual verification");
        }

        payment.setPaymentStatus("SUCCESS");
        payment.setVerifiedByOwnerId(ownerId);
        
        Payment saved = paymentRepository.save(payment);
        
        // Notify worker in real-time
        if (saved.getCollectedByWorkerId() != null) {
            messagingTemplate.convertAndSend("/topic/worker/" + saved.getCollectedByWorkerId() + "/payments", "PAYMENT_VERIFIED");
        }
        
        log.info("Cash deposit verified for Payment {}. Verified by Owner {}.", paymentId, ownerId);

        return saved;
    }

}
