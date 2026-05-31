package com.workforce.os.modules.support.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private Long customerId;
    private String customerName;
    private WorkOrderDTO workOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkOrderDTO {
        private Long id;
    }
}
