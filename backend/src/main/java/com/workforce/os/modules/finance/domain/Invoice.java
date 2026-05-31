package com.workforce.os.modules.finance.domain;

import com.workforce.os.common.domain.BaseEntity;
import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.operations.domain.WorkOrder;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.annotations.BatchSize;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

@Getter
@Setter
@Entity
@Table(name = "invoices")
@BatchSize(size = 20)
@Filter(name = "customerFilter", condition = "customer_id = :customerId")
public class Invoice extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "work_order_id")
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    private Double subtotal;
    private Double tax;
    private Double total;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    private java.util.List<InvoiceItem> items = new java.util.ArrayList<>();

    public enum InvoiceStatus {
        DRAFT, ISSUED, PAID, CANCELLED
    }
}
