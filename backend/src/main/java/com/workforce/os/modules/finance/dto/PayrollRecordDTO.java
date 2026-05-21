package com.workforce.os.modules.finance.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class PayrollRecordDTO {
    private Long id;
    private String workerName;
    private String workerDesignation;
    private LocalDate monthYear;
    private Double baseSalary;
    private Double approvedReimbursements;
    private Double totalPayout;
    private String status;
}
