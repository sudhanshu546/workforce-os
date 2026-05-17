package com.workforce.os.modules.workforce.service;

import com.workforce.os.modules.identity.domain.User;
import com.workforce.os.modules.identity.repository.RoleRepository;
import com.workforce.os.modules.identity.repository.UserRepository;
import com.workforce.os.modules.organization.repository.BranchRepository;
import com.workforce.os.modules.organization.repository.OrganizationRepository;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.domain.WorkerSkill;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import com.workforce.os.modules.workforce.repository.WorkerSkillRepository;
import com.workforce.os.modules.workforce.dto.WorkerOnboardingRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.workforce.os.common.util.MessageConstants.*;

@Service
@RequiredArgsConstructor
public class WorkforceService {
    private final WorkerProfileRepository workerProfileRepository;
    private final WorkerSkillRepository workerSkillRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrganizationRepository organizationRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public WorkerProfile onboardWorker(WorkerOnboardingRequest request, String tenantId) {
        // Create User
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(User.UserStatus.ACTIVE);
        user.setTenantId(tenantId);
        
        // Set worker role
        var workerRole = roleRepository.findByName("WORKER")
                .orElseThrow(() -> new RuntimeException(WORKER_ROLE_NOT_FOUND));
        user.setRole(workerRole);
        
        User savedUser = userRepository.save(user);

        // Find Organization by tenantId
        var organization = organizationRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new RuntimeException(ORGANIZATION_NOT_FOUND));

        // Create Worker Profile
        WorkerProfile profile = new WorkerProfile();
        profile.setUser(savedUser);
        profile.setOrganization(organization);
        if (request.getBranchId() != null) {
            profile.setBranch(branchRepository.findById(request.getBranchId()).orElse(null));
        }
        profile.setDesignation(request.getDesignation());
        profile.setJoiningDate(request.getJoiningDate());
        profile.setSalaryType(request.getSalaryType());
        profile.setSalaryAmount(request.getSalaryAmount());
        profile.setStatus(WorkerProfile.WorkerStatus.ACTIVE);
        profile.setTenantId(tenantId);

        return workerProfileRepository.save(profile);
    }

    @Transactional
    public WorkerSkill addSkill(Long workerId, String skillName, String proficiencyLevel) {
        WorkerProfile worker = workerProfileRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException(WORKER_NOT_FOUND));
        
        WorkerSkill skill = new WorkerSkill();
        skill.setWorker(worker);
        skill.setSkillName(skillName);
        skill.setProficiencyLevel(proficiencyLevel);
        
        return workerSkillRepository.save(skill);
    }

    @Transactional
    public WorkerProfile updateWorker(Long id, WorkerOnboardingRequest request, String tenantId) {
        WorkerProfile profile = workerProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(WORKER_NOT_FOUND));
        
        if (!profile.getTenantId().equals(tenantId)) {
            throw new RuntimeException(UNAUTHORIZED);
        }

        User user = profile.getUser();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        profile.setDesignation(request.getDesignation());
        profile.setSalaryAmount(request.getSalaryAmount());
        if (request.getStatus() != null) {
            profile.setStatus(WorkerProfile.WorkerStatus.valueOf(request.getStatus()));
        }
        
        return workerProfileRepository.save(profile);
    }

    @Transactional
    public void deleteWorker(Long id, String tenantId) {
        WorkerProfile profile = workerProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(WORKER_NOT_FOUND));
        
        if (!profile.getTenantId().equals(tenantId)) {
            throw new RuntimeException(UNAUTHORIZED);
        }

        // Skill deletion is handled by JPA if cascade is set, or manually
        workerSkillRepository.deleteAll(workerSkillRepository.findAllByWorker(profile));
        
        User user = profile.getUser();
        workerProfileRepository.delete(profile);
        userRepository.delete(user);
    }

    public List<WorkerSkill> getWorkerSkills(Long workerId) {
        WorkerProfile worker = workerProfileRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException(WORKER_NOT_FOUND));
        return workerSkillRepository.findAllByWorker(worker);
    }

    @Transactional
    public void removeSkill(Long skillId) {
        workerSkillRepository.deleteById(skillId);
    }

    public WorkerProfile getWorkerProfileByEmail(String email) {
        return workerProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException(WORKER_PROFILE_NOT_FOUND));
    }
}
