package com.workforce.os.modules.inventory.repository;

import com.workforce.os.modules.inventory.domain.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    java.util.List<Material> findAllByTenantId(String tenantId);
    Page<Material> findAllByTenantId(String tenantId, Pageable pageable);
    java.util.Optional<Material> findByIdAndTenantId(Long id, String tenantId);
}
