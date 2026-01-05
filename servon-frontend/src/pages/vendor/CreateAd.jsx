import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWalletBalance } from '../../services/walletService';
import { createAdvertisement } from '../../services/advertisementService';
import {
    Megaphone,
    ArrowLeft,
    Wallet,
    IndianRupee,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

const SERVICE_CATEGORIES = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'carpentry', label: 'Carpentry' },
    { value: 'painting', label: 'Painting' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'pest-control', label: 'Pest Control' },
    { value: 'appliance-repair', label: 'Appliance Repair' },
    { value: 'home-renovation', label: 'Home Renovation' },
    { value: 'gardening', label: 'Gardening' },
    { value: 'moving-packing', label: 'Moving & Packing' },
    { value: 'ac-repair', label: 'AC Repair' },
    { value: 'interior-design', label: 'Interior Design' },
    { value: 'security', label: 'Security' },
    { value: 'other', label: 'Other' }
];

const CreateAd = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        serviceArea: '',
        contactPhone: '',
        image: '',
        budget: 50
    });

    useEffect(() => {
        fetchWalletBalance();
    }, []);

    const fetchWalletBalance = async () => {
        try {
            const response = await getWalletBalance();
            if (response.success) {
                setWalletBalance(response.data.balance);
            }
        } catch (err) {
            console.error('Failed to fetch wallet:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.budget > walletBalance) {
            setError(`Insufficient wallet balance. You have ₹${walletBalance}`);
            setLoading(false);
            return;
        }

        try {
            const response = await createAdvertisement({
                ...formData,
                budget: Number(formData.budget)
            });

            if (response.success) {
                setSuccess(true);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create advertisement');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="create-ad-page">
                <div className="container container-sm">
                    <div className="success-card card">
                        <CheckCircle size={64} className="success-icon" />
                        <h2>Advertisement Created!</h2>
                        <p>Your ad is now live and will be shown to customers.</p>
                        <p className="budget-deducted">
                            <IndianRupee size={16} />
                            {formData.budget} deducted from wallet
                        </p>
                        <div className="success-actions">
                            <Link to="/vendor/my-ads" className="btn btn-primary">
                                View My Ads
                            </Link>
                            <Link to="/vendor/dashboard" className="btn btn-secondary">
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
                <style>{successStyles}</style>
            </div>
        );
    }

    return (
        <div className="create-ad-page">
            <div className="container container-sm">
                <div className="page-header">
                    <Link to="/vendor/dashboard" className="back-link">
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </Link>
                    <h1>
                        <Megaphone size={28} />
                        Create Advertisement
                    </h1>
                    <div className="wallet-info card">
                        <Wallet size={18} />
                        <span>Wallet Balance:</span>
                        <strong><IndianRupee size={14} />{walletBalance.toFixed(2)}</strong>
                    </div>
                </div>

                {error && (
                    <div className="error-alert">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="ad-form card">
                    <div className="input-group">
                        <label htmlFor="title">Ad Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            className="input"
                            placeholder="e.g., Professional Plumbing Services"
                            value={formData.title}
                            onChange={handleChange}
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="category">Service Category *</label>
                        <select
                            id="category"
                            name="category"
                            className="input"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select category</option>
                            {SERVICE_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            className="input"
                            placeholder="Describe your services..."
                            value={formData.description}
                            onChange={handleChange}
                            maxLength={500}
                            rows={4}
                            required
                        />
                        <span className="char-count">
                            {formData.description.length}/500
                        </span>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="serviceArea">Service Area *</label>
                            <input
                                type="text"
                                id="serviceArea"
                                name="serviceArea"
                                className="input"
                                placeholder="e.g., Delhi NCR"
                                value={formData.serviceArea}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="contactPhone">Contact Phone *</label>
                            <input
                                type="tel"
                                id="contactPhone"
                                name="contactPhone"
                                className="input"
                                placeholder="10-digit number"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="image">Banner Image URL (Optional)</label>
                        <input
                            type="url"
                            id="image"
                            name="image"
                            className="input"
                            placeholder="https://example.com/your-banner.jpg"
                            value={formData.image}
                            onChange={handleChange}
                        />
                        <span className="helper-text">
                            Paste a URL to your banner image (recommended: 800x400px)
                        </span>
                        {formData.image && (
                            <div className="image-preview">
                                <img src={formData.image} alt="Banner preview" onError={(e) => e.target.style.display = 'none'} />
                            </div>
                        )}
                    </div>

                    <div className="input-group budget-group">
                        <label htmlFor="budget">Ad Budget (₹) *</label>
                        <div className="budget-options">
                            {[10, 25, 50, 100, 200].map(amount => (
                                <button
                                    key={amount}
                                    type="button"
                                    className={`budget-btn ${formData.budget === amount ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, budget: amount }))}
                                >
                                    ₹{amount}
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            id="budget"
                            name="budget"
                            className="input"
                            placeholder="Or enter custom amount"
                            min="10"
                            value={formData.budget}
                            onChange={handleChange}
                            required
                        />
                        <span className="helper-text">Minimum ₹10</span>
                    </div>

                    <div className="payment-notice">
                        <IndianRupee size={18} />
                        <span>₹{formData.budget} will be deducted from your wallet</span>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={loading || formData.budget > walletBalance}
                    >
                        {loading ? (
                            <>
                                <span className="loader"></span>
                                Creating Ad...
                            </>
                        ) : (
                            <>
                                <Megaphone size={18} />
                                Create Advertisement for ₹{formData.budget}
                            </>
                        )}
                    </button>

                    {formData.budget > walletBalance && (
                        <div className="insufficient-notice">
                            <AlertCircle size={16} />
                            <span>
                                Insufficient balance.
                                <Link to="/vendor/wallet">Add funds</Link>
                            </span>
                        </div>
                    )}
                </form>
            </div>

            <style>{`
                .create-ad-page {
                    padding: var(--space-xl) 0;
                }

                .page-header {
                    margin-bottom: var(--space-xl);
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--space-sm);
                    color: var(--color-gray-600);
                    margin-bottom: var(--space-md);
                    font-size: 0.875rem;
                }

                .page-header h1 {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    font-size: 1.75rem;
                    margin-bottom: var(--space-md);
                }

                .wallet-info {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--space-sm);
                    padding: var(--space-sm) var(--space-md);
                    font-size: 0.875rem;
                }

                .wallet-info strong {
                    display: flex;
                    align-items: center;
                    color: var(--color-accent);
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

                .ad-form {
                    padding: var(--space-xl);
                }

                .ad-form .input-group {
                    margin-bottom: var(--space-lg);
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--space-lg);
                }

                .char-count {
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                    text-align: right;
                }

                .budget-options {
                    display: flex;
                    gap: var(--space-sm);
                    margin-bottom: var(--space-sm);
                }

                .budget-btn {
                    padding: var(--space-sm) var(--space-md);
                    background: var(--color-gray-100);
                    border: 2px solid transparent;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all var(--transition-base);
                }

                .budget-btn.active {
                    background: var(--color-primary);
                    color: var(--color-secondary);
                }

                .helper-text {
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                }

                .payment-notice {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-sm);
                    padding: var(--space-md);
                    background: var(--color-gray-100);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--space-lg);
                    font-weight: 500;
                }

                .insufficient-notice {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-sm);
                    margin-top: var(--space-md);
                    color: var(--color-error);
                    font-size: 0.875rem;
                }

                .insufficient-notice a {
                    color: var(--color-accent);
                    font-weight: 600;
                }

                .image-preview {
                    margin-top: var(--space-md);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    max-height: 200px;
                }

                .image-preview img {
                    width: 100%;
                    max-height: 200px;
                    object-fit: cover;
                }

                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

const successStyles = `
    .success-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--space-3xl);
        text-align: center;
    }

    .success-icon {
        color: var(--color-success);
        margin-bottom: var(--space-lg);
    }

    .success-card h2 {
        margin-bottom: var(--space-sm);
    }

    .success-card p {
        color: var(--color-gray-600);
        margin-bottom: var(--space-sm);
    }

    .budget-deducted {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-xs);
        font-weight: 600;
        color: var(--color-accent);
        margin-bottom: var(--space-xl);
    }

    .success-actions {
        display: flex;
        gap: var(--space-md);
    }
`;

// Categories constant for the dropdown
const SERVICE_CATEGORIES_FALLBACK = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'carpentry', label: 'Carpentry' },
    { value: 'painting', label: 'Painting' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'pest-control', label: 'Pest Control' },
    { value: 'appliance-repair', label: 'Appliance Repair' },
    { value: 'home-renovation', label: 'Home Renovation' },
    { value: 'gardening', label: 'Gardening' },
    { value: 'moving-packing', label: 'Moving & Packing' },
    { value: 'ac-repair', label: 'AC Repair' },
    { value: 'interior-design', label: 'Interior Design' },
    { value: 'security', label: 'Security' },
    { value: 'other', label: 'Other' }
];

export { SERVICE_CATEGORIES_FALLBACK as SERVICE_CATEGORIES };

export default CreateAd;
