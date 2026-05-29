package com.workforce.os.modules.inventory.web;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.inventory.domain.Material;
import com.workforce.os.modules.inventory.dto.MaterialDTO;
import com.workforce.os.modules.inventory.mapper.MaterialMapper;
import com.workforce.os.modules.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import static com.workforce.os.common.util.MessageConstants.*;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class InventoryController {
    private final InventoryService inventoryService;
    private final MaterialMapper materialMapper;

    @GetMapping("/materials")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<Page<MaterialDTO>>> getAllMaterials(Pageable pageable) {
        log.info("Fetching inventory materials for tenant: {}, page: {}", TenantContext.getCurrentTenant(), pageable.getPageNumber());
        Page<Material> materials = inventoryService.getAllMaterials(pageable);
        Page<MaterialDTO> dtos = materials.map(materialMapper::toDTO);
        return ResponseEntity.ok(ApiResponse.success(dtos, MATERIALS_RETRIEVED));
    }

    @GetMapping("/materials/low-stock")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<MaterialDTO>>> getLowStockMaterials() {
        log.info("Fetching low stock alerts for tenant: {}", TenantContext.getCurrentTenant());
        List<Material> materials = inventoryService.getLowStockMaterials();
        List<MaterialDTO> dtos = materials.stream().map(materialMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, LOW_STOCK_RETRIEVED));
    }

    @PostMapping("/materials")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<MaterialDTO>> createMaterial(@Valid @RequestBody MaterialDTO materialDTO) {
        log.info("Creating new material: {} for tenant: {}", materialDTO.getName(), TenantContext.getCurrentTenant());
        Material material = materialMapper.toEntity(materialDTO);
        return ResponseEntity.ok(ApiResponse.success(materialMapper.toDTO(inventoryService.createMaterial(material)), MATERIAL_CREATED));
    }

    @PutMapping("/materials/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<MaterialDTO>> updateMaterial(@PathVariable Long id, @Valid @RequestBody MaterialDTO materialDTO) {
        log.info("Updating material ID: {} for tenant: {}", id, TenantContext.getCurrentTenant());
        Material material = materialMapper.toEntity(materialDTO);
        return ResponseEntity.ok(ApiResponse.success(materialMapper.toDTO(inventoryService.updateMaterial(id, material)), MATERIAL_UPDATED));
    }

    @DeleteMapping("/materials/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteMaterial(@PathVariable Long id) {
        log.info("Deleting material ID: {} from tenant: {}", id, TenantContext.getCurrentTenant());
        inventoryService.deleteMaterial(id);
        return ResponseEntity.ok(ApiResponse.success(null, MATERIAL_DELETED));
    }
}
