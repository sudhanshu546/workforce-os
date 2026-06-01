package com.workforce.os.modules.operations.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class RouteOptimizationResponse {
    private Long workerId;
    private String workerName;
    private String date;
    private List<OptimizedJob> optimizedSequence;
    private Double totalDistanceKm;
    private Double totalTimeMinutes;
    private String optimizationSummary;

    @Data
    @Builder
    public static class OptimizedJob {
        private Long workOrderId;
        private String customerName;
        private String address;
        private Integer sequenceOrder;
        private Double distanceFromPreviousKm;
        private Double travelTimeMinutes;
        private Double latitude;
        private Double longitude;
    }
}
