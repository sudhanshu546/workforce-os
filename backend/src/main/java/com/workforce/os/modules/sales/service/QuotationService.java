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

@Service
@RequiredArgsConstructor
public class QuotationService {
    private final QuotationRepository quotationRepository;
    private final LeadRepository leadRepository;
    private final WorkOrderService workOrderService;

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
        
        // Calculate subtotal and tax percentage
        double subtotal = items.stream()
                .mapToDouble(item -> {
                    item.setTotalAmount(item.getQuantity() * item.getUnitPrice());
                    return item.getTotalAmount();
                })
                .sum();
        
        quotation.setSubtotal(subtotal);
        quotation.setTax(subtotal * (taxPercentage / 100.0));
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

    public Quotation getQuotationById(Long id) {
        return quotationRepository.findById(id).orElseThrow();
    }

    @Transactional
    public void deleteQuotation(Long id) {
        Quotation quotation = quotationRepository.findById(id).orElseThrow();
        if (!quotation.getTenantId().equals(TenantContext.getCurrentTenant())) {
            throw new RuntimeException("Unauthorized");
        }
        
        // Revert lead status if necessary
        Lead lead = quotation.getLead();
        if (lead.getStatus() == Lead.LeadStatus.QUOTED) {
            lead.setStatus(Lead.LeadStatus.CONTACTED);
            leadRepository.save(lead);
        }
        
        quotationRepository.delete(quotation);
    }
}
