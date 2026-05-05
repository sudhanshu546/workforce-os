package com.workforce.os.modules.customer.domain;

import com.workforce.os.common.domain.BaseEntity; // Assuming BaseEntity is available
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "customer_preferences")
public class CustomerPreference extends BaseEntity { // Extends BaseEntity for tenantId, createdAt, updatedAt

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, optional = false) // One-to-one with Customer
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    private Customer customer;

    // Example preference fields
    private boolean receiveEmailNotifications;
    private String preferredContactMethod; // e.g., "EMAIL", "PHONE"
    // Add more preference fields as needed
}
