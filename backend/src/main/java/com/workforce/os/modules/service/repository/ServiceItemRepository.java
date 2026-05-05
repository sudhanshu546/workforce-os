package com.workforce.os.modules.service.repository;

import com.workforce.os.modules.service.domain.ServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {
    List<ServiceItem> findAllByTenantId(String tenantId);
    List<ServiceItem> findAllByCategoryIdAndTenantId(Long categoryId, String tenantId);
}
