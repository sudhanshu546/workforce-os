package com.workforce.os.modules.workforce.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class WorkerProfileDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String designation;
    private LocalDate joiningDate;
    private String status;
    private String salaryType;
    private Double salaryAmount;
    private List<WorkerSkillDTO> skills;
    private List<com.workforce.os.modules.service.dto.ServiceItemDTO> supportedServices;
}
