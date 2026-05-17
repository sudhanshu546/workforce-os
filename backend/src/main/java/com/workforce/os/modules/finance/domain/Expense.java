package com.workforce.os.modules.finance.domain;

import com.workforce.os.common.domain.BaseEntity;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "field_expenses")
@Getter
@Setter
public class Expense extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id")
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id")
    private WorkerProfile worker;

    private String category; // FUEL, MATERIALS, PARKING, OTHER
    
    private Double amount;
    
    private String description;

    @Column(columnDefinition = "TEXT")
    private String receiptImageUrl;

    @Enumerated(EnumType.STRING)
    private ExpenseStatus status = ExpenseStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ExpenseStatus {
        PENDING, APPROVED, REJECTED, REIMBURSED
    }
}
