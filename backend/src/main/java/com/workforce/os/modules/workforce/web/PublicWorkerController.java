package com.workforce.os.modules.workforce.web;

import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/workers")
@RequiredArgsConstructor
public class PublicWorkerController {

    private final WorkerProfileRepository workerProfileRepository;

    @GetMapping("/organization/{tenantId}")
    public ResponseEntity<List<WorkerProfile>> getWorkersByOrganization(@PathVariable String tenantId) {
        return ResponseEntity.ok(workerProfileRepository.findAllByTenantId(tenantId));
    }
}
