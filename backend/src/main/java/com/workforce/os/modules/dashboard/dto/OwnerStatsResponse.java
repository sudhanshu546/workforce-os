package com.workforce.os.modules.dashboard.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class OwnerStatsResponse {
    private long totalLeads;
    private long activeWorkOrders;
    private long totalWorkers;
    private double totalRevenue;
    private List<RecentActivity> recentActivities;

    @Data
    @Builder
    public static class RecentActivity {
        private String title;
        private String time;
        private String type;
    }
}
