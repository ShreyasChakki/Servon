import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getVendorProfile, initiateVendorContact } from '../services/vendorProfileService';
import { useAuth } from '../context/AuthContext';
import {
    Store,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Megaphone,
    MessageCircle,
    Eye,
    MousePointer,
    ArrowLeft,
    Tag
} from 'lucide-react';

const VendorProfile = () => {
    const { vendorId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [vendor, setVendor] = useState(null);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contacting, setContacting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchVendorProfile();
    }, [vendorId]);

    const fetchVendorProfile = async () => {
        try {
            const response = await getVendorProfile(vendorId);
            if (response.success) {
                setVendor(response.data.vendor);
                setAds(response.data.advertisements);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load vendor profile');
        } finally {
            setLoading(false);
        }
    };

    const handleContact = async () => {
        if (user?.role !== 'customer') {
            setError('Only customers can contact vendors');
            return;
        }

        setContacting(true);
        try {
            const response = await initiateVendorContact(vendorId, {
                message: `Hi, I saw your profile and I'm interested in your services.`
            });

            if (response.success) {
                navigate(`/chat/${response.data.conversationId}`);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to initiate contact');
        } finally {
            setContacting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="loading-page">
                <div className="loader"></div>
                <p>Loading vendor profile...</p>
            </div>
        );
    }

    if (error && !vendor) {
        return (
            <div className="error-page">
                <h2>Error</h2>
                <p>{error}</p>
                <Link to="/browse-ads" className="btn btn-primary">Back to Ads</Link>
            </div>
        );
    }

    return (
        <div className="vendor-profile-page">
            <div className="container">
                {/* Back Button */}
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    Back
                </button>

                {/* Vendor Header */}
                <div className="vendor-header card">
                    <div className="vendor-avatar">
                        <Store size={48} />
                    </div>
                    <div className="vendor-info">
                        <h1>{vendor?.businessName || vendor?.name}</h1>
                        {vendor?.businessName && (
                            <p className="vendor-owner">by {vendor?.name}</p>
                        )}
                        <div className="vendor-meta">
                            <span className="meta-item">
                                <MapPin size={16} />
                                {vendor?.location || 'Location not specified'}
                            </span>
                            <span className="meta-item">
                                <Calendar size={16} />
                                Member since {formatDate(vendor?.memberSince)}
                            </span>
                        </div>
                    </div>

                    {/* Contact Button - Only for customers */}
                    {user?.role === 'customer' && (
                        <button
                            className="btn btn-primary contact-btn"
                            onClick={handleContact}
                            disabled={contacting}
                        >
                            <MessageCircle size={20} />
                            {contacting ? 'Connecting...' : 'Contact Vendor'}
                        </button>
                    )}
                </div>

                {/* Contact Info */}
                <div className="contact-section card">
                    <h2>Contact Information</h2>
                    <div className="contact-grid">
                        <div className="contact-item">
                            <Phone size={20} />
                            <div>
                                <span className="label">Phone</span>
                                <span className="value">{vendor?.phone}</span>
                            </div>
                        </div>
                        <div className="contact-item">
                            <Mail size={20} />
                            <div>
                                <span className="label">Email</span>
                                <span className="value">{vendor?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services */}
                {vendor?.services?.length > 0 && (
                    <div className="services-section card">
                        <h2>Services Offered</h2>
                        <div className="services-list">
                            {vendor.services.map((service, index) => (
                                <span key={index} className="service-tag">
                                    <Tag size={14} />
                                    {service}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Advertisements */}
                <div className="ads-section">
                    <h2>
                        <Megaphone size={24} />
                        Advertisements ({ads.length})
                    </h2>

                    {ads.length === 0 ? (
                        <div className="empty-ads card">
                            <p>No active advertisements from this vendor</p>
                        </div>
                    ) : (
                        <div className="ads-grid">
                            {ads.map(ad => (
                                <div key={ad._id} className="ad-card card">
                                    {ad.image && (
                                        <div className="ad-image">
                                            <img
                                                src={ad.image}
                                                alt={ad.title}
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        </div>
                                    )}
                                    <div className="ad-content">
                                        <h3>{ad.title}</h3>
                                        <p className="ad-description">{ad.description}</p>
                                        <div className="ad-meta">
                                            <span className="category-badge">{ad.category}</span>
                                            <span className="location">
                                                <MapPin size={12} />
                                                {ad.serviceArea}
                                            </span>
                                        </div>
                                        <div className="ad-stats">
                                            <span><Eye size={14} /> {ad.views || 0} views</span>
                                            <span><MousePointer size={14} /> {ad.clicks || 0} clicks</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="error-toast">
                        {error}
                    </div>
                )}
            </div>

            <style>{`
                .vendor-profile-page {
                    padding: var(--space-xl) 0;
                    min-height: 100vh;
                    background: var(--color-gray-50);
                }

                .loading-page, .error-page {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 60vh;
                    gap: var(--space-md);
                }

                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    background: none;
                    border: none;
                    color: var(--color-gray-600);
                    cursor: pointer;
                    margin-bottom: var(--space-lg);
                    font-size: 0.875rem;
                }

                .back-btn:hover {
                    color: var(--color-primary);
                }

                .vendor-header {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xl);
                    padding: var(--space-2xl);
                    margin-bottom: var(--space-lg);
                    background: linear-gradient(135deg, var(--color-primary) 0%, #2563eb 100%);
                    color: white;
                }

                .vendor-avatar {
                    width: 100px;
                    height: 100px;
                    background: rgba(255,255,255,0.2);
                    border-radius: var(--radius-xl);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .vendor-info {
                    flex: 1;
                }

                .vendor-info h1 {
                    font-size: 1.75rem;
                    margin-bottom: var(--space-xs);
                }

                .vendor-owner {
                    opacity: 0.8;
                    margin-bottom: var(--space-md);
                }

                .vendor-meta {
                    display: flex;
                    gap: var(--space-lg);
                    font-size: 0.875rem;
                    opacity: 0.9;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                }

                .contact-btn {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    padding: var(--space-md) var(--space-xl);
                    font-size: 1rem;
                    background: white;
                    color: var(--color-primary);
                }

                .contact-btn:hover {
                    background: var(--color-gray-100);
                }

                .contact-section, .services-section {
                    padding: var(--space-xl);
                    margin-bottom: var(--space-lg);
                }

                .contact-section h2, .services-section h2 {
                    font-size: 1.125rem;
                    margin-bottom: var(--space-lg);
                }

                .contact-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--space-lg);
                }

                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    color: var(--color-gray-600);
                }

                .contact-item .label {
                    display: block;
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                }

                .contact-item .value {
                    font-weight: 500;
                    color: var(--color-primary);
                }

                .services-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--space-sm);
                }

                .service-tag {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    padding: var(--space-sm) var(--space-md);
                    background: var(--color-gray-100);
                    border-radius: var(--radius-full);
                    font-size: 0.875rem;
                    color: var(--color-gray-700);
                }

                .ads-section {
                    margin-top: var(--space-xl);
                }

                .ads-section h2 {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    font-size: 1.25rem;
                    margin-bottom: var(--space-lg);
                }

                .empty-ads {
                    padding: var(--space-3xl);
                    text-align: center;
                    color: var(--color-gray-500);
                }

                .ads-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: var(--space-lg);
                }

                .ad-card {
                    overflow: hidden;
                }

                .ad-image {
                    height: 180px;
                    overflow: hidden;
                }

                .ad-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .ad-content {
                    padding: var(--space-lg);
                }

                .ad-content h3 {
                    font-size: 1rem;
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

                .ad-meta {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    margin-bottom: var(--space-md);
                }

                .category-badge {
                    padding: 2px 8px;
                    background: var(--color-accent);
                    color: var(--color-primary);
                    border-radius: var(--radius-sm);
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .location {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                }

                .ad-stats {
                    display: flex;
                    gap: var(--space-lg);
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                }

                .ad-stats span {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .error-toast {
                    position: fixed;
                    bottom: var(--space-xl);
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--color-error);
                    color: white;
                    padding: var(--space-md) var(--space-xl);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                }

                @media (max-width: 768px) {
                    .vendor-header {
                        flex-direction: column;
                        text-align: center;
                    }

                    .vendor-meta {
                        flex-direction: column;
                        gap: var(--space-sm);
                    }

                    .contact-grid {
                        grid-template-columns: 1fr;
                    }

                    .ads-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default VendorProfile;
