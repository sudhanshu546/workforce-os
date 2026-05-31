package com.workforce.os.modules.sales.domain;

import com.workforce.os.common.domain.BaseEntity;
import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.customer.domain.CustomerAddress;
import com.workforce.os.modules.organization.domain.Organization;
import com.workforce.os.modules.service.domain.ServiceItem;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

@Getter
@Setter
@Entity
@Table(name = "leads")
@Filter(name = "customerFilter", condition = "customer_id = :customerId")
public class Lead extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_item_id")
    private ServiceItem requestedService;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_address_id")
    private CustomerAddress customerAddress;

    private String description;

    private java.time.LocalDate preferredDate;
    private java.time.LocalTime preferredTime;

    private String priority;

    @Enumerated(EnumType.STRING)
    private LeadStatus status;

    private Long assignedManagerId;

    public enum LeadStatus {
        NEW, CONTACTED, QUOTED, CONVERTED, LOST
    }
}
