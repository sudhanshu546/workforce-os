package com.workforce.os.modules.sales.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LeadRequestDTO {
    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer phone is required")
    private String customerPhone;

    private String customerEmail;

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    @NotNull(message = "Service Item ID is required")
    private Long serviceItemId;

    @NotNull(message = "Customer Address ID is required")
    private Long customerAddressId;

    private String description;
    private java.time.LocalDate preferredDate;
    private java.time.LocalTime preferredTime;
    private String priority;
    private String status;
}
