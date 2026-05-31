package com.workforce.os.common.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.exception.ResourceNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.util.Optional;
import java.util.function.BiFunction;

public abstract class BaseService {
    
    protected String getTenantId() {
        return TenantContext.getCurrentTenant();
    }

    protected Long getCustomerId() {
        return TenantContext.getCurrentCustomer();
    }

    protected boolean isCustomer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
    }

    /**
     * Unified secure lookup helper.
     * Automatically chooses between Tenant-scoping or Customer-ownership based on the active session.
     */
    protected <T> T getSecurely(Long id, 
                                BiFunction<Long, String, Optional<T>> tenantFinder, 
                                BiFunction<Long, Long, Optional<T>> customerFinder) {
        
        if (isCustomer()) {
            return customerFinder.apply(id, getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found or access denied"));
        }
        
        return tenantFinder.apply(id, getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found in your organization"));
    }
}
