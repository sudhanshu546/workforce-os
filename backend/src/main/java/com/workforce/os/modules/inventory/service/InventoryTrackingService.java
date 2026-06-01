package com.workforce.os.modules.inventory.service;

import com.workforce.os.common.annotation.AuditLog;
import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.exception.BusinessException;
import com.workforce.os.common.exception.ResourceNotFoundException;
import com.workforce.os.modules.inventory.domain.InventoryItem;
import com.workforce.os.modules.inventory.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InventoryTrackingService {

    private final InventoryItemRepository inventoryItemRepository;

    @Transactional
    @AuditLog("QR Scan: Assigning item to worker")
    public InventoryItem assignToWorker(String serialNumber, Long workerId) {
        InventoryItem item = inventoryItemRepository.findBySerialNumberAndTenantId(serialNumber, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (item.getStatus() != InventoryItem.ItemStatus.IN_STOCK) {
            throw new BusinessException("Item is not available in stock");
        }

        item.setStatus(InventoryItem.ItemStatus.ASSIGNED_TO_WORKER);
        item.setCurrentlyAssignedToWorkerId(workerId);
        item.setLastScannedAt(LocalDateTime.now());
        
        return inventoryItemRepository.save(item);
    }

    @Transactional
    @AuditLog("QR Scan: Item consumed on site")
    public void consumeOnSite(String serialNumber, Long workOrderId) {
        InventoryItem item = inventoryItemRepository.findBySerialNumberAndTenantId(serialNumber, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        item.setStatus(InventoryItem.ItemStatus.CONSUMED);
        item.setAssignedToWorkOrderId(workOrderId);
        item.setLastScannedAt(LocalDateTime.now());
        
        inventoryItemRepository.save(item);
    }
}
