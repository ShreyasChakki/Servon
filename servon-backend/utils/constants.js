// Service Categories
const SERVICE_CATEGORIES = [
    'plumbing',
    'electrical',
    'carpentry',
    'painting',
    'cleaning',
    'pest-control',
    'appliance-repair',
    'home-renovation',
    'gardening',
    'moving-packing',
    'ac-repair',
    'interior-design',
    'security',
    'other'
];

// Urgency Levels
const URGENCY_LEVELS = ['low', 'medium', 'high', 'urgent'];

// User Roles
const USER_ROLES = ['customer', 'vendor', 'admin'];

// Request Status
const REQUEST_STATUS = ['open', 'in_progress', 'closed'];

// Quotation Status
const QUOTATION_STATUS = ['sent', 'accepted', 'rejected'];

// Quotation Fee
const QUOTATION_FEE = 1; // ₹1

// Transaction Types
const TRANSACTION_TYPES = ['credit', 'debit'];

// Connection Status
const CONNECTION_STATUS = ['pending', 'connected', 'rejected'];

// Ad Status
const AD_STATUS = ['active', 'paused', 'completed', 'expired'];

module.exports = {
    SERVICE_CATEGORIES,
    URGENCY_LEVELS,
    USER_ROLES,
    REQUEST_STATUS,
    QUOTATION_STATUS,
    QUOTATION_FEE,
    TRANSACTION_TYPES,
    CONNECTION_STATUS,
    AD_STATUS
};
