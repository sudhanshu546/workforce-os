package com.workforce.os.modules.finance.domain;

import com.workforce.os.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "invoice_items")
public class InvoiceItem extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    private String description;
    private Double quantity;
    private Double unitPrice;
    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    private ItemType type;

    public enum ItemType {
        SERVICE, MATERIAL
    }
}
