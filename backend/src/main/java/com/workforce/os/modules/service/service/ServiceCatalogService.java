package com.workforce.os.modules.service.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.exception.BusinessException;
import com.workforce.os.common.exception.ResourceNotFoundException;
import com.workforce.os.common.util.MessageConstants;
import com.workforce.os.modules.service.domain.ServiceCategory;
import com.workforce.os.modules.service.domain.ServiceItem;
import com.workforce.os.modules.service.dto.ServiceCategoryDTO;
import com.workforce.os.modules.service.dto.ServiceItemDTO;
import com.workforce.os.modules.service.mapper.ServiceMapper;
import com.workforce.os.modules.service.repository.ServiceCategoryRepository;
import com.workforce.os.modules.service.repository.ServiceItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import static com.workforce.os.common.util.MessageConstants.UNAUTHORIZED;

@Service
@RequiredArgsConstructor
public class ServiceCatalogService {
    private final ServiceCategoryRepository categoryRepository;
    private final ServiceItemRepository itemRepository;
    private final ServiceMapper serviceMapper;

    @CacheEvict(value = {"serviceCategories", "serviceItems", "serviceItemsAll"}, allEntries = true)
    @Transactional
    public ServiceItemDTO createServiceItem(Long categoryId, String name, String description, Double basePrice) {
        ServiceCategory category = categoryRepository.findByIdAndTenantId(categoryId, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND));
        ServiceItem item = new ServiceItem();
        item.setCategory(category);
        item.setName(name);
        item.setDescription(description);
        item.setBasePrice(basePrice);
        item.setTenantId(TenantContext.getCurrentTenant());
        return serviceMapper.toItemDTO(itemRepository.save(item));
    }

    @Cacheable(value = "serviceCategories", key = "#root.target.getCurrentTenant()")
    @Transactional(readOnly = true)
    public List<ServiceCategoryDTO> getAllCategories() {
        return categoryRepository.findAllByTenantId(TenantContext.getCurrentTenant())
                .stream()
                .map(serviceMapper::toCategoryDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "serviceItems", key = "#categoryId")
    @Transactional(readOnly = true)
    public List<ServiceItemDTO> getItemsByCategory(Long categoryId) {
        return itemRepository.findAllByCategoryIdAndTenantId(categoryId, TenantContext.getCurrentTenant())
                .stream()
                .map(serviceMapper::toItemDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ServiceItemDTO> getItemsByCategory(Long categoryId, Pageable pageable) {
        return itemRepository.findAllByCategoryIdAndTenantId(categoryId, TenantContext.getCurrentTenant(), pageable)
                .map(serviceMapper::toItemDTO);
    }

    @Cacheable(value = "serviceItemsAll", key = "#root.target.getCurrentTenant()")
    @Transactional(readOnly = true)
    public List<ServiceItemDTO> getAllItems() {
        return itemRepository.findAllByTenantId(TenantContext.getCurrentTenant())
                .stream()
                .map(serviceMapper::toItemDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ServiceItemDTO> getAllItems(Pageable pageable) {
        return itemRepository.findAllByTenantId(TenantContext.getCurrentTenant(), pageable)
                .map(serviceMapper::toItemDTO);
    }

    @Transactional(readOnly = true)
    public List<ServiceItemDTO> getAllItemsByTenant(String tenantId) {
        return itemRepository.findAllByTenantId(tenantId)
                .stream()
                .map(serviceMapper::toItemDTO)
                .collect(Collectors.toList());
    }

    public String getCurrentTenant() {
        return TenantContext.getCurrentTenant();
    }

    @CacheEvict(value = {"serviceCategories", "serviceItems", "serviceItemsAll"}, allEntries = true)
    @Transactional
    public ServiceCategoryDTO createCategory(String name, String description) {
        ServiceCategory category = new ServiceCategory();
        category.setName(name);
        category.setDescription(description);
        category.setTenantId(TenantContext.getCurrentTenant());
        return serviceMapper.toCategoryDTO(categoryRepository.save(category));
    }

    @CacheEvict(value = {"serviceCategories", "serviceItems", "serviceItemsAll"}, allEntries = true)
    @Transactional
    public ServiceCategoryDTO updateCategory(Long id, String name, String description) {
        ServiceCategory category = categoryRepository.findByIdAndTenantId(id, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND));
        category.setName(name);
        category.setDescription(description);
        return serviceMapper.toCategoryDTO(categoryRepository.save(category));
    }

    @CacheEvict(value = {"serviceCategories", "serviceItems", "serviceItemsAll"}, allEntries = true)
    @Transactional
    public void deleteCategory(Long id) {
        ServiceCategory category = categoryRepository.findByIdAndTenantId(id, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND));
        itemRepository.deleteAll(itemRepository.findAllByCategoryIdAndTenantId(id, TenantContext.getCurrentTenant()));
        categoryRepository.delete(category);
    }

    @CacheEvict(value = {"serviceItems", "serviceItemsAll"}, allEntries = true)
    @Transactional
    public ServiceItemDTO updateServiceItem(Long id, String name, String description, Double basePrice) {
        ServiceItem item = itemRepository.findByIdAndTenantId(id, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND));
        item.setName(name);
        item.setDescription(description);
        item.setBasePrice(basePrice);
        return serviceMapper.toItemDTO(itemRepository.save(item));
    }

    @CacheEvict(value = {"serviceItems", "serviceItemsAll"}, allEntries = true)
    @Transactional
    public void deleteServiceItem(Long id) {
        ServiceItem item = itemRepository.findByIdAndTenantId(id, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND));
        itemRepository.delete(item);
    }
}
