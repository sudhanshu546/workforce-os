package com.workforce.os.modules.service.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.service.domain.ServiceCategory;
import com.workforce.os.modules.service.domain.ServiceItem;
import com.workforce.os.modules.service.repository.ServiceCategoryRepository;
import com.workforce.os.modules.service.repository.ServiceItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceCatalogService {
    private final ServiceCategoryRepository categoryRepository;
    private final ServiceItemRepository itemRepository;

    @Transactional
    public ServiceCategory createCategory(String name, String description) {
        ServiceCategory category = new ServiceCategory();
        category.setName(name);
        category.setDescription(description);
        category.setTenantId(TenantContext.getCurrentTenant());
        return categoryRepository.save(category);
    }

    @Transactional
    public ServiceItem createServiceItem(Long categoryId, String name, String description, Double basePrice) {
        ServiceCategory category = categoryRepository.findById(categoryId).orElseThrow();
        ServiceItem item = new ServiceItem();
        item.setCategory(category);
        item.setName(name);
        item.setDescription(description);
        item.setBasePrice(basePrice);
        item.setTenantId(TenantContext.getCurrentTenant());
        return itemRepository.save(item);
    }

    public List<ServiceCategory> getAllCategories() {
        return categoryRepository.findAllByTenantId(TenantContext.getCurrentTenant());
    }

    public List<ServiceItem> getItemsByCategory(Long categoryId) {
        return itemRepository.findAllByCategoryIdAndTenantId(categoryId, TenantContext.getCurrentTenant());
    }

    public List<ServiceItem> getAllItems() {
        return itemRepository.findAllByTenantId(TenantContext.getCurrentTenant());
    }

    @Transactional
    public ServiceCategory updateCategory(Long id, String name, String description) {
        ServiceCategory category = categoryRepository.findById(id).orElseThrow();
        // Security check: ensure tenant matches
        if (!category.getTenantId().equals(TenantContext.getCurrentTenant())) {
            throw new RuntimeException("Unauthorized");
        }
        category.setName(name);
        category.setDescription(description);
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        ServiceCategory category = categoryRepository.findById(id).orElseThrow();
        if (!category.getTenantId().equals(TenantContext.getCurrentTenant())) {
            throw new RuntimeException("Unauthorized");
        }
        // Also delete all items in this category or check if it's empty
        itemRepository.deleteAll(itemRepository.findAllByCategoryIdAndTenantId(id, TenantContext.getCurrentTenant()));
        categoryRepository.delete(category);
    }

    @Transactional
    public ServiceItem updateServiceItem(Long id, String name, String description, Double basePrice) {
        ServiceItem item = itemRepository.findById(id).orElseThrow();
        if (!item.getTenantId().equals(TenantContext.getCurrentTenant())) {
            throw new RuntimeException("Unauthorized");
        }
        item.setName(name);
        item.setDescription(description);
        item.setBasePrice(basePrice);
        return itemRepository.save(item);
    }

    @Transactional
    public void deleteServiceItem(Long id) {
        ServiceItem item = itemRepository.findById(id).orElseThrow();
        if (!item.getTenantId().equals(TenantContext.getCurrentTenant())) {
            throw new RuntimeException("Unauthorized");
        }
        itemRepository.delete(item);
    }
}
