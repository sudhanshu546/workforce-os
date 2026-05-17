package com.workforce.os.modules.sales.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LeadResponseDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Long organizationId;
    private String organizationName;
    private Long serviceItemId;
    private String serviceItemName;
    private String description;
    private String priority;
    private String status;
    private LocalDateTime createdAt;
    
    private CustomerDTO customer;
    private OrganizationDTO organization;
    private ServiceDTO requestedService;

    @Data
    public static class CustomerDTO {
        private Long id;
        private String name;
        private String phone;
    }

    @Data
    public static class OrganizationDTO {
        private Long id;
        private String businessName;
    }

    @Data
    public static class ServiceDTO {
        private Long id;
        private String name;
    }
    
    // Linked identifiers
    private Long quotationId;
    private Long workOrderId;
    private String workOrderStatus;
    private Long invoiceId;
    private String invoiceStatus;
    private Double invoiceAmount;
}
