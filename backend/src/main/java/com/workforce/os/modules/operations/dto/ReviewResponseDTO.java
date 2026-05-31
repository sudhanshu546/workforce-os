package com.workforce.os.modules.operations.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {
    private Long id;
    private Long workOrderId;
    private Long customerId;
    private String customerName;
    private Long workerId;
    private String workerName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
