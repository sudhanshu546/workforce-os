package com.workforce.os.modules.finance.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ExpenseResponseDTO {
    private Long id;
    private Long workOrderId;
    private Long workerId;
    private String workerName;
    private String category;
    private Double amount;
    private String description;
    private String receiptImageUrl;
    private String status;
    private LocalDateTime createdAt;
}
