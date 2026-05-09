package com.workforce.os.modules.workforce.service;

import com.workforce.os.modules.attendance.domain.Attendance;
import com.workforce.os.modules.attendance.domain.Attendance.AttendanceStatus;
import com.workforce.os.modules.attendance.repository.AttendanceRepository;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkerAssignmentService {

    @Autowired
    private WorkerProfileRepository workerRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    public List<WorkerProfile> getEligibleWorkers(Long serviceId) {
        // 1. Get all workers supporting the service
        List<WorkerProfile> candidates = workerRepository.findBySupportedServices_Id(serviceId);

        // 2. Filter: Clocked-in and available
        return candidates.stream()
                .filter(this::isClockedInAndAvailable)
                .collect(Collectors.toList());
    }

    private boolean isClockedInAndAvailable(WorkerProfile worker) {
        List<Attendance> attendances = attendanceRepository.findByWorkerIdAndStatusIn(
                worker.getId(), 
                List.of(AttendanceStatus.ON_FIELD, AttendanceStatus.ON_JOB)
        );
        
        // Simple logic: Is present and not currently on a job
        return !attendances.isEmpty() && attendances.stream()
                .noneMatch(a -> a.getStatus() == AttendanceStatus.ON_JOB);
    }
}
