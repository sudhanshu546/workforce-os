package com.workforce.os.modules.inventory.web;

import com.workforce.os.modules.inventory.domain.Material;
import com.workforce.os.modules.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService inventoryService;

    @GetMapping("/materials")
    public ResponseEntity<List<Material>> getAllMaterials() {
        return ResponseEntity.ok(inventoryService.getAllMaterials());
    }

    @GetMapping("/materials/low-stock")
    public ResponseEntity<List<Material>> getLowStockMaterials() {
        return ResponseEntity.ok(inventoryService.getLowStockMaterials());
    }

    @PostMapping("/materials")
    public ResponseEntity<Material> createMaterial(@RequestBody Material material) {
        return ResponseEntity.ok(inventoryService.createMaterial(material));
    }

    @PutMapping("/materials/{id}")
    public ResponseEntity<Material> updateMaterial(@PathVariable Long id, @RequestBody Material material) {
        return ResponseEntity.ok(inventoryService.updateMaterial(id, material));
    }

    @DeleteMapping("/materials/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        inventoryService.deleteMaterial(id);
        return ResponseEntity.noContent().build();
    }
}
