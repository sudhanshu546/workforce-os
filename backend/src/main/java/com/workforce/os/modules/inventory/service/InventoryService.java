package com.workforce.os.modules.inventory.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.inventory.domain.Material;
import com.workforce.os.modules.inventory.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.workforce.os.common.util.MessageConstants.UNAUTHORIZED;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final MaterialRepository materialRepository;

    public List<Material> getAllMaterials() {
        return materialRepository.findAllByTenantId(TenantContext.getCurrentTenant());
    }

    public Page<Material> getAllMaterials(Pageable pageable) {
        return materialRepository.findAllByTenantId(TenantContext.getCurrentTenant(), pageable);
    }

    @Transactional
    public Material createMaterial(Material material) {
        material.setTenantId(TenantContext.getCurrentTenant());
        if (material.getSku() == null || material.getSku().isEmpty()) {
            material.setSku("MAT-" + System.currentTimeMillis());
        }
        if (material.getMinThreshold() == null) {
            material.setMinThreshold(0.0);
        }
        if (material.getPrice() == null) {
            material.setPrice(0.0);
        }
        return materialRepository.save(material);
    }

    @Transactional
    public Material updateMaterial(Long id, Material details) {
        Material material = materialRepository.findByIdAndTenantId(id, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new RuntimeException("Material not found or access denied"));
        
        material.setName(details.getName());
        material.setDescription(details.getDescription());
        material.setSku(details.getSku() != null ? details.getSku() : material.getSku());
        material.setQuantity(details.getQuantity());
        material.setMinThreshold(details.getMinThreshold() != null ? details.getMinThreshold() : 0.0);
        material.setUnit(details.getUnit());
        material.setPrice(details.getPrice() != null ? details.getPrice() : 0.0);
        return materialRepository.save(material);
    }

    public List<Material> getLowStockMaterials() {
        return getAllMaterials().stream()
                .filter(m -> m.getQuantity() <= m.getMinThreshold())
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void deleteMaterial(Long id) {
        Material material = materialRepository.findByIdAndTenantId(id, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new RuntimeException("Material not found or access denied"));
        materialRepository.delete(material);
    }
}
