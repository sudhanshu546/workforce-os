package com.workforce.os.modules.workforce.domain;

import com.workforce.os.common.domain.BaseEntity;
import com.workforce.os.modules.identity.domain.User;
import com.workforce.os.modules.organization.domain.Branch;
import com.workforce.os.modules.organization.domain.Organization;
import com.workforce.os.modules.service.domain.ServiceItem;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "worker_profiles")
@NamedEntityGraph(
    name = "WorkerProfile.detail",
    attributeNodes = {
        @NamedAttributeNode("user"),
        @NamedAttributeNode("organization"),
        @NamedAttributeNode("branch")
    }
)
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

    @OneToMany(mappedBy = "worker", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<WorkerSkill> skills = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "worker_supported_services",
        joinColumns = @JoinColumn(name = "worker_id"),
        inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    private Set<ServiceItem> supportedServices = new HashSet<>();

    public enum WorkerStatus {
        ACTIVE, INACTIVE, ON_LEAVE
    }
}
