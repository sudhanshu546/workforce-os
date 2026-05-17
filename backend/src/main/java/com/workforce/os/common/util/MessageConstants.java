package com.workforce.os.common.util;

public class MessageConstants {
    // Auth & Identity
    public static final String AUTH_SUCCESS = "Authentication successful";
    public static final String LOGIN_SUCCESS = "Login successful";
    public static final String REGISTER_SUCCESS = "Organization registered successfully";
    public static final String PROFILE_RETRIEVED = "Profile retrieved successfully";
    public static final String TOKEN_REFRESHED = "Token refreshed successfully";
    public static final String INVALID_EMAIL_OR_PASSWORD = "Invalid email or password";
    public static final String ACCOUNT_INACTIVE = "Customer account is not active";
    public static final String INVALID_REFRESH_TOKEN = "Invalid refresh token";
    public static final String REFRESH_TOKEN_EXPIRED = "Refresh token was expired. Please make a new signin request";
    public static final String EMAIL_EXISTS = "Email already exists";
    public static final String PHONE_EXISTS = "Phone number already exists";
    public static final String USER_NOT_FOUND = "User or Customer not found";
    public static final String DEFAULT_ROLE_NOT_FOUND = "Default role OWNER not found";
    
    // Inventory
    public static final String MATERIALS_RETRIEVED = "Materials retrieved successfully";
    public static final String LOW_STOCK_RETRIEVED = "Low stock materials retrieved successfully";
    public static final String MATERIAL_CREATED = "Material created successfully";
    public static final String MATERIAL_UPDATED = "Material updated successfully";
    public static final String INSUFFICIENT_STOCK = "Insufficient material stock";

    // Operations
    public static final String WORK_ORDER_RETRIEVED = "Work order retrieved successfully";
    public static final String WORKER_ASSIGNED = "Worker assigned successfully";
    public static final String WORK_ORDER_STARTED = "Work order started successfully";
    public static final String SUBMITTED_FOR_VERIFICATION = "Work order submitted for verification";
    public static final String WORK_ORDER_VERIFIED = "Work order verified successfully";
    public static final String TASK_STATUS_UPDATED = "Task status updated";
    public static final String EVIDENCE_ADDED = "Evidence added successfully";
    public static final String MATERIAL_ADDED = "Material added successfully";
    public static final String WORKER_TASKS_RETRIEVED = "Worker tasks retrieved successfully";
    public static final String CLOCK_IN_REQUIRED = "You must clock in for your shift before starting a job";
    public static final String TASKS_PENDING = "Cannot submit for verification: Some tasks are still pending completion.";
    public static final String NOT_VERIFIABLE = "Work order is not in a verifiable state";
    public static final String CANNOT_MODIFY_COMPLETED = "Cannot modify completed work order";
    public static final String CANNOT_ADD_EVIDENCE_COMPLETED = "Cannot add evidence to completed work order";
    public static final String CANNOT_ADD_MATERIALS_COMPLETED = "Cannot add materials to completed work order";
    public static final String OUT_OF_RANGE = "Location verification failed: You must be within 500m of the work site.";
    public static final String EVIDENCE_REQUIRED = "Industry Standard Requirement: At least one photo upload is mandatory to finalize this job.";

    // Attendance
    public static final String ALREADY_CLOCKED_IN = "Worker is already clocked in";
    public static final String NO_ACTIVE_SESSION = "No active job session found for this work order";
    public static final String NO_ACTIVE_SHIFT = "No active shift found";

    // Finance
    public static final String PAYMENT_VERIFICATION_FAILED = "Payment verification failed";

    // General
    public static final String UNAUTHORIZED = "Unauthorized";
    public static final String INTERNAL_SERVER_ERROR = "An unexpected error occurred";
    public static final String VALIDATION_FAILED = "Validation Failed";
    public static final String INPUT_VALIDATION_ERROR = "Input validation error";
    public static final String RESOURCE_NOT_FOUND = "Resource not found";
    public static final String ORGANIZATION_NOT_FOUND = "Organization not found";
    public static final String SERVICE_NOT_FOUND = "Service not found";
    public static final String WORKER_NOT_FOUND = "Worker not found";
    public static final String WORKER_ROLE_NOT_FOUND = "Default role WORKER not found";
    public static final String WORKER_PROFILE_NOT_FOUND = "Worker profile not found";
    public static final String CUSTOMER_NOT_FOUND = "Customer not found";
    public static final String CUSTOMER_PROFILE_NOT_FOUND = "Customer profile not found";

    // Notifications
    public static final String PUSH_NEW_JOB_TITLE = "New Job Assigned!";
    public static final String PUSH_NEW_JOB_BODY = "You have been assigned to: %s for %s";
    public static final String PUSH_JOB_VERIFIED_TITLE = "Job Verified!";
    public static final String PUSH_JOB_VERIFIED_BODY = "Customer has verified your work for #WO-%d";
    public static final String PUSH_LOW_STOCK_TITLE = "Low Stock Alert!";
    public static final String PUSH_LOW_STOCK_BODY = "Material %s is running low! Current stock: %s";
    
    // UI Routes
    public static final String ROUTE_TASKS = "/tasks";
    public static final String ROUTE_INVENTORY = "/inventory";

    // WebSocket Topics & Messages
    public static final String WS_TOPIC_ORDER_PREFIX = "/topic/order/";
    public static final String WS_MSG_INVOICE_GENERATED = "INVOICE_GENERATED:";
    public static final String WS_MSG_JOB_STARTED = "Technician has started working on your order: #WO-%d";
    public static final String WS_MSG_JOB_FINISHED = "Technician has finished the work. Please review and verify completion for order: #WO-%d";

    // Audit Constants
    public static final String AUDIT_BY_SYSTEM = "SYSTEM";
    public static final String AUDIT_BY_ADMIN = "ADMIN";
    public static final String AUDIT_BY_WORKER = "WORKER";
    public static final String AUDIT_BY_CUSTOMER = "CUSTOMER";
}
