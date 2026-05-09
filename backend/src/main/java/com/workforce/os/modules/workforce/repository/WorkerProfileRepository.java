package com.workforce.os.modules.workforce.repository;

import com.workforce.os.modules.workforce.domain.WorkerProfile;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, Long> {
    List<WorkerProfile> findBySupportedServices_Id(Long serviceId);
    List<WorkerProfile> findAllByTenantId(String tenantId);

    @Nullable Page<WorkerProfile> findByTenantId(String currentTenant, Pageable pageable);

    Optional<WorkerProfile> findByUserEmail(String email);

    long countByTenantId(String tenantId);
}
