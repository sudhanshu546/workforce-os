package com.workforce.os.modules.finance.domain;

import com.workforce.os.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "payments")
public class Payment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    private Double amount;

    private String paymentMethod;

    private String paymentStatus;

    private String transactionReference;

    @Column(name = "collected_by_worker_id")
    private Long collectedByWorkerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collected_by_worker_id", insertable = false, updatable = false)
    private com.workforce.os.modules.workforce.domain.WorkerProfile collectedByWorker;

    private Long verifiedByOwnerId;
}
