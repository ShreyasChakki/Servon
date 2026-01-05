import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getServiceRequest } from '../../services/serviceRequestService';
import { sendQuotation } from '../../services/quotationService';
import { getWalletBalance } from '../../services/walletService';
import {
    Send,
    IndianRupee,
    Clock,
    ArrowLeft,
    MapPin,
    AlertCircle,
    CheckCircle,
    Wallet
} from 'lucide-react';

const SendQuotation = () => {
    const { requestId } = useParams();
    const navigate = useNavigate();

    const [request, setRequest] = useState(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        price: '',
        message: '',
        estimatedDuration: ''
    });

    useEffect(() => {
        fetchData();
    }, [requestId]);

    const fetchData = async () => {
        try {
            const [requestRes, walletRes] = await Promise.all([
                getServiceRequest(requestId),
                getWalletBalance()
            ]);

            if (requestRes.success) {
                setRequest(requestRes.data);
            }
            if (walletRes.success) {
                setWalletBalance(walletRes.data.balance);
            }
        } catch (err) {
            setError('Failed to load request details');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (walletBalance < 1) {
            setError('Insufficient wallet balance. Please add funds first.');
            return;
        }

        setSending(true);
        setError('');

        try {
            const response = await sendQuotation({
                requestId,
                price: Number(formData.price),
                message: formData.message,
                estimatedDuration: formData.estimatedDuration
            });

            if (response.success) {
                setSuccess(true);
                setWalletBalance(response.newBalance);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send quotation');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loader"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="success-page">
                <div className="success-card card card-elevated">
                    <CheckCircle size={64} className="success-icon" />
                    <h2>Quotation Sent!</h2>
                    <p>₹1 has been deducted from your wallet.</p>
                    <p className="new-balance">New Balance: ₹{walletBalance}</p>
                    <div className="success-actions">
                        <Link to="/vendor/browse-requests" className="btn btn-primary">
                            Browse More Requests
                        </Link>
                        <Link to="/vendor/my-quotations" className="btn btn-secondary">
                            View My Quotations
                        </Link>
                    </div>
                </div>
                <style>{`
          .success-page {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            padding: var(--space-xl);
          }
          .success-card {
            text-align: center;
            padding: var(--space-3xl);
            max-width: 450px;
          }
          .success-icon {
            color: var(--color-success);
            margin-bottom: var(--space-lg);
          }
          .success-card h2 {
            margin-bottom: var(--space-md);
          }
          .success-card p {
            color: var(--color-gray-600);
            margin-bottom: var(--space-sm);
          }
          .new-balance {
            font-weight: 600;
            color: var(--color-accent) !important;
            margin-bottom: var(--space-xl) !important;
          }
          .success-actions {
            display: flex;
            flex-direction: column;
            gap: var(--space-md);
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="send-quotation-page">
            <div className="container">
                <button
                    className="back-btn btn btn-ghost"
                    onClick={() => navigate('/vendor/browse-requests')}
                >
                    <ArrowLeft size={18} />
                    Back to Requests
                </button>

                <div className="page-grid">
                    {/* Request Details */}
                    <div className="request-details card">
                        <h2>Request Details</h2>
                        {request && (
                            <>
                                <h3>{request.title}</h3>
                                <span className="category-badge">
                                    {request.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <p className="description">{request.description}</p>
                                <div className="request-meta">
                                    <div className="meta-item">
                                        <MapPin size={16} />
                                        <span>{request.location}</span>
                                    </div>
                                    {request.budget && (
                                        <div className="meta-item">
                                            <IndianRupee size={16} />
                                            <span>Budget: ₹{request.budget.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="meta-item">
                                        <Clock size={16} />
                                        <span>Urgency: {request.urgency}</span>
                                    </div>
                                </div>
                                <div className="customer-info">
                                    <span>Posted by: {request.customerId?.name}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Quotation Form */}
                    <div className="quotation-form-card card card-elevated">
                        <h2>Send Quotation</h2>

                        {/* Wallet Warning */}
                        <div className={`wallet-status ${walletBalance < 1 ? 'low' : 'ok'}`}>
                            <Wallet size={20} />
                            <span>Wallet Balance: ₹{walletBalance}</span>
                            {walletBalance < 1 && (
                                <Link to="/vendor/wallet" className="add-funds-link">
                                    Add Funds
                                </Link>
                            )}
                        </div>

                        {error && (
                            <div className="error-alert">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="price">Your Price (₹) *</label>
                                <div className="input-with-icon">
                                    <IndianRupee className="input-icon" size={18} />
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        className="input"
                                        placeholder="Enter your price"
                                        min="0"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="estimatedDuration">Estimated Duration</label>
                                <div className="input-with-icon">
                                    <Clock className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        id="estimatedDuration"
                                        name="estimatedDuration"
                                        className="input"
                                        placeholder="e.g., 2-3 days"
                                        value={formData.estimatedDuration}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="message">Message to Customer *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    className="input"
                                    placeholder="Describe why you're the best fit for this job..."
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="fee-notice">
                                <AlertCircle size={16} />
                                <span>₹1 will be deducted from your wallet to send this quotation</span>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg w-full"
                                disabled={sending || walletBalance < 1}
                            >
                                {sending ? (
                                    <>
                                        <span className="loader"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send Quotation (₹1)
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
        .send-quotation-page {
          padding: var(--space-lg) 0;
        }

        .back-btn {
          margin-bottom: var(--space-lg);
        }

        .page-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-xl);
          align-items: start;
        }

        .request-details {
          padding: var(--space-xl);
        }

        .request-details h2 {
          font-size: 1rem;
          color: var(--color-gray-500);
          margin-bottom: var(--space-lg);
        }

        .request-details h3 {
          font-size: 1.5rem;
          margin-bottom: var(--space-sm);
        }

        .category-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--space-lg);
        }

        .description {
          color: var(--color-gray-600);
          margin-bottom: var(--space-lg);
          line-height: 1.6;
        }

        .request-meta {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          margin-bottom: var(--space-lg);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 0.875rem;
          color: var(--color-gray-600);
        }

        .customer-info {
          padding-top: var(--space-md);
          border-top: 1px solid var(--color-gray-200);
          font-size: 0.875rem;
          color: var(--color-gray-500);
        }

        .quotation-form-card {
          padding: var(--space-xl);
        }

        .quotation-form-card h2 {
          font-size: 1.25rem;
          margin-bottom: var(--space-lg);
        }

        .wallet-status {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-lg);
          font-size: 0.875rem;
        }

        .wallet-status.ok {
          background-color: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
        }

        .wallet-status.low {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--color-error);
        }

        .add-funds-link {
          margin-left: auto;
          font-weight: 600;
          text-decoration: underline;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background-color: rgba(239, 68, 68, 0.1);
          border-radius: var(--radius-md);
          color: var(--color-error);
          font-size: 0.875rem;
          margin-bottom: var(--space-lg);
        }

        form {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-gray-400);
        }

        .input-with-icon .input {
          padding-left: 2.75rem;
        }

        .fee-notice {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 0.75rem;
          color: var(--color-gray-500);
          padding: var(--space-sm);
          background-color: var(--color-gray-50);
          border-radius: var(--radius-md);
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: var(--space-md);
        }

        @media (max-width: 768px) {
          .page-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default SendQuotation;
