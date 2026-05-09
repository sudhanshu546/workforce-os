package com.workforce.os.modules.inventory.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.inventory.domain.Material;
import com.workforce.os.modules.inventory.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final MaterialRepository materialRepository;

    public List<Material> getAllMaterials() {
        return materialRepository.findAllByTenantId(TenantContext.getCurrentTenant());
    }

    @Transactional
    public Material createMaterial(Material material) {
        material.setTenantId(TenantContext.getCurrentTenant());
        return materialRepository.save(material);
    }

    @Transactional
    public Material updateMaterial(Long id, Material details) {
        Material material = materialRepository.findById(id).orElseThrow();
        if (!material.getTenantId().equals(TenantContext.getCurrentTenant())) {
            throw new RuntimeException("Unauthorized");
        }
        material.setName(details.getName());
        material.setSku(details.getSku());
        material.setQuantity(details.getQuantity());
        material.setMinThreshold(details.getMinThreshold());
        material.setUnit(details.getUnit());
        material.setPrice(details.getPrice());
        return materialRepository.save(material);
    }

    public List<Material> getLowStockMaterials() {
        return getAllMaterials().stream()
                .filter(m -> m.getQuantity() <= m.getMinThreshold())
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void deleteMaterial(Long id) {
        Material material = materialRepository.findById(id).orElseThrow();
        if (!material.getTenantId().equals(TenantContext.getCurrentTenant())) {
            throw new RuntimeException("Unauthorized");
        }
        materialRepository.delete(material);
    }
}
