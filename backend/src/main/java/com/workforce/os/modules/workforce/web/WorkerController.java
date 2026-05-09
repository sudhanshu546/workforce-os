package com.workforce.os.modules.workforce.web;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.domain.WorkerSkill;
import com.workforce.os.modules.workforce.service.WorkforceService;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workers")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkforceService workforceService;
    private final WorkerProfileRepository workerProfileRepository;

    @GetMapping
    public ResponseEntity<Page<WorkerProfile>> getWorkers(org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(workerProfileRepository.findByTenantId(TenantContext.getCurrentTenant(), pageable));
    }

    @GetMapping("/all")
    public ResponseEntity<List<WorkerProfile>> getAllWorkers() {
        return ResponseEntity.ok(workerProfileRepository.findAllByTenantId(TenantContext.getCurrentTenant()));
    }

    @PostMapping("/onboard")
    public ResponseEntity<WorkerProfile> onboardWorker(@RequestBody WorkerOnboardingRequest request) {
        return ResponseEntity.ok(workforceService.onboardWorker(request, TenantContext.getCurrentTenant()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkerProfile> updateWorker(@PathVariable Long id, @RequestBody WorkerOnboardingRequest request) {
        return ResponseEntity.ok(workforceService.updateWorker(id, request, TenantContext.getCurrentTenant()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorker(@PathVariable Long id) {
        workforceService.deleteWorker(id, TenantContext.getCurrentTenant());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/skills")
    public ResponseEntity<List<WorkerSkill>> getWorkerSkills(@PathVariable Long id) {
        return ResponseEntity.ok(workforceService.getWorkerSkills(id));
    }

    @PostMapping("/{id}/skills")
    public ResponseEntity<WorkerSkill> addSkill(@PathVariable Long id, @RequestBody AddSkillRequest request) {
        return ResponseEntity.ok(workforceService.addSkill(id, request.getSkillName(), request.getProficiencyLevel()));
    }

    @DeleteMapping("/skills/{skillId}")
    public ResponseEntity<Void> removeSkill(@PathVariable Long skillId) {
        workforceService.removeSkill(skillId);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class AddSkillRequest {
        private String skillName;
        private String proficiencyLevel;
    }
}
