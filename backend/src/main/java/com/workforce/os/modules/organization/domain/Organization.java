package com.workforce.os.modules.organization.domain;

import com.workforce.os.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "organizations")
public class Organization extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String businessName;

    private String businessType;

    private Long ownerId;

    private String registrationNumber;

    private String taxNumber;

    private String logoUrl;

    @Enumerated(EnumType.STRING)
    private OrganizationStatus status;

    public enum OrganizationStatus {
        ACTIVE, INACTIVE, PENDING
    }
}
