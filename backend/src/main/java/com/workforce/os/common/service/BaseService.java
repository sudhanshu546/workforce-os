package com.workforce.os.common.service;

import com.workforce.os.common.context.TenantContext;

public abstract class BaseService {
    
    protected String getTenantId() {
        return TenantContext.getCurrentTenant();
    }
}
