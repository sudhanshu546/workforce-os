package com.workforce.os.modules.workforce.repository;

import com.workforce.os.modules.workforce.domain.WorkerProfile;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, Long> {
    List<WorkerProfile> findBySupportedServices_Id(Long serviceId);
    @EntityGraph(attributePaths = {"skills", "user"})
    List<WorkerProfile> findAllByTenantId(String tenantId);

    @EntityGraph(attributePaths = {"skills", "user"})
    @Nullable Page<WorkerProfile> findByTenantId(String currentTenant, Pageable pageable);

    @EntityGraph(attributePaths = {"skills", "user"})
    Optional<WorkerProfile> findByUserEmail(String email);

    @EntityGraph(attributePaths = {"skills", "user"})
    Optional<WorkerProfile> findByIdAndTenantId(Long id, String tenantId);

    long countByTenantId(String tenantId);
}
