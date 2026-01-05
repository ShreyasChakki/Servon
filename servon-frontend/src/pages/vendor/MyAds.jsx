import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyAdvertisements, updateAdvertisement, deleteAdvertisement } from '../../services/advertisementService';
import {
    Megaphone,
    Plus,
    Eye,
    MousePointer,
    Play,
    Pause,
    Trash2,
    IndianRupee,
    Calendar,
    Clock,
    Edit3
} from 'lucide-react';

const MyAds = () => {
    const [advertisements, setAdvertisements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyAds();
    }, []);

    const fetchMyAds = async () => {
        try {
            const response = await getMyAdvertisements();
            if (response.success) {
                setAdvertisements(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch ads:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (ad) => {
        const newStatus = ad.status === 'active' ? 'paused' : 'active';
        try {
            await updateAdvertisement(ad._id, { status: newStatus });
            setAdvertisements(prev =>
                prev.map(a => a._id === ad._id ? { ...a, status: newStatus } : a)
            );
        } catch (err) {
            console.error('Failed to update ad:', err);
        }
    };

    const handleDelete = async (adId) => {
        if (!window.confirm('Are you sure you want to delete this advertisement?')) return;

        try {
            await deleteAdvertisement(adId);
            setAdvertisements(prev => prev.filter(a => a._id !== adId));
        } catch (err) {
            console.error('Failed to delete ad:', err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No expiry';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const isExpired = (endDate) => {
        if (!endDate) return false;
        return new Date(endDate) < new Date();
    };

    const getDaysLeft = (endDate) => {
        if (!endDate) return null;
        const now = new Date();
        const end = new Date(endDate);
        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const CATEGORY_LABELS = {
        'plumbing': 'Plumbing',
        'electrical': 'Electrical',
        'carpentry': 'Carpentry',
        'painting': 'Painting',
        'cleaning': 'Cleaning',
        'pest-control': 'Pest Control',
        'appliance-repair': 'Appliance Repair',
        'home-renovation': 'Home Renovation',
        'gardening': 'Gardening',
        'moving-packing': 'Moving & Packing',
        'ac-repair': 'AC Repair',
        'interior-design': 'Interior Design',
        'security': 'Security',
        'other': 'Other'
    };

    return (
        <div className="my-ads-page">
            <div className="container">
                <div className="page-header">
                    <div>
                        <h1>
                            <Megaphone size={28} />
                            My Advertisements
                        </h1>
                        <p className="text-muted">Manage your service advertisements</p>
                    </div>
                    <Link to="/vendor/create-ad" className="btn btn-primary">
                        <Plus size={18} />
                        Create New Ad
                    </Link>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="loader"></div>
                        <p>Loading advertisements...</p>
                    </div>
                ) : advertisements.length === 0 ? (
                    <div className="empty-state card">
                        <Megaphone size={48} className="empty-icon" />
                        <h3>No advertisements yet</h3>
                        <p>Create your first ad to promote your services</p>
                        <Link to="/vendor/create-ad" className="btn btn-primary">
                            <Plus size={18} />
                            Create Advertisement
                        </Link>
                    </div>
                ) : (
                    <div className="ads-list">
                        {advertisements.map(ad => (
                            <div key={ad._id} className="ad-card card">
                                {ad.image && (
                                    <div className="ad-image">
                                        <img src={ad.image} alt={ad.title} />
                                    </div>
                                )}
                                <div className="ad-body">
                                    <div className="ad-header">
                                        <div>
                                            <h3>{ad.title}</h3>
                                            <span className="ad-category">
                                                {CATEGORY_LABELS[ad.category] || ad.category}
                                            </span>
                                        </div>
                                        <span className={`badge badge-${ad.status === 'active' ? 'success' : 'warning'}`}>
                                            {ad.status}
                                        </span>
                                    </div>

                                    <p className="ad-description">{ad.description}</p>

                                    <div className="ad-stats">
                                        <div className="stat">
                                            <Eye size={16} />
                                            <span>{ad.views} views</span>
                                        </div>
                                        <div className="stat">
                                            <MousePointer size={16} />
                                            <span>{ad.clicks} clicks</span>
                                        </div>
                                        <div className="stat">
                                            <IndianRupee size={16} />
                                            <span>₹{ad.budget} budget</span>
                                        </div>
                                        <div className="stat">
                                            <Calendar size={16} />
                                            <span>Created: {formatDate(ad.createdAt)}</span>
                                        </div>
                                        <div className={`stat ${isExpired(ad.endDate) ? 'expired' : ''}`}>
                                            <Clock size={16} />
                                            <span>
                                                {isExpired(ad.endDate)
                                                    ? 'Expired'
                                                    : ad.endDate
                                                        ? `${getDaysLeft(ad.endDate)} days left`
                                                        : 'No expiry'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="ad-actions">
                                    <button
                                        className={`btn btn-sm ${ad.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                                        onClick={() => handleToggleStatus(ad)}
                                    >
                                        {ad.status === 'active' ? (
                                            <>
                                                <Pause size={14} />
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <Play size={14} />
                                                Resume
                                            </>
                                        )}
                                    </button>
                                    <Link to={`/vendor/edit-ad/${ad._id}`} className="btn btn-sm btn-ghost">
                                        <Edit3 size={14} />
                                        Edit
                                    </Link>
                                    <button
                                        className="btn btn-sm btn-ghost"
                                        onClick={() => handleDelete(ad._id)}
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .my-ads-page {
                    padding: var(--space-xl) 0;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--space-xl);
                    flex-wrap: wrap;
                    gap: var(--space-lg);
                }

                .page-header h1 {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    font-size: 1.75rem;
                    margin-bottom: var(--space-xs);
                }

                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: var(--space-3xl);
                    gap: var(--space-md);
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

                .ads-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-md);
                }

                .ad-card {
                    display: flex;
                    flex-direction: row;
                    overflow: hidden;
                    padding: 0;
                }

                .ad-image {
                    width: 200px;
                    min-width: 200px;
                    height: auto;
                    min-height: 150px;
                    flex-shrink: 0;
                }

                .ad-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .ad-body {
                    flex: 1;
                    padding: var(--space-xl);
                }

                .ad-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--space-md);
                }

                .ad-header h3 {
                    font-size: 1.125rem;
                    margin-bottom: var(--space-xs);
                }

                .ad-category {
                    font-size: 0.75rem;
                    color: var(--color-accent);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .ad-description {
                    color: var(--color-gray-600);
                    font-size: 0.875rem;
                    margin-bottom: var(--space-md);
                }

                .ad-stats {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--space-lg);
                    margin-bottom: var(--space-md);
                }

                .stat {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-size: 0.875rem;
                    color: var(--color-gray-600);
                }

                .stat.expired {
                    color: var(--color-error);
                    font-weight: 600;
                }

                .ad-actions {
                    display: flex;
                    gap: var(--space-sm);
                }

                .btn-warning {
                    background: var(--color-warning);
                    color: white;
                }

                .btn-success {
                    background: var(--color-success);
                    color: white;
                }

                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                    }
                    
                    .ad-card {
                        flex-direction: column;
                    }
                    
                    .ad-image {
                        width: 100%;
                        min-width: 100%;
                        height: 150px;
                    }
                }
            `}</style>
        </div>
    );
};

export default MyAds;
