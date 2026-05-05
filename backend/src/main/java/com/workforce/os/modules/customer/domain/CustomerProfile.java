package com.workforce.os.modules.customer.domain;

import com.workforce.os.common.domain.BaseEntity; // Assuming BaseEntity is available
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "customer_profiles")
public class CustomerProfile extends BaseEntity { // Extends BaseEntity for tenantId, createdAt, updatedAt

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, optional = false) // One-to-one with Customer
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    private Customer customer;

    private String name; // e.g., "John Doe" or "Acme Corp"
    // Add other profile-specific fields here as needed
    // e.g., company name, business type, etc.
}
