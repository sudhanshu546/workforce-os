package com.workforce.os.modules.workforce.domain;

import com.workforce.os.common.domain.BaseEntity;
import com.workforce.os.modules.identity.domain.User;
import com.workforce.os.modules.organization.domain.Branch;
import com.workforce.os.modules.organization.domain.Organization;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "worker_profiles")
public class WorkerProfile extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;

    private String designation;

    private LocalDate joiningDate;

    private String salaryType;

    private Double salaryAmount;

    @Enumerated(EnumType.STRING)
    private WorkerStatus status;

    public enum WorkerStatus {
        ACTIVE, INACTIVE, ON_LEAVE
    }
}
