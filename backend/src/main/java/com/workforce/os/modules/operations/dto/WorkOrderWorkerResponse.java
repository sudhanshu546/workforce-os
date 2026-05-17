package com.workforce.os.modules.operations.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class WorkOrderWorkerResponse {
    private Long id;
    private String status;
    private String scheduledDate;
    private String serviceName;
    private Double totalAmount;
    
    private CustomerDTO customer;
    private List<TaskDTO> tasks;
    private List<EvidenceDTO> evidence;
    private List<MaterialDTO> materials;

    @Data
    @Builder
    public static class CustomerDTO {
        private Long id;
        private String name;
        private String phone;
        private String address;
        private Double latitude;
        private Double longitude;
    }

    @Data
    @Builder
    public static class TaskDTO {
        private Long id;
        private String description;
        private boolean completed;
    }

    @Data
    @Builder
    public static class EvidenceDTO {
        private Long id;
        private String imageUrl;
        private String notes;
    }

    @Data
    @Builder
    public static class MaterialDTO {
        private Long id;
        private String materialName;
        private Double quantityUsed;
        private Double unitPriceAtUse;
        private String unit;
    }
}
