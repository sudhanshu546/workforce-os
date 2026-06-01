package com.workforce.os.modules.inventory.repository;

import com.workforce.os.modules.inventory.domain.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findBySerialNumberAndTenantId(String serialNumber, String tenantId);
    List<InventoryItem> findByCurrentlyAssignedToWorkerIdAndTenantId(Long workerId, String tenantId);
    List<InventoryItem> findByMaterialIdAndTenantId(Long materialId, String tenantId);
}
