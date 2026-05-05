package com.workforce.os.modules.workforce.repository;

import com.workforce.os.modules.workforce.domain.WorkerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, Long> {
    List<WorkerProfile> findAllByTenantId(String tenantId);
    Page<WorkerProfile> findByTenantId(String tenantId, Pageable pageable);
    Optional<WorkerProfile> findByUserEmail(String email);
}
