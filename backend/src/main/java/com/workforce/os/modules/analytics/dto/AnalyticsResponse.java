package com.workforce.os.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private Map<String, Double> monthlyRevenue;
    private Map<String, Long> tasksByStatus;
    private List<WorkerUtilizationDTO> workerUtilization;
    private double averageWorkerEfficiency;
}
