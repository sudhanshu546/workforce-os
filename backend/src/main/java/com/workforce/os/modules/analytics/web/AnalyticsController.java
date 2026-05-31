package com.workforce.os.modules.analytics.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.analytics.dto.ProfitabilityDTO;
import com.workforce.os.modules.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.workforce.os.modules.analytics.dto.AnalyticsResponse;
import com.workforce.os.modules.analytics.dto.WorkerUtilizationDTO;
import com.workforce.os.common.context.TenantContext;

import static com.workforce.os.common.util.MessageConstants.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @GetMapping("/worker-utilization")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<WorkerUtilizationDTO>>> getWorkerUtilization() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getWorkerUtilization(), WORKER_UTILIZATION_RETRIEVED));
    }

    @GetMapping("/profitability")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<ProfitabilityDTO>>> getProfitability() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getJobProfitability(), PROFITABILITY_RETRIEVED));
    }

    @GetMapping("/owner")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getOwnerAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getOwnerAnalytics(), OWNER_ANALYTICS_RETRIEVED));
    }

    @GetMapping("/report-pdf")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<byte[]> downloadPerformanceReport() {
        String tenantId = TenantContext.getCurrentTenant();
        AnalyticsResponse stats = analyticsService.getOwnerAnalytics();
        List<ProfitabilityDTO> profitability = analyticsService.getJobProfitability();
        
        java.util.Map<String, Object> vars = new java.util.HashMap<>();
        vars.put("stats", stats);
        vars.put("profitability", profitability);
        vars.put("generatedAt", java.time.LocalDateTime.now().toString());
        
        // Add Organization Branding
        com.workforce.os.modules.organization.repository.OrganizationRepository orgRepo = 
            org.springframework.web.context.ContextLoader.getCurrentWebApplicationContext().getBean(com.workforce.os.modules.organization.repository.OrganizationRepository.class);
        orgRepo.findByTenantId(tenantId).ifPresent(org -> vars.put("organization", org));
        
        byte[] pdfBytes = ((com.workforce.os.modules.finance.service.FinanceService) 
            org.springframework.web.context.ContextLoader.getCurrentWebApplicationContext().getBean("financeService"))
            .getPdfService().generatePdf("analytics/performance-report", vars);
            
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=performance-report.pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
