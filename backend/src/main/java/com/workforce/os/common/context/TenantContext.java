package com.workforce.os.common.context;

public class TenantContext {
    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();
    private static final ThreadLocal<Long> CURRENT_CUSTOMER = new ThreadLocal<>();

    public static String getCurrentTenant() {
        return CURRENT_TENANT.get();
    }

    public static void setCurrentTenant(String tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    public static Long getCurrentCustomer() {
        return CURRENT_CUSTOMER.get();
    }

    public static void setCurrentCustomer(Long customerId) {
        CURRENT_CUSTOMER.set(customerId);
    }

    public static void clear() {
        CURRENT_TENANT.remove();
        CURRENT_CUSTOMER.remove();
    }
}
