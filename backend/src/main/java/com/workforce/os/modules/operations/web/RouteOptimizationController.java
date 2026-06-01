package com.workforce.os.modules.operations.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.operations.dto.RouteOptimizationResponse;
import com.workforce.os.modules.operations.service.RouteOptimizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

import static com.workforce.os.common.util.MessageConstants.*;

@RestController
@RequestMapping("/api/v1/operations/route")
@RequiredArgsConstructor
public class RouteOptimizationController {

    private final RouteOptimizationService routeOptimizationService;

    @GetMapping("/optimize/{workerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<RouteOptimizationResponse>> optimizeRoute(
            @PathVariable Long workerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        return ResponseEntity.ok(ApiResponse.success(
            routeOptimizationService.optimizeDailyRoute(workerId, date),
            ROUTE_OPTIMIZED
        ));
    }
}
