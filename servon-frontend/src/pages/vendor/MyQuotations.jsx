import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyQuotations } from '../../services/quotationService';
import {
    ArrowLeft,
    MessageSquare,
    IndianRupee,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    User,
    Send
} from 'lucide-react';

const MyQuotations = () => {
    const { user } = useAuth();  // Current user is the vendor
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    // Helper function to generate proper conversation URL
    const getConversationUrl = (quotation) => {
        // Current user is the vendor viewing their sent quotations
        const vendorId = user?._id;  // Use current user's ID as vendorId
        const customerId = quotation.customerId?._id || quotation.customerId;
        const quotationId = quotation._id;

        // Sort IDs alphabetically and join
        const sortedIds = [String(vendorId), String(customerId)].sort().join('_');
        return `/chat/${sortedIds}_${quotationId}`;
    };

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            const response = await getMyQuotations();
            if (response.success) {
                setQuotations(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch quotations:', err);
            setError('Failed to load quotations');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent':
                return <Clock size={16} className="status-icon pending" />;
            case 'accepted':
                return <CheckCircle size={16} className="status-icon success" />;
            case 'rejected':
                return <XCircle size={16} className="status-icon error" />;
            default:
                return <AlertCircle size={16} className="status-icon" />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'sent':
                return 'Waiting for Response';
            case 'accepted':
                return 'Accepted';
            case 'rejected':
                return 'Declined';
            default:
                return status;
        }
    };

    const filteredQuotations = quotations.filter(q => {
        if (filter === 'all') return true;
        return q.status === filter;
    });

    if (loading) {
        return (
            <div className="my-quotations-page">
                <div className="container container-md">
                    <div className="loading-state card">
                        <div className="loader"></div>
                        <p>Loading your quotations...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-quotations-page">
            <div className="container container-md">
                <div className="page-header">
                    <Link to="/vendor/dashboard" className="back-link">
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </Link>
                    <h1>
                        <FileText size={28} />
                        My Quotations
                    </h1>
                    <p className="subtitle">Track the status of quotations you've sent</p>
                </div>

                {/* Filter Pills */}
                <div className="filter-pills">
                    <button
                        className={`pill ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({quotations.length})
                    </button>
                    <button
                        className={`pill ${filter === 'sent' ? 'active' : ''}`}
                        onClick={() => setFilter('sent')}
                    >
                        Pending ({quotations.filter(q => q.status === 'sent').length})
                    </button>
                    <button
                        className={`pill ${filter === 'accepted' ? 'active' : ''}`}
                        onClick={() => setFilter('accepted')}
                    >
                        Accepted ({quotations.filter(q => q.status === 'accepted').length})
                    </button>
                    <button
                        className={`pill ${filter === 'rejected' ? 'active' : ''}`}
                        onClick={() => setFilter('rejected')}
                    >
                        Declined ({quotations.filter(q => q.status === 'rejected').length})
                    </button>
                </div>

                {error && (
                    <div className="error-alert">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {filteredQuotations.length === 0 ? (
                    <div className="empty-state card">
                        <Send size={48} className="empty-icon" />
                        <h3>No quotations yet</h3>
                        <p>
                            {filter === 'all'
                                ? "You haven't sent any quotations yet. Browse requests to find leads!"
                                : `No ${filter} quotations to show.`}
                        </p>
                        {filter === 'all' && (
                            <Link to="/vendor/browse-requests" className="btn btn-primary">
                                Browse Requests
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="quotations-list">
                        {filteredQuotations.map(quotation => (
                            <div key={quotation._id} className={`quotation-card card ${quotation.status}`}>
                                <div className="quotation-header">
                                    <div className="request-info">
                                        <h3>{quotation.requestId?.title || 'Service Request'}</h3>
                                        <span className="category">
                                            {quotation.requestId?.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </span>
                                    </div>
                                    <div className={`status-badge ${quotation.status}`}>
                                        {getStatusIcon(quotation.status)}
                                        <span>{getStatusLabel(quotation.status)}</span>
                                    </div>
                                </div>

                                <div className="quotation-details">
                                    <div className="detail-row">
                                        <div className="detail-item">
                                            <IndianRupee size={16} />
                                            <span className="label">Your Quote:</span>
                                            <span className="value price">₹{quotation.price.toLocaleString()}</span>
                                        </div>
                                        {quotation.estimatedDuration && (
                                            <div className="detail-item">
                                                <Clock size={16} />
                                                <span className="label">Duration:</span>
                                                <span className="value">{quotation.estimatedDuration}</span>
                                            </div>
                                        )}
                                    </div>

                                    {quotation.message && (
                                        <div className="quotation-message">
                                            <p>{quotation.message}</p>
                                        </div>
                                    )}

                                    <div className="customer-info">
                                        <User size={14} />
                                        <span>Customer: {quotation.customerId?.name || 'Unknown'}</span>
                                    </div>

                                    <p className="quotation-date">
                                        Sent: {formatDate(quotation.createdAt)}
                                    </p>
                                </div>

                                <div className="quotation-actions">
                                    {quotation.status === 'sent' && (
                                        <div className="waiting-badge">
                                            <Clock size={16} />
                                            <span>Waiting for customer to respond...</span>
                                        </div>
                                    )}

                                    {quotation.status === 'accepted' && (
                                        <Link
                                            to={getConversationUrl(quotation)}
                                            className="btn btn-primary"
                                        >
                                            <MessageSquare size={16} />
                                            Chat with Customer
                                        </Link>
                                    )}

                                    {quotation.status === 'rejected' && (
                                        <div className="rejected-badge">
                                            <XCircle size={16} />
                                            <span>Customer chose another vendor</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .my-quotations-page {
                    padding: var(--space-xl) 0;
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--space-sm);
                    color: var(--color-gray-600);
                    margin-bottom: var(--space-lg);
                    font-size: 0.875rem;
                }

                .page-header h1 {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    font-size: 1.75rem;
                    margin-bottom: var(--space-sm);
                }

                .subtitle {
                    color: var(--color-gray-500);
                    margin-bottom: var(--space-xl);
                }

                .filter-pills {
                    display: flex;
                    gap: var(--space-sm);
                    margin-bottom: var(--space-xl);
                    flex-wrap: wrap;
                }

                .pill {
                    padding: var(--space-sm) var(--space-lg);
                    border: 1px solid var(--color-gray-200);
                    border-radius: var(--radius-full);
                    background: var(--color-secondary);
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all var(--transition-base);
                }

                .pill:hover {
                    border-color: var(--color-gray-400);
                }

                .pill.active {
                    background: var(--color-primary);
                    color: var(--color-secondary);
                    border-color: var(--color-primary);
                }

                .error-alert {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    padding: var(--space-md);
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--color-error);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--space-lg);
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: var(--space-3xl);
                    text-align: center;
                }

                .empty-icon {
                    color: var(--color-gray-300);
                    margin-bottom: var(--space-lg);
                }

                .empty-state h3 {
                    margin-bottom: var(--space-sm);
                }

                .empty-state p {
                    color: var(--color-gray-500);
                    margin-bottom: var(--space-lg);
                }

                .quotations-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-lg);
                }

                .quotation-card {
                    padding: var(--space-xl);
                    border-left: 4px solid var(--color-gray-300);
                }

                .quotation-card.sent {
                    border-left-color: var(--color-warning);
                }

                .quotation-card.accepted {
                    border-left-color: var(--color-success);
                }

                .quotation-card.rejected {
                    border-left-color: var(--color-error);
                    opacity: 0.7;
                }

                .quotation-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--space-lg);
                    gap: var(--space-md);
                }

                .request-info h3 {
                    font-size: 1.125rem;
                    margin-bottom: var(--space-xs);
                }

                .category {
                    font-size: 0.75rem;
                    color: var(--color-accent);
                    text-transform: uppercase;
                    font-weight: 600;
                }

                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    padding: var(--space-xs) var(--space-md);
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .status-badge.sent {
                    background: rgba(245, 158, 11, 0.1);
                    color: var(--color-warning);
                }

                .status-badge.accepted {
                    background: rgba(34, 197, 94, 0.1);
                    color: var(--color-success);
                }

                .status-badge.rejected {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--color-error);
                }

                .quotation-details {
                    margin-bottom: var(--space-lg);
                }

                .detail-row {
                    display: flex;
                    gap: var(--space-xl);
                    margin-bottom: var(--space-md);
                    flex-wrap: wrap;
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-size: 0.875rem;
                }

                .detail-item .label {
                    color: var(--color-gray-500);
                }

                .detail-item .value {
                    font-weight: 600;
                }

                .detail-item .price {
                    color: var(--color-accent);
                    font-size: 1.125rem;
                }

                .quotation-message {
                    padding: var(--space-md);
                    background: var(--color-gray-50);
                    border-radius: var(--radius-md);
                    margin-bottom: var(--space-md);
                }

                .quotation-message p {
                    font-size: 0.875rem;
                    color: var(--color-gray-700);
                    margin: 0;
                }

                .customer-info {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-size: 0.875rem;
                    color: var(--color-gray-600);
                    margin-bottom: var(--space-sm);
                }

                .quotation-date {
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                }

                .quotation-actions {
                    padding-top: var(--space-md);
                    border-top: 1px solid var(--color-gray-100);
                }

                .waiting-badge {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    color: var(--color-warning);
                    font-size: 0.875rem;
                }

                .rejected-badge {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    color: var(--color-gray-500);
                    font-size: 0.875rem;
                }

                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: var(--space-3xl);
                    gap: var(--space-md);
                }

                @media (max-width: 768px) {
                    .quotation-header {
                        flex-direction: column;
                    }

                    .detail-row {
                        flex-direction: column;
                        gap: var(--space-sm);
                    }
                }
            `}</style>
        </div>
    );
};

export default MyQuotations;
