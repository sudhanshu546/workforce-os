package com.workforce.os.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerUtilizationDTO {
    private Long workerId;
    private String workerName;
    private Double totalHours;
    private Double jobHours;
    private Double utilizationRate; // (jobHours / totalHours) * 100
    private Double averageRating;
    private Long completedJobs;
}
