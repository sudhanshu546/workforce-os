package com.workforce.os.modules.workforce.domain;

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
@Table(name = "worker_locations")
public class WorkerLocation extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id")
    private WorkerProfile worker;

    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;
    private String status; // e.g., ON_JOB, IDLE
}
