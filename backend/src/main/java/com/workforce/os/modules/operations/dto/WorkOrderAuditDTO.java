package com.workforce.os.modules.operations.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WorkOrderAuditDTO {
    private Long id;
    private Long workOrderId;
    private String fromStatus;
    private String toStatus;
    private Double latitude;
    private Double longitude;
    private String actionBy;
    private LocalDateTime timestamp;
    private String notes;
}
