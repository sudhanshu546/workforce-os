package com.workforce.os.modules.customer.domain;

import com.workforce.os.common.domain.BaseEntity; // Assuming BaseEntity is available
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "customer_addresses")
public class CustomerAddress extends BaseEntity { // Extends BaseEntity for tenantId, createdAt, updatedAt

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    private boolean isDefault;
}
