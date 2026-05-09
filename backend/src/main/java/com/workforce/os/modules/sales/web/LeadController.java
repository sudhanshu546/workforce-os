package com.workforce.os.modules.sales.web;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.finance.repository.InvoiceRepository;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.organization.domain.Organization;
import com.workforce.os.modules.sales.domain.Lead;
import com.workforce.os.modules.sales.repository.LeadRepository;
import com.workforce.os.modules.sales.repository.QuotationRepository;
import com.workforce.os.modules.sales.service.LeadService;
import com.workforce.os.modules.service.domain.ServiceItem;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;
    private final LeadRepository leadRepository;

    @GetMapping
    public ResponseEntity<Page<Lead>> getLeads(Pageable pageable) {
        return ResponseEntity.ok(leadRepository.findByTenantId(TenantContext.getCurrentTenant(), pageable));
    }

    private final QuotationRepository quotationRepository;
    private final WorkOrderRepository workOrderRepository;
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<LeadResponseDTO>> getCustomerLeads(@PathVariable Long customerId) {
        var leads = leadRepository.findAll().stream()
                .filter(l -> l.getCustomer().getId().equals(customerId))
                .map(l -> {
                    LeadResponseDTO dto = new LeadResponseDTO();
                    dto.setId(l.getId());
                    dto.setCustomer(l.getCustomer());
                    dto.setOrganization(l.getOrganization());
                    dto.setRequestedService(l.getRequestedService());
                    dto.setDescription(l.getDescription());
                    dto.setPriority(l.getPriority());
                    dto.setStatus(l.getStatus());
                    dto.setCreatedAt(l.getCreatedAt());

                    // Find linked quotation, work order and invoice
                    quotationRepository.findByLeadId(l.getId()).ifPresent(q -> {
                        dto.setQuotationId(q.getId());
                        workOrderRepository.findByQuotationId(q.getId()).ifPresent(wo -> {
                            dto.setWorkOrderId(wo.getId());
                            dto.setWorkOrderStatus(wo.getStatus().toString());
                            
                            // Find linked invoice from finance module (assuming repository available or reachable)
                            // For simplicity in this mono-repo, we can use the repository directly if we inject it
                            invoiceRepository.findByWorkOrderId(wo.getId()).ifPresent(inv -> {
                                dto.setInvoiceId(inv.getId());
                                dto.setInvoiceStatus(inv.getStatus().toString());
                                dto.setInvoiceAmount(inv.getTotal());
                            });
                        });
                    });
                    return dto;
                })
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(leads);
    }

    private final InvoiceRepository invoiceRepository;

    @Data
    public static class LeadResponseDTO {
        private Long id;
        private Customer customer;
        private Organization organization;
        private ServiceItem requestedService;
        private String description;
        private String priority;
        private Lead.LeadStatus status;
        private LocalDateTime createdAt;
        private Long quotationId;
        private Long workOrderId;
        private String workOrderStatus;
        private Long invoiceId;
        private String invoiceStatus;
        private Double invoiceAmount;
    }

    @PostMapping
    public ResponseEntity<Lead> createLead(@RequestBody LeadCreateRequest request) {
        return ResponseEntity.ok(leadService.createLead(
                request.getCustomerName(),
                request.getCustomerPhone(),
                request.getOrganizationId(),
                request.getServiceItemId(),
                request.getDescription(),
                request.getPriority()
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lead> updateLead(@PathVariable Long id, @RequestBody LeadCreateRequest request) {
        return ResponseEntity.ok(leadService.updateLead(id, request.getStatus(), request.getPriority(), request.getDescription()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable Long id) {
        leadService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class LeadCreateRequest {
        private String customerName;
        private String customerPhone;
        private Long organizationId;
        private Long serviceItemId;
        private String description;
        private String priority;
        private String status;
    }
}
