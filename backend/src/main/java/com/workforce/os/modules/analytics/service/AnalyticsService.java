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

import java.time.format.TextStyle;
import java.util.Locale;
import java.util.TreeMap;

import com.workforce.os.modules.analytics.dto.WorkerUtilizationDTO;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final InvoiceRepository invoiceRepository;
    private final WorkOrderRepository workOrderRepository;
    private final ExpenseRepository expenseRepository;

    @Transactional(readOnly = true)
    public List<WorkerUtilizationDTO> getWorkerUtilization() {
        String tenantId = TenantContext.getCurrentTenant();
        List<com.workforce.os.modules.workforce.domain.WorkerProfile> workers = 
            org.springframework.web.context.ContextLoader.getCurrentWebApplicationContext()
            .getBean(com.workforce.os.modules.workforce.repository.WorkerProfileRepository.class)
            .findAllByTenantId(tenantId);
            
        List<com.workforce.os.modules.attendance.domain.Attendance> allAttendance = 
            org.springframework.web.context.ContextLoader.getCurrentWebApplicationContext()
            .getBean(com.workforce.os.modules.attendance.repository.AttendanceRepository.class)
            .findAllByTenantId(tenantId);
            
        List<com.workforce.os.modules.operations.domain.WorkOrder> allWorkOrders = 
            workOrderRepository.findAllByTenantIdOrderByCreatedAtDesc(tenantId);

        return workers.stream().map(worker -> {
            List<com.workforce.os.modules.attendance.domain.Attendance> workerAttendance = allAttendance.stream()
                .filter(a -> a.getWorker() != null && a.getWorker().getId().equals(worker.getId())).toList();
            
            double totalHours = workerAttendance.stream().mapToDouble(a -> a.getTotalHours() != null ? a.getTotalHours() : 0.0).sum();
            
            List<com.workforce.os.modules.operations.domain.WorkOrder> workerOrders = allWorkOrders.stream()
                .filter(wo -> wo.getAssignedWorker() != null && wo.getAssignedWorker().getId().equals(worker.getId())).toList();
            
            long completedJobs = workerOrders.stream().filter(wo -> wo.getStatus() == com.workforce.os.modules.operations.domain.WorkOrder.WorkOrderStatus.COMPLETED).count();
            
            double jobHours = completedJobs * 4.0;
            double utilization = totalHours > 0 ? (jobHours / totalHours) * 100 : 0.0;
            
            Double avgRating = org.springframework.web.context.ContextLoader.getCurrentWebApplicationContext()
                .getBean(com.workforce.os.modules.operations.service.ReviewService.class)
                .getAverageRating(worker.getId());

            return WorkerUtilizationDTO.builder()
                    .workerId(worker.getId())
                    .workerName(worker.getUser().getName())
                    .totalHours(totalHours)
                    .jobHours(jobHours)
                    .utilizationRate(Math.min(100.0, utilization))
                    .completedJobs(completedJobs)
                    .averageRating(avgRating)
                    .build();
        }).collect(Collectors.toList());
    }

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

    @Transactional(readOnly = true)
    public AnalyticsResponse getOwnerAnalytics() {
        String tenantId = TenantContext.getCurrentTenant();

        // 1. Real Monthly Revenue trends (PAID invoices) - Chronologically sorted
        List<com.workforce.os.modules.finance.domain.Invoice> invoices = invoiceRepository.findAllByTenantId(tenantId);
        
        // Use LinkedHashMap to preserve insertion order (after sorting keys)
        java.util.Map<java.time.YearMonth, Double> sortedMonthlyData = new java.util.TreeMap<>();
        
        invoices.stream()
            .filter(i -> i.getStatus() == com.workforce.os.modules.finance.domain.Invoice.InvoiceStatus.PAID)
            .forEach(i -> {
                java.time.YearMonth yearMonth = java.time.YearMonth.from(i.getCreatedAt());
                sortedMonthlyData.merge(yearMonth, i.getTotal(), Double::sum);
            });

        Map<String, Double> monthlyRevenue = new java.util.LinkedHashMap<>();
        sortedMonthlyData.forEach((ym, total) -> {
            String label = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + ym.getYear();
            monthlyRevenue.put(label, total);
        });

        // 2. Tasks by Status
        List<WorkOrder> allOrders = workOrderRepository.findAllByTenantIdOrderByCreatedAtDesc(tenantId);
        Map<String, Long> tasksByStatus = allOrders.stream()
            .collect(Collectors.groupingBy(wo -> wo.getStatus().name(), Collectors.counting()));

        // 3. Worker Efficiency (Simple placeholder for now based on average rating if we had it, or just 5.0)
        double avgEfficiency = 4.8; 

        return AnalyticsResponse.builder()
                .monthlyRevenue(monthlyRevenue)
                .tasksByStatus(tasksByStatus)
                .workerUtilization(getWorkerUtilization())
                .averageWorkerEfficiency(avgEfficiency)
                .build();
    }
}
