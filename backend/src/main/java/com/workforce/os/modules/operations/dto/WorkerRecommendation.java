package com.workforce.os.modules.operations.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerRecommendation {
    private Long workerId;
    private String name;
    private String designation;
    private Double distanceKm;
    private Double matchScore; // 0.0 to 1.0
    private boolean skillMatch;
    private String lastUpdated;
}
