// Storage Keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    ROLE: 'role',
    WORKER_ID: 'worker_id',
    CUSTOMER_ID: 'customerId',
    USER_PROFILE: 'userProfile'
};

// Roles
export const ROLES = {
    OWNER: 'OWNER',
    MANAGER: 'MANAGER',
    WORKER: 'WORKER',
    CUSTOMER: 'CUSTOMER'
};

// Notification Messages (matching backend if shared, but usually separate for UI)
export const NOTIFICATION_MESSAGES = {
    PERMISSION_GRANTED: 'Push notifications enabled successfully.',
    PERMISSION_DENIED: 'Push notifications were blocked. Please enable them in settings.',
    OFFLINE: 'You are currently offline. Data will sync automatically once restored.',
    ONLINE: 'Back online! Syncing data...'
};

// Error Keys/Messages
export const ERROR_MESSAGES = {
    GENERIC: 'A technical error occurred. Please try again.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    UNAUTHORIZED: 'You do not have permission to perform this action.',
    LOCATION_REQUIRED: 'Location access is required for this operation.'
};

// Expense Categories
export const EXPENSE_CATEGORIES = [
    { label: 'Fuel & Transport', value: 'FUEL' },
    { label: 'Extra Materials', value: 'MATERIALS' },
    { label: 'Parking & Tolls', value: 'PARKING' },
    { label: 'Other', value: 'OTHER' }
];

// Expense Statuses
export const EXPENSE_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    REIMBURSED: 'REIMBURSED'
};
