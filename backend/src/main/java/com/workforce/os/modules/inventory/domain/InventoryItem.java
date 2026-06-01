package com.workforce.os.modules.inventory.domain;

import com.workforce.os.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "inventory_items")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItem extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(unique = true, nullable = false)
    private String serialNumber; // Also used for QR code value

    @Enumerated(EnumType.STRING)
    private ItemStatus status = ItemStatus.IN_STOCK;

    private Long currentlyAssignedToWorkerId;
    
    private Long assignedToWorkOrderId;

    private LocalDateTime lastScannedAt;

    public enum ItemStatus {
        IN_STOCK, ASSIGNED_TO_WORKER, CONSUMED, MAINTENANCE, LOST
    }
}
