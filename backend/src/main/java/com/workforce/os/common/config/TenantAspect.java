package com.workforce.os.common.config;

import com.workforce.os.common.context.TenantContext;
import jakarta.persistence.EntityManager;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class TenantAspect {

    @Autowired
    private EntityManager entityManager;

    @Before("execution(* com.workforce.os.modules..repository..*(..))")
    public void beforeRepositoryMethod() {
        Session session = entityManager.unwrap(Session.class);

        // 1. Handle Multi-Tenancy (Staff Context)
        String tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null) {
            session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
        }

        // 2. Handle Customer Ownership (Marketplace Context)
        Long customerId = TenantContext.getCurrentCustomer();
        if (customerId != null) {
            // Note: This filter must be defined on relevant entities
            session.enableFilter("customerFilter").setParameter("customerId", customerId);
        }
    }
}
