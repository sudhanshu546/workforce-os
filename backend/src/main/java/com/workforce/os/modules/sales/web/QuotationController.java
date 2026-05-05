package com.workforce.os.modules.sales.web;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.sales.domain.Quotation;
import com.workforce.os.modules.sales.repository.QuotationRepository;
import com.workforce.os.modules.sales.service.QuotationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quotations")
@RequiredArgsConstructor
public class QuotationController {

    private final QuotationService quotationService;
    private final QuotationRepository quotationRepository;

    @GetMapping
    public ResponseEntity<Page<Quotation>> getQuotations(Pageable pageable) {
        return ResponseEntity.ok(quotationRepository.findByTenantId(TenantContext.getCurrentTenant(), pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quotation> getQuotation(@PathVariable Long id) {
        return ResponseEntity.ok(quotationService.getQuotationById(id));
    }

    @PostMapping
    public ResponseEntity<Quotation> createQuotation(@RequestBody CreateQuotationRequest request) {
        return ResponseEntity.ok(quotationService.createQuotation(
                request.getLeadId(),
                request.getItems(),
                request.getTax(),
                request.getDiscount()
        ));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Quotation> approveQuotation(@PathVariable Long id) {
        return ResponseEntity.ok(quotationService.approveQuotation(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuotation(@PathVariable Long id) {
        quotationService.deleteQuotation(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class CreateQuotationRequest {
        private Long leadId;
        private List<QuotationService.QuotationItemRequest> items;
        private Double tax;
        private Double discount;
    }
}
