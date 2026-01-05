import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getActiveAdvertisements, recordAdClick } from '../services/advertisementService';
import { sendAdRequest } from '../services/adRequestService';
import {
    Megaphone,
    MapPin,
    Phone,
    Eye,
    MousePointer,
    Building,
    Filter,
    X,
    Search,
    Send,
    MessageSquare,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

const SERVICE_CATEGORIES = [
    { value: '', label: 'All Categories' },
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

const BrowseAds = () => {
    const { user, isAuthenticated, isCustomer } = useAuth();
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [error, setError] = useState('');

    // Search filters
    const [searchTitle, setSearchTitle] = useState('');
    const [searchLocation, setSearchLocation] = useState('');

    // Inquiry modal state
    const [inquiryModal, setInquiryModal] = useState({ open: false, ad: null });
    const [inquiryMessage, setInquiryMessage] = useState('');
    const [sendingInquiry, setSendingInquiry] = useState(false);
    const [inquirySuccess, setInquirySuccess] = useState(false);
    const [inquiryError, setInquiryError] = useState('');

    useEffect(() => {
        fetchAds();
    }, [selectedCategory]);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const response = await getActiveAdvertisements(selectedCategory);
            if (response.success) {
                setAds(response.data);
            }
        } catch (err) {
            setError('Failed to load advertisements');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Filter ads based on search criteria
    const filteredAds = useMemo(() => {
        return ads.filter(ad => {
            const matchesTitle = !searchTitle ||
                ad.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
                ad.description?.toLowerCase().includes(searchTitle.toLowerCase());

            const matchesLocation = !searchLocation ||
                ad.serviceArea?.toLowerCase().includes(searchLocation.toLowerCase());

            return matchesTitle && matchesLocation;
        });
    }, [ads, searchTitle, searchLocation]);

    const handleAdClick = async (adId, phone) => {
        try {
            await recordAdClick(adId);
            // Open phone dialer
            window.location.href = `tel:${phone}`;
        } catch (err) {
            console.error('Failed to record click:', err);
        }
    };

    const getCategoryLabel = (value) => {
        const cat = SERVICE_CATEGORIES.find(c => c.value === value);
        return cat ? cat.label : value;
    };

    const clearAllFilters = () => {
        setSelectedCategory('');
        setSearchTitle('');
        setSearchLocation('');
    };

    const hasActiveFilters = selectedCategory || searchTitle || searchLocation;

    const openInquiryModal = (ad) => {
        setInquiryModal({ open: true, ad });
        setInquiryMessage(`Hi, I'm interested in your ${ad.title} service. Please let me know about availability and pricing.`);
        setInquiryError('');
        setInquirySuccess(false);
    };

    const closeInquiryModal = () => {
        setInquiryModal({ open: false, ad: null });
        setInquiryMessage('');
        setInquiryError('');
        setInquirySuccess(false);
    };

    const handleSendInquiry = async () => {
        if (!inquiryMessage.trim()) {
            setInquiryError('Please enter a message');
            return;
        }

        setSendingInquiry(true);
        setInquiryError('');

        try {
            await sendAdRequest(inquiryModal.ad._id, inquiryMessage.trim());
            setInquirySuccess(true);
            setTimeout(() => {
                closeInquiryModal();
            }, 2000);
        } catch (err) {
            setInquiryError(err.response?.data?.error || 'Failed to send inquiry');
        } finally {
            setSendingInquiry(false);
        }
    };

    return (
        <div className="browse-ads-page">
            <div className="container">
                <div className="page-header">
                    <div>
                        <h1>
                            <Megaphone size={32} />
                            Service Advertisements
                        </h1>
                        <p className="text-muted">Browse services from verified vendors</p>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="search-filter-section">
                    <div className="search-bar card">
                        <div className="search-inputs">
                            <div className="search-input-group">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by title or description..."
                                    value={searchTitle}
                                    onChange={(e) => setSearchTitle(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <div className="search-input-group">
                                <MapPin size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by location..."
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="filter-bar card">
                        <Filter size={18} />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="input"
                        >
                            {SERVICE_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                        {hasActiveFilters && (
                            <button
                                className="clear-filter"
                                onClick={clearAllFilters}
                            >
                                <X size={16} />
                                Clear All
                            </button>
                        )}
                        <span className="results-count">
                            {filteredAds.length} {filteredAds.length === 1 ? 'result' : 'results'}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="error-alert">{error}</div>
                )}

                {loading ? (
                    <div className="loading-state card">
                        <div className="loader"></div>
                        <p>Loading advertisements...</p>
                    </div>
                ) : filteredAds.length === 0 ? (
                    <div className="empty-state card">
                        <Megaphone size={48} className="empty-icon" />
                        <h3>No advertisements found</h3>
                        <p>
                            {hasActiveFilters
                                ? 'Try adjusting your search filters'
                                : 'No active advertisements at the moment'}
                        </p>
                        {hasActiveFilters && (
                            <button className="btn btn-secondary" onClick={clearAllFilters}>
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="ads-grid">
                        {filteredAds.map(ad => (
                            <div key={ad._id} className="ad-card card">
                                {ad.image && (
                                    <div className="ad-image">
                                        <img src={ad.image} alt={ad.title} />
                                    </div>
                                )}
                                <div className="ad-content">
                                    <span className="ad-category">
                                        {getCategoryLabel(ad.category)}
                                    </span>
                                    <h3>{ad.title}</h3>
                                    <p className="ad-description">{ad.description}</p>

                                    <Link
                                        to={`/vendor/${ad.vendorId?._id}`}
                                        className="ad-vendor"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Building size={14} />
                                        <span>{ad.vendorId?.businessName || ad.vendorId?.name}</span>
                                        <span className="view-profile-hint">View Profile →</span>
                                    </Link>

                                    <div className="ad-meta">
                                        <div className="meta-item">
                                            <MapPin size={14} />
                                            <span>{ad.serviceArea}</span>
                                        </div>
                                        <div className="meta-item">
                                            <Eye size={14} />
                                            <span>{ad.views} views</span>
                                        </div>
                                    </div>

                                    <div className="ad-actions">
                                        <Link
                                            to={`/vendor/${ad.vendorId?._id}`}
                                            className="btn btn-ghost"
                                        >
                                            View Profile
                                        </Link>
                                        {isAuthenticated && isCustomer && (
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => openInquiryModal(ad)}
                                            >
                                                <MessageSquare size={16} />
                                                Send Inquiry
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleAdClick(ad._id, ad.contactPhone)}
                                        >
                                            <Phone size={16} />
                                            {ad.contactPhone}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Inquiry Modal */}
            {inquiryModal.open && (
                <div className="modal-overlay" onClick={closeInquiryModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Send Inquiry</h2>
                            <button className="close-btn" onClick={closeInquiryModal}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {inquirySuccess ? (
                                <div className="success-state">
                                    <CheckCircle size={48} className="success-icon" />
                                    <h3>Inquiry Sent!</h3>
                                    <p>The vendor will review your inquiry and respond soon.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="ad-preview">
                                        <h3>{inquiryModal.ad?.title}</h3>
                                        <p className="vendor-name">
                                            <Building size={14} />
                                            {inquiryModal.ad?.vendorId?.businessName || inquiryModal.ad?.vendorId?.name}
                                        </p>
                                    </div>

                                    {inquiryError && (
                                        <div className="alert alert-error">
                                            <AlertCircle size={18} />
                                            {inquiryError}
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label htmlFor="inquiryMessage">Your Message</label>
                                        <textarea
                                            id="inquiryMessage"
                                            className="input textarea"
                                            value={inquiryMessage}
                                            onChange={(e) => setInquiryMessage(e.target.value)}
                                            placeholder="Describe what you need..."
                                            rows={5}
                                            maxLength={1000}
                                        />
                                        <span className="char-count">{inquiryMessage.length}/1000</span>
                                    </div>

                                    <div className="modal-actions">
                                        <button className="btn btn-ghost" onClick={closeInquiryModal}>
                                            Cancel
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSendInquiry}
                                            disabled={sendingInquiry || !inquiryMessage.trim()}
                                        >
                                            {sendingInquiry ? (
                                                <span className="loader-sm"></span>
                                            ) : (
                                                <>
                                                    <Send size={16} />
                                                    Send Inquiry
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .browse-ads-page {
                    padding: var(--space-xl) 0;
                }

                .page-header {
                    margin-bottom: var(--space-xl);
                }

                .page-header h1 {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    font-size: 2rem;
                    margin-bottom: var(--space-xs);
                }

                .search-filter-section {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-md);
                    margin-bottom: var(--space-xl);
                }

                .search-bar {
                    padding: var(--space-lg);
                }

                .search-inputs {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--space-md);
                }

                .search-input-group {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    background: var(--color-gray-50);
                    padding: var(--space-sm) var(--space-md);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--color-gray-200);
                    transition: all var(--transition-base);
                }

                .search-input-group:focus-within {
                    border-color: var(--color-accent);
                    background: white;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .search-input-group svg {
                    color: var(--color-gray-400);
                    flex-shrink: 0;
                }

                .search-input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    font-size: 0.875rem;
                    outline: none;
                }

                .search-input::placeholder {
                    color: var(--color-gray-400);
                }

                .filter-bar {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    padding: var(--space-md);
                }

                .filter-bar select {
                    max-width: 200px;
                }

                .clear-filter {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    background: none;
                    border: none;
                    color: var(--color-gray-500);
                    cursor: pointer;
                    font-size: 0.875rem;
                    padding: var(--space-xs) var(--space-sm);
                    border-radius: var(--radius-md);
                    transition: all var(--transition-base);
                }

                .clear-filter:hover {
                    color: var(--color-error);
                    background: rgba(239, 68, 68, 0.1);
                }

                .results-count {
                    margin-left: auto;
                    font-size: 0.875rem;
                    color: var(--color-gray-500);
                    font-weight: 500;
                }

                .loading-state,
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--space-3xl);
                    text-align: center;
                }

                .empty-icon {
                    color: var(--color-gray-300);
                    margin-bottom: var(--space-lg);
                }

                .ads-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: var(--space-lg);
                }

                .ad-card {
                    overflow: hidden;
                }

                .ad-image {
                    width: 100%;
                    height: 180px;
                    overflow: hidden;
                }

                .ad-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform var(--transition-base);
                }

                .ad-card:hover .ad-image img {
                    transform: scale(1.05);
                }

                .ad-content {
                    padding: var(--space-lg);
                }

                .ad-category {
                    display: inline-block;
                    font-size: 0.625rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--color-accent);
                    background: rgba(99, 102, 241, 0.1);
                    padding: var(--space-xs) var(--space-sm);
                    border-radius: var(--radius-full);
                    margin-bottom: var(--space-sm);
                }

                .ad-content h3 {
                    font-size: 1.125rem;
                    margin-bottom: var(--space-sm);
                }

                .ad-description {
                    font-size: 0.875rem;
                    color: var(--color-gray-600);
                    margin-bottom: var(--space-md);
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .ad-vendor {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin-bottom: var(--space-md);
                    color: var(--color-gray-700);
                    text-decoration: none;
                    padding: var(--space-sm);
                    border-radius: var(--radius-md);
                    background: var(--color-gray-50);
                    transition: all var(--transition-base);
                }

                .ad-vendor:hover {
                    background: var(--color-accent);
                    color: var(--color-primary);
                }

                .view-profile-hint {
                    margin-left: auto;
                    font-size: 0.75rem;
                    opacity: 0;
                    transition: opacity var(--transition-base);
                }

                .ad-vendor:hover .view-profile-hint {
                    opacity: 1;
                }

                .ad-meta {
                    display: flex;
                    gap: var(--space-md);
                    margin-bottom: var(--space-lg);
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                }

                .ad-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--space-sm);
                    margin-top: auto;
                }

                .ad-actions .btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-xs);
                    font-size: 0.8rem;
                    padding: var(--space-sm) var(--space-md);
                    white-space: nowrap;
                }

                .ad-actions .btn-ghost {
                    background: transparent;
                    border: 1px solid var(--color-gray-200);
                    color: var(--color-gray-700);
                }

                .ad-actions .btn-ghost:hover {
                    background: var(--color-gray-50);
                    border-color: var(--color-gray-300);
                }

                .ad-actions .btn-secondary {
                    background: var(--color-accent);
                    border: none;
                    color: var(--color-primary);
                }

                .ad-actions .btn-secondary:hover {
                    opacity: 0.9;
                }

                .ad-actions .btn-primary {
                    background: var(--color-primary);
                    border: none;
                    color: white;
                }

                .error-alert {
                    padding: var(--space-md);
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--color-error);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--space-lg);
                }

                @media (max-width: 768px) {
                    .search-inputs {
                        grid-template-columns: 1fr;
                    }

                    .ads-grid {
                        grid-template-columns: 1fr;
                    }

                    .filter-bar {
                        flex-wrap: wrap;
                    }

                    .filter-bar select {
                        max-width: 100%;
                        flex: 1;
                    }

                    .results-count {
                        width: 100%;
                        text-align: center;
                        margin-top: var(--space-sm);
                    }
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: var(--space-lg);
                }

                .modal-content {
                    background: white;
                    border-radius: var(--radius-xl);
                    width: 100%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow: auto;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--space-lg);
                    border-bottom: 1px solid var(--color-gray-200);
                }

                .modal-header h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0;
                }

                .modal-header .close-btn {
                    background: none;
                    border: none;
                    padding: var(--space-xs);
                    cursor: pointer;
                    color: var(--color-gray-500);
                    transition: color var(--transition-base);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-header .close-btn:hover {
                    color: var(--color-gray-900);
                }

                .modal-body {
                    padding: var(--space-lg);
                }

                .ad-preview {
                    background: var(--color-gray-50);
                    padding: var(--space-md);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--space-lg);
                }

                .ad-preview h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0 0 var(--space-xs) 0;
                }

                .ad-preview .vendor-name {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-size: 0.875rem;
                    color: var(--color-gray-600);
                    margin: 0;
                }

                .modal-body .form-group {
                    margin-bottom: var(--space-lg);
                }

                .modal-body label {
                    display: block;
                    font-weight: 500;
                    margin-bottom: var(--space-sm);
                    color: var(--color-gray-700);
                }

                .modal-body .textarea {
                    min-height: 120px;
                    resize: vertical;
                }

                .char-count {
                    display: block;
                    text-align: right;
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                    margin-top: var(--space-xs);
                }

                .modal-actions {
                    display: flex;
                    gap: var(--space-md);
                    justify-content: flex-end;
                    padding-top: var(--space-md);
                    border-top: 1px solid var(--color-gray-200);
                }

                .success-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: var(--space-xl);
                }

                .success-icon {
                    color: var(--color-success);
                    margin-bottom: var(--space-md);
                }

                .success-state h3 {
                    font-size: 1.25rem;
                    margin: 0 0 var(--space-sm) 0;
                    color: var(--color-gray-900);
                }

                .success-state p {
                    color: var(--color-gray-600);
                    margin: 0;
                }

                .alert {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    padding: var(--space-md);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--space-md);
                }

                .alert-error {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--color-error);
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
            `}</style>
        </div>
    );
};

export default BrowseAds;

