import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getQuotationsForRequest, respondToQuotation } from '../../services/quotationService';
import { getServiceRequest } from '../../services/serviceRequestService';
import {
    ArrowLeft,
    MessageSquare,
    IndianRupee,
    Clock,
    CheckCircle,
    XCircle,
    User,
    Phone,
    Building,
    FileText
} from 'lucide-react';

const ViewQuotations = () => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [request, setRequest] = useState(null);
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');

    // Helper function to generate proper conversation URL
    const getConversationUrl = (quotation) => {
        // Debug logging
        console.log('Quotation data:', quotation);
        console.log('vendorId raw:', quotation.vendorId);
        console.log('Current user ID:', user?._id);

        // Use quotation._id directly - no sorting needed
        // The backend expects format: id1_id2_quotationId
        // We use the vendorId from quotation and current user's ID as customerId
        const vendorId = quotation.vendorId?._id || quotation.vendorId;
        const customerId = user?._id;  // Current user is the customer
        const quotationId = quotation._id;

        console.log('vendorId extracted:', vendorId);
        console.log('customerId (user._id):', customerId);
        console.log('quotationId:', quotationId);

        // Sort IDs alphabetically and join
        const sortedIds = [String(vendorId), String(customerId)].sort().join('_');
        const url = `/chat/${sortedIds}_${quotationId}`;
        console.log('Generated URL:', url);

        return url;
    };

    useEffect(() => {
        fetchData();
    }, [requestId]);

    const fetchData = async () => {
        try {
            const [requestRes, quotationsRes] = await Promise.all([
                getServiceRequest(requestId),
                getQuotationsForRequest(requestId)
            ]);

            if (requestRes.success) {
                setRequest(requestRes.data);
            }
            if (quotationsRes.success) {
                setQuotations(quotationsRes.data);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load quotations');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (quotationId) => {
        setActionLoading(quotationId);
        try {
            const response = await respondToQuotation(quotationId, 'accepted');
            if (response.success) {
                // Refresh quotations
                await fetchData();
                // Navigate to chat with this vendor
                const acceptedQuotation = quotations.find(q => q._id === quotationId);
                if (acceptedQuotation) {
                    const conversationId = [acceptedQuotation.customerId._id || acceptedQuotation.customerId,
                    acceptedQuotation.vendorId._id || acceptedQuotation.vendorId].sort().join('_');
                    navigate(`/chat/${conversationId}`);
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to accept quotation');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (quotationId) => {
        setActionLoading(quotationId);
        try {
            const response = await respondToQuotation(quotationId, 'rejected');
            if (response.success) {
                // Update local state
                setQuotations(prev => prev.map(q =>
                    q._id === quotationId ? { ...q, status: 'rejected' } : q
                ));
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reject quotation');
        } finally {
            setActionLoading(null);
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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return 'badge-warning';
            case 'accepted':
                return 'badge-success';
            case 'rejected':
                return 'badge-error';
            default:
                return 'badge-default';
        }
    };

    if (loading) {
        return (
            <div className="view-quotations-page">
                <div className="container container-md">
                    <div className="loading-state card">
                        <div className="loader"></div>
                        <p>Loading quotations...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="view-quotations-page">
            <div className="container container-md">
                <div className="page-header">
                    <Link to="/customer/dashboard" className="back-link">
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </Link>

                    {request && (
                        <div className="request-summary card">
                            <div className="request-info">
                                <h1>{request.title}</h1>
                                <p className="request-category">
                                    {request.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </p>
                                <p className="request-desc">{request.description}</p>
                                {request.budget && (
                                    <p className="request-budget">
                                        <IndianRupee size={14} />
                                        Budget: ₹{request.budget.toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <h2>
                        <MessageSquare size={24} />
                        Quotations Received ({quotations.length})
                    </h2>
                </div>

                {error && (
                    <div className="error-alert">
                        {error}
                    </div>
                )}

                {quotations.length === 0 ? (
                    <div className="empty-state card">
                        <MessageSquare size={48} className="empty-icon" />
                        <h3>No quotations yet</h3>
                        <p>Vendors haven't sent any quotations for this request yet.</p>
                    </div>
                ) : (
                    <div className="quotations-list">
                        {quotations.map(quotation => (
                            <div key={quotation._id} className={`quotation-card card ${quotation.status}`}>
                                <div className="quotation-header">
                                    <div className="vendor-info">
                                        <div className="vendor-avatar">
                                            <Building size={24} />
                                        </div>
                                        <div>
                                            <h3>{quotation.vendorId?.businessName || quotation.vendorId?.name || 'Vendor'}</h3>
                                            {quotation.vendorId?.phone && (
                                                <p className="vendor-phone">
                                                    <Phone size={12} />
                                                    {quotation.vendorId.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`badge ${getStatusBadge(quotation.status)}`}>
                                        {quotation.status}
                                    </span>
                                </div>

                                <div className="quotation-price">
                                    <IndianRupee size={20} />
                                    <span className="price-amount">₹{quotation.price.toLocaleString()}</span>
                                </div>

                                {quotation.message && (
                                    <div className="quotation-message">
                                        <FileText size={14} />
                                        <p>{quotation.message}</p>
                                    </div>
                                )}

                                {quotation.estimatedDuration && (
                                    <p className="quotation-duration">
                                        <Clock size={14} />
                                        Estimated: {quotation.estimatedDuration}
                                    </p>
                                )}

                                <p className="quotation-date">
                                    Received: {formatDate(quotation.createdAt)}
                                </p>

                                {quotation.status === 'sent' && (
                                    <div className="quotation-actions">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleAccept(quotation._id)}
                                            disabled={actionLoading === quotation._id}
                                        >
                                            {actionLoading === quotation._id ? (
                                                <span className="loader-sm"></span>
                                            ) : (
                                                <>
                                                    <CheckCircle size={16} />
                                                    Accept
                                                </>
                                            )}
                                        </button>
                                        <Link
                                            to={getConversationUrl(quotation)}
                                            className="btn btn-secondary"
                                        >
                                            <MessageSquare size={16} />
                                            Chat
                                        </Link>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => handleReject(quotation._id)}
                                            disabled={actionLoading === quotation._id}
                                        >
                                            <XCircle size={16} />
                                            Decline
                                        </button>
                                    </div>
                                )}

                                {quotation.status === 'accepted' && (
                                    <Link
                                        to={getConversationUrl(quotation)}
                                        className="btn btn-primary"
                                    >
                                        <MessageSquare size={16} />
                                        Go to Chat
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .view-quotations-page {
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

                .request-summary {
                    padding: var(--space-xl);
                    margin-bottom: var(--space-xl);
                    background: linear-gradient(135deg, var(--color-gray-50), var(--color-secondary));
                }

                .request-summary h1 {
                    font-size: 1.5rem;
                    margin-bottom: var(--space-xs);
                }

                .request-category {
                    font-size: 0.75rem;
                    color: var(--color-accent);
                    text-transform: uppercase;
                    font-weight: 600;
                    margin-bottom: var(--space-sm);
                }

                .request-desc {
                    color: var(--color-gray-600);
                    font-size: 0.875rem;
                    margin-bottom: var(--space-sm);
                }

                .request-budget {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-weight: 600;
                }

                .page-header h2 {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    font-size: 1.25rem;
                    margin-bottom: var(--space-lg);
                }

                .error-alert {
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

                .quotations-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-md);
                }

                .quotation-card {
                    padding: var(--space-xl);
                }

                .quotation-card.accepted {
                    border-left: 4px solid var(--color-success);
                }

                .quotation-card.rejected {
                    opacity: 0.6;
                    border-left: 4px solid var(--color-gray-300);
                }

                .quotation-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--space-lg);
                }

                .vendor-info {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                }

                .vendor-avatar {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--color-gray-100);
                    border-radius: var(--radius-full);
                }

                .vendor-info h3 {
                    font-size: 1rem;
                    margin-bottom: var(--space-xs);
                }

                .vendor-phone {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                }

                .quotation-price {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    margin-bottom: var(--space-md);
                }

                .price-amount {
                    font-family: var(--font-display);
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--color-accent);
                }

                .quotation-message {
                    display: flex;
                    gap: var(--space-sm);
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

                .quotation-duration {
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
                    margin-bottom: var(--space-lg);
                }

                .quotation-actions {
                    display: flex;
                    gap: var(--space-md);
                }

                .loader-sm {
                    width: 16px;
                    height: 16px;
                    border: 2px solid transparent;
                    border-top-color: currentColor;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
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
                        gap: var(--space-md);
                    }

                    .quotation-actions {
                        flex-direction: column;
                    }

                    .quotation-actions .btn {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default ViewQuotations;
