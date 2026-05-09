package com.workforce.os.modules.dashboard.web;

import com.workforce.os.modules.dashboard.dto.OwnerStatsResponse;
import com.workforce.os.modules.dashboard.dto.WorkerStatsResponse;
import com.workforce.os.modules.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<OwnerStatsResponse> getOwnerStats() {
        return ResponseEntity.ok(dashboardService.getOwnerStats());
    }

    @GetMapping("/worker")
    public ResponseEntity<WorkerStatsResponse> getWorkerStats(@RequestParam Long workerId) {
        return ResponseEntity.ok(dashboardService.getWorkerStats(workerId));
    }
}
