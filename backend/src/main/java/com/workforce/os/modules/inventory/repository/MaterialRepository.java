package com.workforce.os.modules.inventory.repository;

import com.workforce.os.modules.inventory.domain.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    java.util.List<Material> findAllByTenantId(String tenantId);
}
