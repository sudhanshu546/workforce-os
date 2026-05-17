package com.workforce.os.modules.dashboard.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.attendance.service.AttendanceService;
import com.workforce.os.modules.dashboard.dto.OwnerStatsResponse;
import com.workforce.os.modules.dashboard.dto.WorkerStatsResponse;
import com.workforce.os.modules.finance.repository.InvoiceRepository;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.sales.repository.LeadRepository;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LeadRepository leadRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final InvoiceRepository invoiceRepository;
    private final AttendanceService attendanceService;

    public OwnerStatsResponse getOwnerStats() {
        String tenantId = TenantContext.getCurrentTenant();
        
        long totalLeads = leadRepository.countByTenantId(tenantId);
        long activeWorkOrders = workOrderRepository.countByTenantId(tenantId);
        long totalWorkers = workerProfileRepository.countByTenantId(tenantId);
        Double totalRevenue = invoiceRepository.sumTotalByTenantIdAndStatusPaid(tenantId);

        // Placeholder for recent activities - in a real app, you'd fetch this from an activity log table
        List<OwnerStatsResponse.RecentActivity> activities = new ArrayList<>();
        activities.add(OwnerStatsResponse.RecentActivity.builder()
                .title("New Lead Registered")
                .time("Just now")
                .type("LEAD")
                .build());

        return OwnerStatsResponse.builder()
                .totalLeads(totalLeads)
                .activeWorkOrders(activeWorkOrders)
                .totalWorkers(totalWorkers)
                .totalRevenue(totalRevenue != null ? totalRevenue : 0.0)
                .recentActivities(activities)
                .build();
    }

    public WorkerStatsResponse getWorkerStats(Long workerId) {
        // Pending tasks are work orders assigned to worker that are not COMPLETED
        long pendingTasks = workOrderRepository.countByAssignedWorkerIdAndStatusNot(workerId, WorkOrder.WorkOrderStatus.COMPLETED);
        long completedToday = workOrderRepository.countByAssignedWorkerIdAndStatus(workerId, WorkOrder.WorkOrderStatus.COMPLETED); // Simplified for today
        boolean clockedIn = attendanceService.isWorkerClockedIn(workerId);

        return WorkerStatsResponse.builder()
                .pendingTasks(pendingTasks)
                .completedTasksToday(completedToday)
                .activeWorkOrders(pendingTasks)
                .earningsThisMonth(0.0) // Placeholder
                .clockedIn(clockedIn)
                .build();
    }
}
