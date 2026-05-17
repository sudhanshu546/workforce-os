package com.workforce.os.modules.workforce.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.dto.WorkerProfileDTO;
import com.workforce.os.modules.workforce.mapper.WorkerMapper;
import com.workforce.os.modules.workforce.service.WorkerAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/assignment")
@RequiredArgsConstructor
public class WorkerAssignmentController {

    private final WorkerAssignmentService assignmentService;
    private final WorkerMapper workerMapper;

    @GetMapping("/eligible-workers")
    public ResponseEntity<ApiResponse<List<WorkerProfileDTO>>> getEligibleWorkers(@RequestParam Long serviceId) {
        List<WorkerProfile> workers = assignmentService.getEligibleWorkers(serviceId);
        List<WorkerProfileDTO> dtos = workers.stream()
                .map(workerMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "Eligible workers retrieved successfully"));
    }
}
