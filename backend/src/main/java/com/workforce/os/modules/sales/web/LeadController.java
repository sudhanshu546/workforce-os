package com.workforce.os.modules.sales.web;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.finance.repository.InvoiceRepository;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.sales.domain.Lead;
import com.workforce.os.modules.sales.dto.LeadRequestDTO;
import com.workforce.os.modules.sales.dto.LeadResponseDTO;
import com.workforce.os.modules.sales.mapper.LeadMapper;
import com.workforce.os.modules.sales.repository.LeadRepository;
import com.workforce.os.modules.sales.repository.QuotationRepository;
import com.workforce.os.modules.sales.service.LeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import static com.workforce.os.common.util.MessageConstants.*;

@RestController
@RequestMapping("/api/v1/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;
    private final LeadRepository leadRepository;
    private final LeadMapper leadMapper;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<LeadResponseDTO>>> getLeads(Pageable pageable) {
        Page<LeadResponseDTO> leads = leadService.getLeads(pageable);
        return ResponseEntity.ok(ApiResponse.success(leads, "Leads retrieved successfully"));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<LeadResponseDTO>>> getCustomerLeads(@PathVariable Long customerId) {
        // Note: This specific endpoint isn't cached yet as it's less frequent than the main list
        List<Lead> leads = leadRepository.findByCustomerId(customerId);
        List<LeadResponseDTO> dtos = leads.stream()
                .map(leadMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "Customer leads retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<LeadResponseDTO>> createLead(@Valid @RequestBody LeadRequestDTO request) {
        Lead lead = leadService.createLead(
                request.getCustomerName(),
                request.getCustomerPhone(),
                request.getCustomerEmail(),
                request.getOrganizationId(),
                request.getServiceItemId(),
                request.getCustomerAddressId(),
                request.getDescription(),
                request.getPriority()
        );
        return ResponseEntity.ok(ApiResponse.success(leadMapper.toDTO(lead), "Lead created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<LeadResponseDTO>> updateLead(@PathVariable Long id, @Valid @RequestBody LeadRequestDTO request) {
        Lead lead = leadService.updateLead(id, request.getStatus(), request.getPriority(), request.getDescription());
        return ResponseEntity.ok(ApiResponse.success(leadMapper.toDTO(lead), "Lead updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteLead(@PathVariable Long id) {
        leadService.deleteLead(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Lead deleted successfully"));
    }
}
