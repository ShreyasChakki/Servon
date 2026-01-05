import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getReceivedAdRequests, acceptAdRequest, declineAdRequest } from '../../services/adRequestService';
import {
    ArrowLeft,
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Megaphone,
    User,
    Phone,
    Mail,
    Filter
} from 'lucide-react';

const ReceivedInquiries = () => {
    const { user } = useAuth();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    // Helper function to generate conversation URL for accepted inquiries
    const getConversationUrl = (inquiry) => {
        const vendorId = user?._id;
        const customerId = inquiry.customerId?._id || inquiry.customerId;
        const adRequestId = inquiry._id;

        // Sort IDs alphabetically and join
        const sortedIds = [String(vendorId), String(customerId)].sort().join('_');
        return `/chat/${sortedIds}_ad_${adRequestId}`;
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const response = await getReceivedAdRequests();
            if (response.success) {
                setInquiries(response.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load inquiries');
            console.error('Failed to fetch inquiries:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (inquiryId) => {
        setActionLoading(inquiryId);
        try {
            const response = await acceptAdRequest(inquiryId);
            if (response.success) {
                setInquiries(prev => prev.map(i =>
                    i._id === inquiryId ? { ...i, status: 'accepted' } : i
                ));
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to accept inquiry');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDecline = async (inquiryId) => {
        setActionLoading(inquiryId);
        try {
            const response = await declineAdRequest(inquiryId);
            if (response.success) {
                setInquiries(prev => prev.map(i =>
                    i._id === inquiryId ? { ...i, status: 'declined' } : i
                ));
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to decline inquiry');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredInquiries = inquiries.filter(inquiry => {
        if (filter === 'all') return true;
        return inquiry.status === filter;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return 'badge-warning';
            case 'accepted':
                return 'badge-success';
            case 'declined':
                return 'badge-error';
            default:
                return 'badge-default';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="received-inquiries-page">
                <div className="container container-md">
                    <div className="loading-state card">
                        <div className="loader"></div>
                        <p>Loading inquiries...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="received-inquiries-page">
            <div className="container container-md">
                <Link to="/vendor/dashboard" className="back-btn btn btn-ghost">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>

                <div className="page-header">
                    <div>
                        <h1>
                            <Megaphone size={28} />
                            Ad Inquiries
                        </h1>
                        <p className="text-muted">Inquiries from customers about your ads</p>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={20} />
                        {error}
                        <button onClick={() => setError('')} className="close-btn">×</button>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="filter-tabs card">
                    <Filter size={18} />
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({inquiries.length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({inquiries.filter(i => i.status === 'pending').length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'accepted' ? 'active' : ''}`}
                        onClick={() => setFilter('accepted')}
                    >
                        Accepted ({inquiries.filter(i => i.status === 'accepted').length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'declined' ? 'active' : ''}`}
                        onClick={() => setFilter('declined')}
                    >
                        Declined ({inquiries.filter(i => i.status === 'declined').length})
                    </button>
                </div>

                {/* Inquiries List */}
                {filteredInquiries.length === 0 ? (
                    <div className="empty-state card">
                        <Megaphone size={48} />
                        <h3>No inquiries yet</h3>
                        <p>When customers inquire about your ads, they'll appear here</p>
                    </div>
                ) : (
                    <div className="inquiries-list">
                        {filteredInquiries.map(inquiry => (
                            <div key={inquiry._id} className="inquiry-card card">
                                <div className="inquiry-header">
                                    <div className="customer-info">
                                        <div className="customer-avatar">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3>{inquiry.customerId?.name || 'Customer'}</h3>
                                            <div className="customer-contact">
                                                {inquiry.customerId?.phone && (
                                                    <span>
                                                        <Phone size={14} />
                                                        {inquiry.customerId.phone}
                                                    </span>
                                                )}
                                                {inquiry.customerId?.email && (
                                                    <span>
                                                        <Mail size={14} />
                                                        {inquiry.customerId.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`badge ${getStatusBadge(inquiry.status)}`}>
                                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                                    </span>
                                </div>

                                <div className="ad-reference">
                                    <span className="ad-label">For ad:</span>
                                    <span className="ad-title">{inquiry.advertisementId?.title || 'Advertisement'}</span>
                                </div>

                                <div className="inquiry-message">
                                    <p>"{inquiry.message}"</p>
                                </div>

                                <div className="inquiry-footer">
                                    <span className="inquiry-date">
                                        <Clock size={14} />
                                        {formatDate(inquiry.createdAt)}
                                    </span>

                                    <div className="inquiry-actions">
                                        {inquiry.status === 'pending' && (
                                            <>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleAccept(inquiry._id)}
                                                    disabled={actionLoading === inquiry._id}
                                                >
                                                    {actionLoading === inquiry._id ? (
                                                        <span className="loader-sm"></span>
                                                    ) : (
                                                        <>
                                                            <CheckCircle size={16} />
                                                            Accept
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => handleDecline(inquiry._id)}
                                                    disabled={actionLoading === inquiry._id}
                                                >
                                                    <XCircle size={16} />
                                                    Decline
                                                </button>
                                            </>
                                        )}

                                        {inquiry.status === 'accepted' && (
                                            <Link
                                                to={getConversationUrl(inquiry)}
                                                className="btn btn-primary btn-sm"
                                            >
                                                <MessageSquare size={16} />
                                                Chat
                                            </Link>
                                        )}

                                        {inquiry.status === 'declined' && (
                                            <span className="declined-label">
                                                <XCircle size={14} />
                                                Declined
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .received-inquiries-page {
                    padding: var(--space-xl) 0;
                    min-height: calc(100vh - 200px);
                }

                .back-btn {
                    margin-bottom: var(--space-lg);
                }

                .page-header {
                    margin-bottom: var(--space-xl);
                }

                .page-header h1 {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    font-size: 1.75rem;
                    margin-bottom: var(--space-xs);
                }

                .filter-tabs {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    padding: var(--space-md);
                    margin-bottom: var(--space-xl);
                    overflow-x: auto;
                }

                .filter-tabs svg {
                    color: var(--color-gray-400);
                    flex-shrink: 0;
                }

                .filter-tab {
                    background: none;
                    border: 1px solid var(--color-gray-200);
                    padding: var(--space-sm) var(--space-md);
                    border-radius: var(--radius-lg);
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--color-gray-600);
                    transition: all var(--transition-base);
                    white-space: nowrap;
                }

                .filter-tab:hover {
                    border-color: var(--color-gray-300);
                    color: var(--color-gray-900);
                }

                .filter-tab.active {
                    background: var(--color-primary);
                    border-color: var(--color-primary);
                    color: white;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--space-3xl);
                    text-align: center;
                }

                .empty-state svg {
                    color: var(--color-gray-300);
                    margin-bottom: var(--space-lg);
                }

                .empty-state h3 {
                    margin-bottom: var(--space-sm);
                }

                .empty-state p {
                    color: var(--color-gray-500);
                }

                .inquiries-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-md);
                }

                .inquiry-card {
                    padding: var(--space-lg);
                }

                .inquiry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: var(--space-md);
                    margin-bottom: var(--space-md);
                }

                .customer-info {
                    display: flex;
                    align-items: flex-start;
                    gap: var(--space-md);
                }

                .customer-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: var(--color-gray-100);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-gray-500);
                    flex-shrink: 0;
                }

                .customer-info h3 {
                    font-size: 1.1rem;
                    margin: 0 0 var(--space-xs) 0;
                }

                .customer-contact {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--space-md);
                }

                .customer-contact span {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-size: 0.875rem;
                    color: var(--color-gray-500);
                }

                .ad-reference {
                    background: var(--color-gray-50);
                    padding: var(--space-sm) var(--space-md);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--space-md);
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                }

                .ad-label {
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                    text-transform: uppercase;
                }

                .ad-title {
                    font-weight: 500;
                    color: var(--color-gray-900);
                }

                .inquiry-message {
                    background: var(--color-gray-50);
                    padding: var(--space-md);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--space-md);
                }

                .inquiry-message p {
                    margin: 0;
                    color: var(--color-gray-700);
                    font-style: italic;
                }

                .inquiry-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: var(--space-md);
                }

                .inquiry-date {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-size: 0.875rem;
                    color: var(--color-gray-500);
                }

                .inquiry-actions {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                }

                .declined-label {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-size: 0.875rem;
                    color: var(--color-error);
                }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--space-xs);
                    padding: var(--space-xs) var(--space-sm);
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .badge-warning {
                    background: rgba(234, 179, 8, 0.1);
                    color: #b45309;
                }

                .badge-success {
                    background: rgba(34, 197, 94, 0.1);
                    color: #15803d;
                }

                .badge-error {
                    background: rgba(239, 68, 68, 0.1);
                    color: #dc2626;
                }

                .alert {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    padding: var(--space-md);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--space-lg);
                }

                .alert-error {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--color-error);
                }

                .alert .close-btn {
                    margin-left: auto;
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    cursor: pointer;
                    color: inherit;
                    padding: 0;
                    line-height: 1;
                }

                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--space-3xl);
                    text-align: center;
                }

                .loader-sm {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 640px) {
                    .filter-tabs {
                        gap: var(--space-xs);
                    }

                    .filter-tab {
                        padding: var(--space-xs) var(--space-sm);
                        font-size: 0.75rem;
                    }

                    .inquiry-header {
                        flex-direction: column;
                    }

                    .customer-info {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .inquiry-footer {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
            `}</style>
        </div>
    );
};

export default ReceivedInquiries;

