package com.workforce.os.modules.workforce.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.dto.WorkerProfileDTO;
import com.workforce.os.modules.workforce.mapper.WorkerMapper;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/public/workers")
@RequiredArgsConstructor
public class PublicWorkerController {

    private final WorkerProfileRepository workerProfileRepository;
    private final WorkerMapper workerMapper;

    @GetMapping("/organization/{tenantId}")
    public ResponseEntity<ApiResponse<List<WorkerProfileDTO>>> getWorkersByOrganization(@PathVariable String tenantId) {
        List<WorkerProfile> workers = workerProfileRepository.findAllByTenantId(tenantId);
        List<WorkerProfileDTO> dtos = workers.stream()
                .map(workerMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "Workers retrieved successfully"));
    }
}
