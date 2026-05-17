package com.workforce.os.modules.inventory.domain;

import com.workforce.os.common.domain.BaseEntity;
import com.workforce.os.modules.organization.domain.Organization;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "materials")
public class Material extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @Column(nullable = false)
    private String name;

    private String description;

    private String sku;

    private Double quantity;

    private Double minThreshold = 0.0;

    private String unit;

    private Double price;
}
