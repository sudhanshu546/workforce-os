# Workforce OS

Workforce OS is a professional, end-to-end operational management platform built to handle the entire lifecycle of service-based businesses. From initial lead capture and catalog-driven quoting to automated billing and mobile-first field execution, this platform provides a unified command center for organizational intelligence.

## 🚀 Core Modules

### 1. Service Catalog Management
- **Category Hierarchy**: Professional management of service categories (Plumbing, Electrical, etc.).
- **Item Catalog**: CRUD interface for specific service items with predefined descriptions and base pricing.

### 2. Workforce & Team
- **Team Onboarding**: Modern workflow for adding new team members.
- **Skill Endorsement**: Skill-based proficiency management for better task dispatching.
- **Attendance & Tracking**: Real-time status tracking for workers in the field (Clock-in/out).

### 3. Sales Pipeline (Sales & Ops)
- **Opportunity Management**: Capture, track, and prioritize customer leads.
- **Smart Quotation Builder**: Catalog-integrated quoting tool with dynamic tax and discount calculations.
- **Approval Workflow**: Convert approved quotations into actionable work orders.

### 4. Fulfillment (Work Orders & Tasks)
- **Executive Dispatch**: Professional dashboard to monitor order statuses and assign workers.
- **Mobile-First Job Execution**: Dedicated field interface featuring:
  - **Task Checklists**: Step-by-step protocols for field staff.
  - **Evidence Capture**: Site photo upload and note-taking functionality.
  - **Status Synchronization**: Real-time job status updates (Assigned -> In Progress -> Completed).

### 5. Financial Ledger
- **Automated Invoicing**: System-generated invoices upon job completion.
- **Payment Tracking**: Record and verify client payments with transaction referencing.
- **Financial Intelligence**: Real-time dashboards showing total revenue and outstanding receivables.

## 🏗️ Technical Stack

- **Backend**: Java (Spring Boot) with Tenant-Isolated Data Architecture.
- **Frontend**: React (TypeScript, Vite) with Premium Design System (CSS Variables).
- **Database**: PostgreSQL (Relational Data Integrity).
- **Security**: JWT-based authentication with Role-Based Access Control (RBAC).

## 📂 Repository Structure

```text
/workforce-os
├── /backend     - Spring Boot API & Service modules
├── /frontend    - React/Vite web interface & Dashboard
└── .github      - CI/CD workflows
```

## 🛠️ Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workforce-os
   ```

2. **Database Setup**
   Configure your PostgreSQL instance and update `application.properties` in `backend/src/main/resources`.

3. **Start Backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

4. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📑 Status
- [x] Service Catalog Management (Standardized)
- [x] Workforce & Attendance Tracking (Standardized)
- [x] Sales Pipeline (Leads & Quotes - Standardized)
- [x] Fulfillment Dashboard (Standardized)
- [x] Financial Ledger & Invoicing (Standardized)
- [x] Advanced Reporting & Analytics (Standardized)
- [ ] Mobile App Native Wrapper

## 🛡️ Robustness & Industry Standards
This project has been upgraded to meet professional software engineering standards:
- **Zero-Exposure APIs**: Internal JPA Entities are never exposed. All data transfer is handled via DTOs and MapStruct.
- **Method-Level Security**: Every API endpoint is protected by `@PreAuthorize` based on specific user roles (OWNER, MANAGER, WORKER, CUSTOMER).
- **Unified Response Wrapper**: All API responses follow the `ApiResponse<T>` structure for predictable frontend integration.
- **Input Validation**: Strict Jakarta Validation at the boundary ensures data integrity.
- **Tenant Isolation**: Thread-safe multi-tenancy context ensures data privacy between organizations.
