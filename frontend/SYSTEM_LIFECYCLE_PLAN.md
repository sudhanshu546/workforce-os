# Comprehensive Lifecycle & Model-Driven Test Plan

## 1. Data Model Overview
This section outlines the core entities and their relationships.

- **Organization (Tenant):** The central entity.
    - Fields: `id`, `name`, `licenseKey`, `createdAt`.
- **Customer:** Linked to an Organization.
    - Fields: `id`, `name`, `email`, `phone`, `organizationId` (FK).
- **Worker:** Linked to an Organization.
    - Fields: `id`, `name`, `email`, `phone`, `role`, `organizationId` (FK).
- **Service/Catalog:** Defined by the Organization.
    - Fields: `id`, `name`, `basePrice`, `organizationId` (FK).
- **Service Request/Work Order:** The core transaction.
    - Fields: `id`, `customerId` (FK), `serviceId` (FK), `workerId` (FK - nullable), `status`, `scheduledDate`.

---

## 2. Onboarding Lifecycle Test Phases

### Phase A: Organization (Tenant) Setup
- **Test Case A.1:** Register a new Organization.
- **Test Case A.2:** Verify system initializes default settings (e.g., categories, roles).

### Phase B: Worker Onboarding
- **Test Case B.1:** Admin adds a new worker to the organization.
- **Test Case B.2:** Verify worker login credentials and role-based access control (RBAC).

### Phase C: Customer Acquisition
- **Test Case C.1:** Customer registers within a specific organization.
- **Test Case C.2:** Verify customer data is correctly linked to the parent organization in the DB.

---

## 3. Operational Lifecycle Test Phases

### Phase D: Service Request Lifecycle
- **Step D.1 (Creation):** Customer selects a service, sets a time, and submits.
    - *Validation Check:* Does `ServiceId` and `CustomerId` exist?
- **Step D.2 (Verification):** Manager reviews request.
    - *Validation Check:* Is status `AWAITING_VERIFICATION`?
- **Step D.3 (Assignment):** Manager assigns to a specific worker.
    - *Validation Check:* Is worker in the same organization?
- **Step D.4 (Execution/Completion):** Worker updates status to `IN_PROGRESS` -> `COMPLETED`.
    - *Validation Check:* Does completion trigger auto-invoice?

---

## 4. Validation & Data Integrity Rules
- **Referential Integrity:** Ensure `organizationId` is strictly enforced for all entities.
- **Role Constraints:** Workers cannot perform operations reserved for Admins.
- **Status Machine:** Ensure orders cannot jump from `PENDING` directly to `COMPLETED` without verification.
