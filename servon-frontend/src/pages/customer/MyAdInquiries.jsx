import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyAdRequests } from '../../services/adRequestService';
import {
    ArrowLeft,
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Megaphone,
    MapPin,
    Building,
    Filter
} from 'lucide-react';

const MyAdInquiries = () => {
    const { user } = useAuth();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    // Helper function to generate conversation URL for accepted inquiries
    const getConversationUrl = (inquiry) => {
        const vendorId = inquiry.vendorId?._id || inquiry.vendorId;
        const customerId = user?._id;
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
            const response = await getMyAdRequests();
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

    const filteredInquiries = inquiries.filter(inquiry => {
        if (filter === 'all') return true;
        return inquiry.status === filter;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock size={16} className="status-icon pending" />;
            case 'accepted':
                return <CheckCircle size={16} className="status-icon accepted" />;
            case 'declined':
                return <XCircle size={16} className="status-icon declined" />;
            default:
                return <AlertCircle size={16} className="status-icon" />;
        }
    };

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
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="my-inquiries-page">
                <div className="container container-md">
                    <div className="loading-state card">
                        <div className="loader"></div>
                        <p>Loading your inquiries...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-inquiries-page">
            <div className="container container-md">
                <Link to="/customer/dashboard" className="back-btn btn btn-ghost">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>

                <div className="page-header">
                    <div>
                        <h1>
                            <Megaphone size={28} />
                            My Ad Inquiries
                        </h1>
                        <p className="text-muted">Track your inquiries to vendors</p>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={20} />
                        {error}
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
                        <p>Browse ads and send inquiries to vendors</p>
                        <Link to="/browse-ads" className="btn btn-primary">
                            Browse Ads
                        </Link>
                    </div>
                ) : (
                    <div className="inquiries-list">
                        {filteredInquiries.map(inquiry => (
                            <div key={inquiry._id} className="inquiry-card card">
                                <div className="inquiry-header">
                                    <div className="ad-info">
                                        <h3>{inquiry.advertisementId?.title || 'Ad'}</h3>
                                        <div className="ad-meta">
                                            <span className="vendor">
                                                <Building size={14} />
                                                {inquiry.vendorId?.businessName || inquiry.vendorId?.name || 'Vendor'}
                                            </span>
                                            {inquiry.advertisementId?.serviceArea && (
                                                <span className="location">
                                                    <MapPin size={14} />
                                                    {inquiry.advertisementId.serviceArea}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="inquiry-status">
                                        <span className={`badge ${getStatusBadge(inquiry.status)}`}>
                                            {getStatusIcon(inquiry.status)}
                                            {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                <div className="inquiry-message">
                                    <p>"{inquiry.message}"</p>
                                </div>

                                <div className="inquiry-footer">
                                    <span className="inquiry-date">
                                        <Clock size={14} />
                                        Sent on {formatDate(inquiry.createdAt)}
                                    </span>

                                    <div className="inquiry-actions">
                                        {inquiry.status === 'pending' && (
                                            <span className="waiting-text">
                                                <Clock size={14} />
                                                Waiting for response...
                                            </span>
                                        )}

                                        {inquiry.status === 'accepted' && (
                                            <Link
                                                to={getConversationUrl(inquiry)}
                                                className="btn btn-primary btn-sm"
                                            >
                                                <MessageSquare size={16} />
                                                Chat with Vendor
                                            </Link>
                                        )}

                                        {inquiry.status === 'declined' && (
                                            <span className="declined-text">
                                                <XCircle size={14} />
                                                Vendor declined your inquiry
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
                .my-inquiries-page {
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
                    margin-bottom: var(--space-lg);
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

                .ad-info h3 {
                    font-size: 1.1rem;
                    margin: 0 0 var(--space-xs) 0;
                }

                .ad-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--space-md);
                }

                .ad-meta span {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-size: 0.875rem;
                    color: var(--color-gray-500);
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

                .waiting-text {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-size: 0.875rem;
                    color: var(--color-warning);
                }

                .declined-text {
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

                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--space-3xl);
                    text-align: center;
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

                    .inquiry-footer {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
            `}</style>
        </div>
    );
};

export default MyAdInquiries;

