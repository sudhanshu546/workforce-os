package com.workforce.os.modules.service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ServiceItemDTO {
    private Long id;
    private Long categoryId;
    private String name;
    private String description;
    private Double basePrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
