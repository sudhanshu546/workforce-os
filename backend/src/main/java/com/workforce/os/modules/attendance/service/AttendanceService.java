package com.workforce.os.modules.attendance.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.exception.BusinessException;
import com.workforce.os.common.exception.ResourceNotFoundException;
import com.workforce.os.modules.attendance.domain.Attendance;
import com.workforce.os.modules.attendance.repository.AttendanceRepository;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import static com.workforce.os.common.util.MessageConstants.*;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final WorkOrderRepository workOrderRepository;

    @Transactional
    public Attendance clockIn(Long workerId, Long workOrderId, Double lat, Double lon, String status) {
        if (isWorkerClockedIn(workerId)) {
            throw new BusinessException(ALREADY_CLOCKED_IN);
        }
        WorkerProfile worker = workerProfileRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException(WORKER_NOT_FOUND));
                
        Attendance attendance = new Attendance();
        attendance.setWorker(worker);
        if (workOrderId != null) {
            attendance.setWorkOrder(workOrderRepository.findById(workOrderId)
                    .orElseThrow(() -> new ResourceNotFoundException(WORK_ORDER_NOT_FOUND)));
        }
        attendance.setClockIn(LocalDateTime.now());
        attendance.setLatitude(lat);
        attendance.setLongitude(lon);
        attendance.setStatus(Attendance.AttendanceStatus.valueOf(status));
        attendance.setTenantId(TenantContext.getCurrentTenant());
        return attendanceRepository.save(attendance);
    }

    @Transactional
    public Attendance clockOut(Long workerId, Long workOrderId, Double lat, Double lon) {
        Attendance attendance;
        if (workOrderId != null) {
            attendance = attendanceRepository.findByWorkerIdAndClockOutIsNull(workerId)
                    .orElseThrow(() -> new BusinessException(NO_ACTIVE_SESSION));
        } else {
            attendance = attendanceRepository.findByWorkerIdAndClockOutIsNull(workerId)
                    .orElseThrow(() -> new BusinessException(NO_ACTIVE_SHIFT));
        }

        attendance.setClockOut(LocalDateTime.now());
        attendance.setStatus(Attendance.AttendanceStatus.CLOCKED_OUT);
        attendance.setLatitude(lat);
        attendance.setLongitude(lon);
        Duration duration = Duration.between(attendance.getClockIn(), attendance.getClockOut());
        attendance.setTotalHours(duration.toMinutes() / 60.0);

        return attendanceRepository.save(attendance);
    }

    public boolean isWorkerClockedIn(Long workerId) {
        return attendanceRepository.findByWorkerIdAndClockOutIsNull(workerId).isPresent();
    }

    public List<Attendance> getAllTenantAttendance() {
        return attendanceRepository.findByTenantIdOrderByClockInDesc(TenantContext.getCurrentTenant());
    }
}
