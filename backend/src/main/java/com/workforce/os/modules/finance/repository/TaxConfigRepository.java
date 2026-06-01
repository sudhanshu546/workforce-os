package com.workforce.os.modules.finance.repository;

import com.workforce.os.modules.finance.domain.TaxConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TaxConfigRepository extends JpaRepository<TaxConfig, Long> {
    List<TaxConfig> findByTenantIdAndActiveTrue(String tenantId);
    Optional<TaxConfig> findByTenantIdAndIsDefaultTrueAndActiveTrue(String tenantId);
    Optional<TaxConfig> findByTenantIdAndRegionAndActiveTrue(String tenantId, String region);
}
