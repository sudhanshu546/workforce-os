package com.workforce.os.modules.service.repository;

import com.workforce.os.modules.service.domain.ServiceItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {
    List<ServiceItem> findAllByTenantId(String tenantId);
    Page<ServiceItem> findAllByTenantId(String tenantId, Pageable pageable);
    List<ServiceItem> findAllByCategoryIdAndTenantId(Long categoryId, String tenantId);
    Page<ServiceItem> findAllByCategoryIdAndTenantId(Long categoryId, String tenantId, Pageable pageable);
    java.util.Optional<ServiceItem> findByIdAndTenantId(Long id, String tenantId);
}
