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

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @GetMapping("/profitability")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<ProfitabilityDTO>>> getProfitability() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getJobProfitability(), "Profitability data retrieved"));
    }
}
