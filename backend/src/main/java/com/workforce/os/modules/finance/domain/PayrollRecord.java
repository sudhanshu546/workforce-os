package com.workforce.os.modules.finance.domain;

import com.workforce.os.common.domain.BaseEntity;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_records")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRecord extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id")
    private WorkerProfile worker;

    private LocalDate monthYear; // First day of the month

    private Double baseSalary;
    private Double approvedReimbursements;
    private Double performanceBonuses;
    private Double deductions;
    private Double totalPayout;

    @Enumerated(EnumType.STRING)
    private PayrollStatus status = PayrollStatus.DRAFT;

    private LocalDateTime generatedAt = LocalDateTime.now();
    private LocalDateTime paidAt;

    public enum PayrollStatus {
        DRAFT, APPROVED, PAID, CANCELLED
    }
}
