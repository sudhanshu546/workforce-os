package com.workforce.os.modules.attendance.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AttendanceResponseDTO {
    private Long id;
    private Long workerId;
    private String workerName;
    private Long workOrderId;
    private LocalDateTime clockIn;
    private LocalDateTime clockOut;
    private Double totalHours;
    private String status;
}
