package com.workforce.os.modules.operations.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LiveOpsMarker {
    private Long workOrderId;
    private String customerName;
    private String workerName;
    private String status;
    private Double latitude;
    private Double longitude;
    private String lastUpdated;
}
