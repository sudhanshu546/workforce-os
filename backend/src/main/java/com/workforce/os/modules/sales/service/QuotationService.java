package com.workforce.os.modules.sales.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.operations.service.WorkOrderService;
import com.workforce.os.modules.sales.domain.Lead;
import com.workforce.os.modules.sales.domain.Quotation;
import com.workforce.os.modules.sales.domain.QuotationItem;
import com.workforce.os.modules.sales.repository.LeadRepository;
import com.workforce.os.modules.sales.repository.QuotationRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import static com.workforce.os.common.util.MessageConstants.UNAUTHORIZED;

@Service
@RequiredArgsConstructor
public class QuotationService {
    private final QuotationRepository quotationRepository;
    private final LeadRepository leadRepository;
    private final WorkOrderService workOrderService;

    @org.springframework.beans.factory.annotation.Value("${application.finance.tax.default-rate:18.0}")
    private Double defaultTaxRate;

    @Transactional
    public Quotation createQuotation(Long leadId, List<QuotationItemRequest> itemRequests, Double taxPercentage, Double discount) {
        Lead lead = leadRepository.findById(leadId).orElseThrow();
        
        Quotation quotation = new Quotation();
        quotation.setLead(lead);
        quotation.setDiscount(discount);
        quotation.setStatus(Quotation.QuotationStatus.DRAFT);
        quotation.setTenantId(TenantContext.getCurrentTenant());

        List<QuotationItem> items = itemRequests.stream().map(req -> {
            QuotationItem item = new QuotationItem();
            item.setQuotation(quotation);
            item.setDescription(req.getDescription());
            item.setQuantity(req.getQuantity());
            item.setUnitPrice(req.getUnitPrice());
            return item;
        }).collect(Collectors.toList());

        quotation.setItems(items);
        
        // Calculate subtotal
        double subtotal = items.stream()
                .mapToDouble(item -> {
                    item.setTotalAmount(item.getQuantity() * item.getUnitPrice());
                    return item.getTotalAmount();
                })
                .sum();
        
        double rate = (taxPercentage != null && taxPercentage > 0) ? taxPercentage : defaultTaxRate;

        quotation.setSubtotal(subtotal);
        quotation.setTax(subtotal * (rate / 100.0));
        quotation.setTotalAmount(subtotal + quotation.getTax() - discount);
        
        lead.setStatus(Lead.LeadStatus.QUOTED);
        leadRepository.save(lead);
        
        return quotationRepository.save(quotation);
    }

    @Data
    public static class QuotationItemRequest {
        private String description;
        private Integer quantity;
        private Double unitPrice;
    }

    @Transactional
    public Quotation approveQuotation(Long quotationId) {
        Quotation quotation = quotationRepository.findById(quotationId).orElseThrow();
        // Manually initialize the items collection to prevent LazyInitializationException later
        quotation.getItems().size();
        
        quotation.setStatus(Quotation.QuotationStatus.APPROVED);
        
        Lead lead = quotation.getLead();
        lead.setStatus(Lead.LeadStatus.CONVERTED);
        leadRepository.save(lead);
        
        // Trigger Work Order Creation
        workOrderService.createWorkOrderFromQuotation(quotation);
        
        return quotationRepository.save(quotation);
    }

    public List<Quotation> getQuotations() {
        return quotationRepository.findAllByTenantId(TenantContext.getCurrentTenant());
    }

    @Transactional(readOnly = true)
    public Quotation getQuotationById(Long id) {
        return quotationRepository.findById(id).orElseThrow();
    }

    @Transactional
    public void deleteQuotation(Long id) {
        Quotation quotation = quotationRepository.findById(id).orElseThrow();
        if (!quotation.getTenantId().equals(TenantContext.getCurrentTenant())) {
            throw new RuntimeException(UNAUTHORIZED);
        }
        
        // Prevent deletion if an active work order exists
        workOrderService.getWorkOrderRepository().findByQuotationId(id).ifPresent(wo -> {
            if (wo.getStatus() != com.workforce.os.modules.operations.domain.WorkOrder.WorkOrderStatus.CANCELLED) {
                throw new RuntimeException("Cannot delete quotation with an active Work Order. Cancel the Work Order first.");
            }
        });
        
        // Revert lead status if necessary
        Lead lead = quotation.getLead();
        if (lead.getStatus() == Lead.LeadStatus.QUOTED || lead.getStatus() == Lead.LeadStatus.CONVERTED) {
            lead.setStatus(Lead.LeadStatus.CONTACTED);
            leadRepository.save(lead);
        }
        
        quotationRepository.delete(quotation);
    }
}
