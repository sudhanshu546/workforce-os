package com.workforce.os.modules.finance.domain;

import com.workforce.os.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@Table(name = "tax_configs")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxConfig extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g., "GST", "VAT", "Sales Tax"

    @Column(nullable = false)
    private Double rate; // e.g., 18.0

    private String region; // e.g., "State", "Country", or "DEFAULT"

    private boolean isDefault = false;

    private boolean active = true;
}
