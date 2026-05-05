package com.workforce.os.modules.attendance.web;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.attendance.domain.Attendance;
import com.workforce.os.modules.attendance.repository.AttendanceRepository;
import com.workforce.os.modules.attendance.service.AttendanceService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceRepository attendanceRepository;

    @GetMapping
    public ResponseEntity<Page<Attendance>> getAllAttendance(Pageable pageable) {
        return ResponseEntity.ok(attendanceRepository.findByTenantIdOrderByClockInDesc(TenantContext.getCurrentTenant(), pageable));
    }

    @PostMapping("/clock-in")
    public ResponseEntity<Attendance> clockIn(@RequestBody ClockInRequest request) {
        return ResponseEntity.ok(attendanceService.clockIn(request.getWorkerId(), request.getWorkOrderId(), request.getLatitude(), request.getLongitude(), request.getStatus()));
    }

    @PostMapping("/clock-out")
    public ResponseEntity<Attendance> clockOut(@RequestBody ClockOutRequest request) {
        return ResponseEntity.ok(attendanceService.clockOut(request.getWorkerId(), request.getWorkOrderId(), request.getLatitude(), request.getLongitude()));
    }

    @GetMapping("/status")
    public ResponseEntity<Boolean> getStatus(@RequestParam Long workerId) {
        return ResponseEntity.ok(attendanceService.isWorkerClockedIn(workerId));
    }

    @Data
    public static class ClockInRequest {
        private Long workerId;
        private Long workOrderId;
        private Double latitude;
        private Double longitude;
        private String status;
    }

    @Data
    public static class ClockOutRequest {
        private Long workerId;
        private Long workOrderId;
        private Double latitude;
        private Double longitude;
    }
}
