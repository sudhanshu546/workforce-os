package com.workforce.os.modules.workforce.service;

import com.workforce.os.common.service.BaseService;
import com.workforce.os.modules.identity.domain.User;
import com.workforce.os.modules.identity.repository.RoleRepository;
import com.workforce.os.modules.identity.repository.UserRepository;
import com.workforce.os.modules.organization.repository.BranchRepository;
import com.workforce.os.modules.organization.repository.OrganizationRepository;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.domain.WorkerSkill;
import com.workforce.os.modules.workforce.dto.WorkerProfileDTO;
import com.workforce.os.modules.workforce.mapper.WorkerMapper;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import com.workforce.os.modules.workforce.repository.WorkerSkillRepository;
import com.workforce.os.modules.workforce.dto.WorkerOnboardingRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.workforce.os.common.util.MessageConstants.*;

@Service
@RequiredArgsConstructor
public class WorkforceService extends BaseService {
    private final WorkerProfileRepository workerProfileRepository;
    private final WorkerSkillRepository workerSkillRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrganizationRepository organizationRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;
    private final WorkerMapper workerMapper;
    private final com.workforce.os.modules.workforce.repository.WorkerLocationRepository workerLocationRepository;

    @Transactional
    public void updateWorkerLocation(Long workerId, Double lat, Double lon, String status) {
        WorkerProfile worker = workerProfileRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException(WORKER_NOT_FOUND));

        com.workforce.os.modules.workforce.domain.WorkerLocation location = com.workforce.os.modules.workforce.domain.WorkerLocation.builder()
                .worker(worker)
                .latitude(lat)
                .longitude(lon)
                .status(status != null ? status : "ACTIVE")
                .timestamp(java.time.LocalDateTime.now())
                .build();
        // tenantId is set by listener
        workerLocationRepository.save(location);
    }

    @Cacheable(value = "workers", key = "T(com.workforce.os.common.context.TenantContext).getCurrentTenant() + '-' + #pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<WorkerProfileDTO> getWorkers(Pageable pageable) {
        return workerProfileRepository.findByTenantId(getTenantId(), pageable)
                .map(workerMapper::toDTO);
    }

    @Transactional
    @CacheEvict(value = "workers", allEntries = true)
    public WorkerProfile onboardWorker(WorkerOnboardingRequest request) {
        // Create User
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(User.UserStatus.ACTIVE);
        // tenantId is automatically set by TenantEntityListener
        
        // Set worker role
        var workerRole = roleRepository.findByName("WORKER")
                .orElseThrow(() -> new RuntimeException(WORKER_ROLE_NOT_FOUND));
        user.setRole(workerRole);
        
        User savedUser = userRepository.save(user);

        // Find Organization
        var organization = organizationRepository.findByTenantId(getTenantId())
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
        // tenantId is automatically set by TenantEntityListener

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
    @CacheEvict(value = "workers", allEntries = true)
    public WorkerProfile updateWorker(Long id, WorkerOnboardingRequest request) {
        WorkerProfile profile = workerProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(WORKER_NOT_FOUND));
        
        if (!profile.getTenantId().equals(getTenantId())) {
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
    @CacheEvict(value = "workers", allEntries = true)
    public void deleteWorker(Long id) {
        WorkerProfile profile = workerProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(WORKER_NOT_FOUND));
        
        if (!profile.getTenantId().equals(getTenantId())) {
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
