package com.workforce.os.modules.analytics.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.analytics.dto.AnalyticsResponse;
import com.workforce.os.modules.finance.repository.InvoiceRepository;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.workforce.os.modules.analytics.dto.ProfitabilityDTO;
import com.workforce.os.modules.finance.domain.Expense;
import com.workforce.os.modules.finance.repository.ExpenseRepository;
import com.workforce.os.modules.operations.domain.WorkOrder;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final InvoiceRepository invoiceRepository;
    private final WorkOrderRepository workOrderRepository;
    private final ExpenseRepository expenseRepository;

    @Transactional(readOnly = true)
    public List<ProfitabilityDTO> getJobProfitability() {
        String tenantId = TenantContext.getCurrentTenant();
        List<WorkOrder> completedOrders = workOrderRepository.findByTenantIdAndStatus(tenantId, WorkOrder.WorkOrderStatus.COMPLETED);

        return completedOrders.stream().map(wo -> {
            Double revenue = (wo.getQuotation() != null && wo.getQuotation().getTotalAmount() != null) 
                    ? wo.getQuotation().getTotalAmount() : 0.0;
            
            // Force initialization of lazy relationships within the transaction
            Double materialCost = 0.0;
            if (wo.getMaterials() != null) {
                materialCost = wo.getMaterials().stream()
                        .mapToDouble(m -> m.getUnitPriceAtUse() * m.getQuantityUsed()).sum();
            }
            
            WorkerProfile worker = wo.getAssignedWorker();
            Double workerSalary = (worker != null && worker.getSalaryAmount() != null) ? 
                    worker.getSalaryAmount() : 20000.0; 
            
            long hoursSpent = wo.getStartTime() != null && wo.getEndTime() != null ? 
                    ChronoUnit.HOURS.between(wo.getStartTime(), wo.getEndTime()) : 2;
            Double laborCost = (workerSalary / 176) * Math.max(1, hoursSpent);

            Double netProfit = revenue - materialCost - laborCost;
            Double margin = revenue > 0 ? (netProfit / revenue) * 100 : 0.0;

            return ProfitabilityDTO.builder()
                    .workOrderId(wo.getId())
                    .customerName(wo.getCustomer() != null ? wo.getCustomer().getName() : "Unknown")
                    .revenue(revenue)
                    .materialCost(materialCost)
                    .estimatedLaborCost(laborCost)
                    .netProfit(netProfit)
                    .profitMargin(margin)
                    .build();
        }).collect(Collectors.toList());
    }

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
