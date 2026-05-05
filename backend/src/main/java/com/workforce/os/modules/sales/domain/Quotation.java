package com.workforce.os.modules.sales.domain;

import com.workforce.os.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "quotations")
public class Quotation extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "lead_id")
    private Lead lead;

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
