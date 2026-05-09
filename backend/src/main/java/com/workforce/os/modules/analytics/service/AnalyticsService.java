package com.workforce.os.modules.analytics.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.analytics.dto.AnalyticsResponse;
import com.workforce.os.modules.finance.repository.InvoiceRepository;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final InvoiceRepository invoiceRepository;
    private final WorkOrderRepository workOrderRepository;

    public AnalyticsResponse getOwnerAnalytics() {
        String tenantId = TenantContext.getCurrentTenant();

        // 1. Placeholder for Monthly Revenue trends
        Map<String, Double> monthlyRevenue = new HashMap<>();
        monthlyRevenue.put("April", 50000.0);
        monthlyRevenue.put("May", 75000.0);

        // 2. Tasks by Status
        Map<String, Long> tasksByStatus = new HashMap<>();
        tasksByStatus.put("COMPLETED", 150L);
        tasksByStatus.put("IN_PROGRESS", 25L);

        return AnalyticsResponse.builder()
                .monthlyRevenue(monthlyRevenue)
                .tasksByStatus(tasksByStatus)
                .averageWorkerEfficiency(4.5)
                .build();
    }
}
