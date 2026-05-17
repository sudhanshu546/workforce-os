package com.workforce.os.modules.attendance.web;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.attendance.domain.Attendance;
import com.workforce.os.modules.attendance.repository.AttendanceRepository;
import com.workforce.os.modules.attendance.service.AttendanceService;
import com.workforce.os.modules.attendance.dto.AttendanceResponseDTO;
import com.workforce.os.modules.attendance.mapper.AttendanceMapper;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.workforce.os.modules.identity.domain.User;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceRepository attendanceRepository;
    private final AttendanceMapper attendanceMapper;
    private final WorkerProfileRepository workerProfileRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<AttendanceResponseDTO>>> getAllAttendance(Pageable pageable) {
        Page<Attendance> attendance = attendanceRepository.findByTenantIdOrderByClockInDesc(TenantContext.getCurrentTenant(), pageable);
        return ResponseEntity.ok(ApiResponse.success(attendance.map(attendanceMapper::toDTO), "Attendance records retrieved"));
    }

    private void validateAccess(Long workerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        boolean isManager = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_OWNER") || a.getAuthority().equals("ROLE_MANAGER"));
        if (!isManager) {
            WorkerProfile worker = workerProfileRepository.findById(workerId).orElseThrow();
            if (!worker.getUser().getId().equals(currentUser.getId())) {
                throw new RuntimeException("Unauthorized: You can only clock in/out for yourself.");
            }
        }
    }

    @PostMapping("/clock-in")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<AttendanceResponseDTO>> clockIn(@Valid @RequestBody ClockInRequest request) {
        validateAccess(request.getWorkerId());
        Attendance attendance = attendanceService.clockIn(request.getWorkerId(), request.getWorkOrderId(), request.getLatitude(), request.getLongitude(), request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(attendanceMapper.toDTO(attendance), "Clocked in successfully"));
    }

    @PostMapping("/clock-out")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<AttendanceResponseDTO>> clockOut(@Valid @RequestBody ClockOutRequest request) {
        validateAccess(request.getWorkerId());
        Attendance attendance = attendanceService.clockOut(request.getWorkerId(), request.getWorkOrderId(), request.getLatitude(), request.getLongitude());
        return ResponseEntity.ok(ApiResponse.success(attendanceMapper.toDTO(attendance), "Clocked out successfully"));
    }


    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<Boolean>> getStatus(@RequestParam Long workerId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.isWorkerClockedIn(workerId), "Status retrieved"));
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
