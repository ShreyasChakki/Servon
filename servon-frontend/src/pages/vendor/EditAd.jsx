import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAdvertisement, updateAdvertisement } from '../../services/advertisementService';
import {
    Megaphone,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Save
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

const EditAd = () => {
    const { adId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        serviceArea: '',
        contactPhone: '',
        image: '',
        status: 'active'
    });

    useEffect(() => {
        fetchAd();
    }, [adId]);

    const fetchAd = async () => {
        try {
            const response = await getAdvertisement(adId);
            if (response.success) {
                const ad = response.data;
                setFormData({
                    title: ad.title || '',
                    description: ad.description || '',
                    serviceArea: ad.serviceArea || '',
                    contactPhone: ad.contactPhone || '',
                    image: ad.image || '',
                    status: ad.status || 'active'
                });
            }
        } catch (err) {
            setError('Failed to load advertisement');
            console.error(err);
        } finally {
            setLoading(false);
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
        setSaving(true);
        setError('');

        try {
            const response = await updateAdvertisement(adId, formData);
            if (response.success) {
                setSuccess(true);
                setTimeout(() => navigate('/vendor/my-ads'), 1500);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update advertisement');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="edit-ad-page">
                <div className="container container-sm">
                    <div className="loading-state card">
                        <div className="loader"></div>
                        <p>Loading advertisement...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-ad-page">
            <div className="container container-sm">
                <div className="page-header">
                    <Link to="/vendor/my-ads" className="back-link">
                        <ArrowLeft size={20} />
                        Back to My Ads
                    </Link>
                    <h1>
                        <Megaphone size={28} />
                        Edit Advertisement
                    </h1>
                </div>

                {error && (
                    <div className="error-alert">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-alert">
                        <CheckCircle size={18} />
                        Advertisement updated successfully! Redirecting...
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
                            value={formData.title}
                            onChange={handleChange}
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            className="input"
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
                                value={formData.contactPhone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="image">Banner Image URL</label>
                        <input
                            type="url"
                            id="image"
                            name="image"
                            className="input"
                            placeholder="https://example.com/your-banner.jpg"
                            value={formData.image}
                            onChange={handleChange}
                        />
                        {formData.image && (
                            <div className="image-preview">
                                <img src={formData.image} alt="Banner preview" onError={(e) => e.target.style.display = 'none'} />
                            </div>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            className="input"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <span className="loader-sm"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>

            <style>{`
                .edit-ad-page {
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
                }

                .error-alert,
                .success-alert {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    padding: var(--space-md);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--space-lg);
                }

                .error-alert {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--color-error);
                }

                .success-alert {
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--color-success);
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

                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: var(--space-3xl);
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

                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default EditAd;
