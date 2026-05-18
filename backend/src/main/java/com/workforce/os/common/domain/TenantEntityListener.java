package com.workforce.os.common.domain;

import com.workforce.os.common.context.TenantContext;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import org.springframework.stereotype.Component;

@Component
public class TenantEntityListener {

    @PrePersist
    @PreUpdate
    public void setTenantId(Object entity) {
        if (entity instanceof BaseEntity baseEntity) {
            String currentTenant = TenantContext.getCurrentTenant();
            if (currentTenant != null && (baseEntity.getTenantId() == null || baseEntity.getTenantId().isEmpty())) {
                baseEntity.setTenantId(currentTenant);
            }
        }
    }
}
