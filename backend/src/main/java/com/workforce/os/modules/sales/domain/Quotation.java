package com.workforce.os.modules.sales.domain;

import com.workforce.os.common.domain.BaseEntity;
import com.workforce.os.modules.customer.domain.Customer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "quotations")
@Filter(name = "customerFilter", condition = "customer_id = :customerId")
public class Quotation extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "lead_id")
    private Lead lead;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuotationItem> items = new ArrayList<>();

    private Double subtotal = 0.0;
    private Double tax = 0.0;
    private Double discount = 0.0;
    private Double totalAmount = 0.0;

    @Enumerated(EnumType.STRING)
    private QuotationStatus status;

    public void calculateTotals() {
        this.subtotal = items.stream()
                .mapToDouble(item -> {
                    item.setTotalAmount(item.getQuantity() * item.getUnitPrice());
                    return item.getTotalAmount();
                })
                .sum();
        this.totalAmount = this.subtotal + this.tax - this.discount;
    }

    public enum QuotationStatus {
        DRAFT, SENT, APPROVED, REJECTED
    }
}
