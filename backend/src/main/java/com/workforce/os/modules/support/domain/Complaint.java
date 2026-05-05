package com.workforce.os.modules.support.domain;

import com.workforce.os.common.domain.BaseEntity;
import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.operations.domain.WorkOrder;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "complaints")
public class Complaint extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id")
    private WorkOrder workOrder;

    @Column(columnDefinition = "TEXT")
    private String complaintText;

    @Enumerated(EnumType.STRING)
    private ComplaintStatus status;

    public enum ComplaintStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED
    }
}
