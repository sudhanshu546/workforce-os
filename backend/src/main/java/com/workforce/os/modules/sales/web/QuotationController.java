package com.workforce.os.modules.sales.web;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.finance.service.FinanceService;
import com.workforce.os.modules.sales.domain.Quotation;
import com.workforce.os.modules.sales.dto.QuotationResponseDTO;
import com.workforce.os.modules.sales.mapper.QuotationMapper;
import com.workforce.os.modules.sales.repository.QuotationRepository;
import com.workforce.os.modules.sales.service.QuotationService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quotations")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class QuotationController {

    private final QuotationService quotationService;
    private final QuotationRepository quotationRepository;
    private final QuotationMapper quotationMapper;
    private final FinanceService financeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<QuotationResponseDTO>>> getQuotations(Pageable pageable) {
        Page<Quotation> quotations = quotationRepository.findByTenantId(TenantContext.getCurrentTenant(), pageable);
        return ResponseEntity.ok(ApiResponse.success(quotations.map(quotationMapper::toDTO), "Quotations retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<QuotationResponseDTO>> getQuotation(@PathVariable Long id) {
        log.info("Fetching details for quotation: {}", id);
        Quotation quotation = quotationService.getQuotationById(id);
        return ResponseEntity.ok(ApiResponse.success(quotationMapper.toDTO(quotation), "Quotation retrieved successfully"));
    }

    @GetMapping("/lead/{leadId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<QuotationResponseDTO>> getQuotationByLead(@PathVariable Long leadId) {
        Quotation quotation = quotationService.getQuotationById(leadId);
//                .orElseThrow(() -> new RuntimeException("Quotation not found for lead: " + leadId));
//
//        // Ownership verification for customers
//        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
//        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"))) {
//             var customer = (com.workforce.os.modules.customer.domain.Customer) auth.getPrincipal();
//             if (quotation.getCustomer() == null || !quotation.getCustomer().getId().equals(customer.getId())) {
//                throw new com.workforce.os.common.exception.BusinessException("Access denied");
//             }
//        }
        
        return ResponseEntity.ok(ApiResponse.success(quotationMapper.toDTO(quotation), "Quotation retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<QuotationResponseDTO>> createQuotation(@Valid @RequestBody CreateQuotationRequest request) {
        Quotation quotation = quotationService.createQuotation(
                request.getLeadId(),
                request.getItems(),
                request.getTax(),
                request.getDiscount()
        );
        return ResponseEntity.ok(ApiResponse.success(quotationMapper.toDTO(quotation), "Quotation created successfully"));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<QuotationResponseDTO>> approveQuotation(@PathVariable Long id) {
        // Validation handled inside service via getQuotationById
        Quotation quotation = quotationService.approveQuotation(id);
        return ResponseEntity.ok(ApiResponse.success(quotationMapper.toDTO(quotation), "Quotation approved successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteQuotation(@PathVariable Long id) {
        quotationService.deleteQuotation(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Quotation deleted successfully"));
    }

    @Data
    public static class CreateQuotationRequest {
        private Long leadId;
        private List<QuotationService.QuotationItemRequest> items;
        private Double tax;
        private Double discount;
    }
}
