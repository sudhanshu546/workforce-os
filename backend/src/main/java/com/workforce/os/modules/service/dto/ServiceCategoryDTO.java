package com.workforce.os.modules.service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ServiceCategoryDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
