package com.workforce.os.modules.analytics.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class AnalyticsResponse {
    private Map<String, Double> monthlyRevenue;
    private Map<String, Long> tasksByStatus;
    private double averageWorkerEfficiency; // Hours per task
}
