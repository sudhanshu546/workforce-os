package com.workforce.os.modules.operations.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class WorkOrderResponseDTO {
    private Long id;
    private String status;
    private LocalDate scheduledDate;
    private LocalTime startTime;
    private LocalTime endTime;
    
    private Long customerId;
    private String customerName;
    private String customerPhone;
    
    private CustomerDTO customer;

    @Data
    public static class CustomerDTO {
        private Long id;
        private String name;
        private String phone;
    }
    
    private Long assignedWorkerId;
    private String assignedWorkerName;
    private String organizationName;
    private String serviceName;
    private Double totalAmount;
    private String customerAddress;
    
    private List<TaskDTO> tasks;
    private List<EvidenceDTO> evidence;
    private List<MaterialDTO> materials;
    private QuotationDTO quotation;
    private Object invoice; // Using Object to avoid strict dependency for now, or use a proper DTO

    @Data
    public static class QuotationDTO {
        private Long id;
        private Double subtotal;
        private Double tax;
        private Double discount;
        private Double totalAmount;
        private List<QuotationItemDTO> items;
    }

    @Data
    public static class QuotationItemDTO {
        private String description;
        private Integer quantity;
        private Double unitPrice;
        private Double totalAmount;
    }

    @Data
    public static class TaskDTO {
        private Long id;
        private String description;
        private boolean completed;
    }

    @Data
    public static class EvidenceDTO {
        private Long id;
        private String imageUrl;
        private String notes;
    }

    @Data
    public static class MaterialDTO {
        private Long id;
        private String materialName;
        private Double quantityUsed;
        private Double unitPriceAtUse;
        private String unit;
    }
}
