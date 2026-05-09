package com.workforce.os.modules.dashboard.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WorkerStatsResponse {
    private long pendingTasks;
    private long completedTasksToday;
    private long activeWorkOrders;
    private double earningsThisMonth;
    private boolean clockedIn;
}
