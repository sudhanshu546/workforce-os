package com.workforce.os.modules.sales.web;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.sales.domain.Lead;
import com.workforce.os.modules.sales.repository.LeadRepository;
import com.workforce.os.modules.sales.service.LeadService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<java.util.List<Lead>> getCustomerLeads(@PathVariable Long customerId) {
        // In a modular monolith, we might want to ensure the customer matches the authenticated user
        return ResponseEntity.ok(leadRepository.findAll().stream()
                .filter(l -> l.getCustomer().getId().equals(customerId))
                .collect(java.util.stream.Collectors.toList()));
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
