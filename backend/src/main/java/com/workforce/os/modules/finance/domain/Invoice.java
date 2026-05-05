package com.workforce.os.modules.finance.domain;

import com.workforce.os.common.domain.BaseEntity;
import com.workforce.os.modules.operations.domain.WorkOrder;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "invoices")
public class Invoice extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "work_order_id")
    private WorkOrder workOrder;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    private Double subtotal;
    private Double tax;
    private Double total;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    public enum InvoiceStatus {
        DRAFT, ISSUED, PAID, CANCELLED
    }
}
