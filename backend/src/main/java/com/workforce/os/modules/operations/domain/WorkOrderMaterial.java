package com.workforce.os.modules.operations.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.workforce.os.common.domain.BaseEntity;
import com.workforce.os.modules.inventory.domain.Material;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "work_order_materials")
public class WorkOrderMaterial extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id")
    @JsonIgnore
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id")
    private Material material;

    private Double quantityUsed;
    private Double unitPriceAtUse;
}
