package com.workforce.os.modules.workforce.web;

import lombok.Data;

import java.time.LocalDate;

@Data
public class WorkerOnboardingRequest {
    private String name;
    private String email;
    private String phone;
    private String password;
    private Long organizationId;
    private Long branchId;
    private String designation;
    private LocalDate joiningDate;
    private String salaryType;
    private Double salaryAmount;
    private String status;
}
