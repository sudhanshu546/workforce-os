package com.workforce.os.modules.operations.domain;

import com.workforce.os.common.domain.BaseEntity;
import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@Table(name = "work_order_reviews")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private WorkerProfile worker;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 1000)
    private String comment;
}
