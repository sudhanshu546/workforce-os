# Service Request Lifecycle - Test Plan

## Objective
To verify the end-to-end service request lifecycle in the Blue Collar OS application.

## Test Phases

### 1. Customer Request Phase
- **Test Case 1.1:** Customer registers/logs in and submits a new service request.
- **Test Case 1.2:** Verify request persistence (DB check if possible, or UI updates in CustomerOrdersPage).
- **Test Case 1.3:** Verify customer receives confirmation notification.

### 2. Management/Admin Verification Phase
- **Test Case 2.1:** Verify admin sees new pending request in OrderVerification page.
- **Test Case 2.2:** Verify status update logic when admin approves/verifies the request.
- **Test Case 2.3:** Verify notification dispatch to the customer upon verification.

### 3. Worker Assignment/Processing Phase
- **Test Case 3.1:** Verify admin/dispatcher assigns a worker to the verified request (WorkOrders page).
- **Test Case 3.2:** Verify worker receives notification of new assignment.
- **Test Case 3.3:** Verify worker status updates (e.g., started, in-progress, completed) in the system.

### 4. Completion & Invoicing Phase
- **Test Case 4.1:** Verify request completion triggers automated invoice generation.
- **Test Case 4.2:** Verify invoice visibility for the customer.

## Execution Strategy
- Start by tracing data flow from `ServicesPage.tsx` to `OrderVerification.tsx` and finally `WorkOrders.tsx`.
- Review state management in `redux` slices during transitions.
- Validate API integration in `services/api.ts`.
