package com.workforce.os.modules.operations.domain;

import com.workforce.os.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "work_order_audits")
public class WorkOrderAudit extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id")
    private WorkOrder workOrder;

    private String fromStatus;
    private String toStatus;

    private Double latitude;
    private Double longitude;

    private String actionBy;
    private LocalDateTime timestamp;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
}
