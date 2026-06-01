package com.workforce.os.modules.workforce.domain;

import com.workforce.os.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@Table(name = "worker_stats")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerStats extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private WorkerProfile worker;

    private Integer totalPoints = 0;
    
    private Integer level = 1;

    private Integer completedJobs = 0;

    private Double averageRating = 0.0;

    @ElementCollection
    @CollectionTable(name = "worker_badges", joinColumns = @JoinColumn(name = "stats_id"))
    @Column(name = "badge_key")
    private java.util.Set<String> badges = new java.util.HashSet<>();
}
