import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createServiceRequest } from '../../services/serviceRequestService';
import {
    FileText,
    MapPin,
    IndianRupee,
    Clock,
    AlertCircle,
    CheckCircle,
    ArrowLeft
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

const URGENCY_LEVELS = [
    { value: 'low', label: 'Low - Flexible timeline', color: 'success' },
    { value: 'medium', label: 'Medium - Within a week', color: 'warning' },
    { value: 'high', label: 'High - Within 2-3 days', color: 'error' },
    { value: 'urgent', label: 'Urgent - ASAP', color: 'error' }
];

const PostRequest = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        location: '',
        budget: '',
        urgency: 'medium'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await createServiceRequest({
                ...formData,
                budget: formData.budget ? Number(formData.budget) : undefined
            });

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/customer/dashboard');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="success-page">
                <div className="success-card card card-elevated">
                    <CheckCircle size={64} className="success-icon" />
                    <h2>Request Posted!</h2>
                    <p>Your service request has been created. Vendors will start sending quotations soon.</p>
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
            max-width: 400px;
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
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="post-request-page">
            <div className="container container-sm">
                <button
                    className="back-btn btn btn-ghost"
                    onClick={() => navigate('/customer/dashboard')}
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>

                <div className="form-card card card-elevated">
                    <div className="form-header">
                        <div className="form-icon">
                            <FileText size={28} />
                        </div>
                        <h1>Post Service Request</h1>
                        <p className="text-muted">Describe what you need and get quotations from vendors</p>
                    </div>

                    {error && (
                        <div className="error-alert">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="request-form">
                        <div className="input-group">
                            <label htmlFor="title">Request Title *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className="input"
                                placeholder="e.g., Fix leaking kitchen tap"
                                value={formData.title}
                                onChange={handleChange}
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
                                <option value="">Select a category</option>
                                {SERVICE_CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label htmlFor="description">Description *</label>
                            <textarea
                                id="description"
                                name="description"
                                className="input"
                                placeholder="Describe your requirement in detail..."
                                rows={5}
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="input-group">
                                <label htmlFor="location">Location *</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    className="input"
                                    placeholder="Area or city"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="budget">Budget (₹)</label>
                                <input
                                    type="number"
                                    id="budget"
                                    name="budget"
                                    className="input"
                                    placeholder="Optional"
                                    min="0"
                                    value={formData.budget}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Urgency Level</label>
                            <div className="urgency-options">
                                {URGENCY_LEVELS.map(level => (
                                    <label
                                        key={level.value}
                                        className={`urgency-option ${formData.urgency === level.value ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="urgency"
                                            value={level.value}
                                            checked={formData.urgency === level.value}
                                            onChange={handleChange}
                                        />
                                        <Clock size={16} />
                                        <span>{level.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loader"></span>
                                    <span>Posting...</span>
                                </>
                            ) : (
                                <>
                                    <FileText size={18} />
                                    <span>Post Request</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
        .post-request-page {
          padding: var(--space-xl) 0;
        }

        .back-btn {
          margin-bottom: var(--space-lg);
        }

        .form-card {
          padding: var(--space-2xl);
        }

        .form-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        .form-icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-primary);
          color: var(--color-secondary);
          border-radius: var(--radius-xl);
          margin: 0 auto var(--space-lg);
        }

        .form-header h1 {
          font-size: 1.75rem;
          margin-bottom: var(--space-xs);
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-md);
          color: var(--color-error);
          font-size: 0.875rem;
          margin-bottom: var(--space-lg);
        }

        .request-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
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
          pointer-events: none;
          z-index: 1;
        }

        .input-with-icon .input {
          padding-left: 2.75rem;
          position: relative;
        }

        .urgency-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-sm);
        }

        .urgency-option {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          border: 2px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
          font-size: 0.875rem;
        }

        .urgency-option input {
          display: none;
        }

        .urgency-option:hover {
          border-color: var(--color-gray-400);
        }

        .urgency-option.selected {
          border-color: var(--color-primary);
          background-color: var(--color-gray-50);
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .urgency-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default PostRequest;
