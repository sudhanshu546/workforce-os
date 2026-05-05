package com.workforce.os.modules.service.web;

import com.workforce.os.modules.service.domain.ServiceCategory;
import com.workforce.os.modules.service.domain.ServiceItem;
import com.workforce.os.modules.service.service.ServiceCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceCatalogService serviceCatalogService;

    @GetMapping("/categories")
    public ResponseEntity<List<ServiceCategory>> getCategories() {
        return ResponseEntity.ok(serviceCatalogService.getAllCategories());
    }

    @GetMapping("/items")
    public ResponseEntity<List<ServiceItem>> getItems(@RequestParam(required = false) Long categoryId) {
        if (categoryId != null) {
            return ResponseEntity.ok(serviceCatalogService.getItemsByCategory(categoryId));
        }
        return ResponseEntity.ok(serviceCatalogService.getAllItems());
    }

    @PostMapping("/categories")
    public ResponseEntity<ServiceCategory> createCategory(@RequestBody ServiceCategory category) {
        return ResponseEntity.ok(serviceCatalogService.createCategory(category.getName(), category.getDescription()));
    }

    @PostMapping("/items")
    public ResponseEntity<ServiceItem> createItem(@RequestParam Long categoryId, @RequestBody ServiceItem item) {
        return ResponseEntity.ok(serviceCatalogService.createServiceItem(categoryId, item.getName(), item.getDescription(), item.getBasePrice()));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ServiceCategory> updateCategory(@PathVariable Long id, @RequestBody ServiceCategory category) {
        return ResponseEntity.ok(serviceCatalogService.updateCategory(id, category.getName(), category.getDescription()));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        serviceCatalogService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<ServiceItem> updateItem(@PathVariable Long id, @RequestBody ServiceItem item) {
        return ResponseEntity.ok(serviceCatalogService.updateServiceItem(id, item.getName(), item.getDescription(), item.getBasePrice()));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        serviceCatalogService.deleteServiceItem(id);
        return ResponseEntity.noContent().build();
    }
}
