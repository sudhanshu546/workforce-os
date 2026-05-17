package com.workforce.os.modules.dashboard.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.dashboard.dto.OwnerStatsResponse;
import com.workforce.os.modules.dashboard.dto.WorkerStatsResponse;
import com.workforce.os.modules.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/owner")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<OwnerStatsResponse>> getOwnerStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getOwnerStats(), "Owner stats retrieved successfully"));
    }

    @GetMapping("/worker")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<WorkerStatsResponse>> getWorkerStats(@RequestParam Long workerId) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getWorkerStats(workerId), "Worker stats retrieved successfully"));
    }
}
