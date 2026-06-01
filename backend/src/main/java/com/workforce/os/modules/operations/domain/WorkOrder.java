package com.workforce.os.modules.operations.domain;

import com.workforce.os.common.domain.BaseEntity;
import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.customer.domain.CustomerAddress;
import com.workforce.os.modules.sales.domain.Quotation;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "work_orders")
@NamedEntityGraph(
    name = "WorkOrder.detail",
    attributeNodes = {
        @NamedAttributeNode("customer"),
        @NamedAttributeNode("assignedWorker")
    }
)
@Filter(name = "customerFilter", condition = "customer_id = :customerId")
public class WorkOrder extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "quotation_id")
    private Quotation quotation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_address_id")
    private CustomerAddress serviceAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_worker_id")
    private WorkerProfile assignedWorker;

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<WorkOrderTask> tasks = new LinkedHashSet<>();

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<WorkOrderEvidence> evidence = new LinkedHashSet<>();

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<WorkOrderMaterial> materials = new LinkedHashSet<>();

    private LocalDate scheduledDate;
    private LocalTime startTime;
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    private WorkOrderStatus status;

    public enum WorkOrderStatus {
        PENDING_ASSIGNMENT, ASSIGNED, IN_PROGRESS, AWAITING_VERIFICATION, AWAITING_PAYMENT, PAYMENT_PENDING_WORKER, COMPLETED, CANCELLED
    }
}
