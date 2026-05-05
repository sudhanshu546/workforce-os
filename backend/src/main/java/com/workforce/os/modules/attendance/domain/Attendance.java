package com.workforce.os.modules.attendance.domain;

import com.workforce.os.common.domain.BaseEntity;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "attendance")
public class Attendance extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id")
    private WorkerProfile worker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id")
    private WorkOrder workOrder;

    private LocalDateTime clockIn;
    private LocalDateTime clockOut;
    private Double totalHours;
    private Double latitude;
    private Double longitude;
    
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;

    public enum AttendanceStatus {
        ON_FIELD, ON_JOB, ON_BREAK, CLOCKED_OUT
    }
}
