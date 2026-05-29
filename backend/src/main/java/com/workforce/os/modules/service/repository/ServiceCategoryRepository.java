package com.workforce.os.modules.service.repository;

import com.workforce.os.modules.service.domain.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {
    List<ServiceCategory> findAllByTenantId(String tenantId);
    java.util.Optional<ServiceCategory> findByIdAndTenantId(Long id, String tenantId);
}
