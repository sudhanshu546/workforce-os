package com.workforce.os.modules.workforce.web;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.domain.WorkerSkill;
import com.workforce.os.modules.workforce.service.WorkforceService;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import com.workforce.os.modules.workforce.dto.WorkerProfileDTO;
import com.workforce.os.modules.workforce.dto.WorkerSkillDTO;
import com.workforce.os.modules.workforce.dto.WorkerOnboardingRequest;
import com.workforce.os.modules.workforce.mapper.WorkerMapper;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/workers")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkforceService workforceService;
    private final WorkerProfileRepository workerProfileRepository;
    private final WorkerMapper workerMapper;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<WorkerProfileDTO>>> getWorkers(org.springframework.data.domain.Pageable pageable) {
        Page<WorkerProfileDTO> workers = workforceService.getWorkers(pageable);
        return ResponseEntity.ok(ApiResponse.success(workers, "Workers retrieved successfully"));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<WorkerProfileDTO>>> getAllWorkers() {
        List<WorkerProfile> workers = workerProfileRepository.findAllByTenantId(TenantContext.getCurrentTenant());
        List<WorkerProfileDTO> dtos = workers.stream().map(workerMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "All workers retrieved successfully"));
    }

    @PostMapping("/onboard")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<WorkerProfileDTO>> onboardWorker(@Valid @RequestBody WorkerOnboardingRequest request) {
        WorkerProfile profile = workforceService.onboardWorker(request);
        return ResponseEntity.ok(ApiResponse.success(workerMapper.toDTO(profile), "Worker onboarded successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<WorkerProfileDTO>> updateWorker(@PathVariable Long id, @Valid @RequestBody WorkerOnboardingRequest request) {
        WorkerProfile profile = workforceService.updateWorker(id, request);
        return ResponseEntity.ok(ApiResponse.success(workerMapper.toDTO(profile), "Worker updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteWorker(@PathVariable Long id) {
        workforceService.deleteWorker(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Worker deleted successfully"));
    }

    @GetMapping("/{id}/skills")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<List<WorkerSkillDTO>>> getWorkerSkills(@PathVariable Long id) {
        List<WorkerSkill> skills = workforceService.getWorkerSkills(id);
        List<WorkerSkillDTO> dtos = skills.stream().map(workerMapper::toSkillDTO).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "Worker skills retrieved successfully"));
    }

    @PostMapping("/{id}/skills")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<WorkerSkillDTO>> addSkill(@PathVariable Long id, @Valid @RequestBody AddSkillRequest request) {
        WorkerSkill skill = workforceService.addSkill(id, request.getSkillName(), request.getProficiencyLevel());
        return ResponseEntity.ok(ApiResponse.success(workerMapper.toSkillDTO(skill), "Skill added successfully"));
    }

    @DeleteMapping("/skills/{skillId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> removeSkill(@PathVariable Long skillId) {
        workforceService.removeSkill(skillId);
        return ResponseEntity.ok(ApiResponse.success(null, "Skill removed successfully"));
    }

    @PostMapping("/{id}/location")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<Void>> updateLocation(@PathVariable Long id, @RequestBody com.workforce.os.modules.workforce.dto.LocationUpdateDTO request) {
        workforceService.updateWorkerLocation(id, request.getLatitude(), request.getLongitude(), request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(null, "Location updated successfully"));
    }

    @Data
    public static class AddSkillRequest {
        private String skillName;
        private String proficiencyLevel;
    }
}
