import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Save,
    AlertCircle,
    CheckCircle,
    Camera
} from 'lucide-react';

const SERVICE_CATEGORIES = [
    'plumbing', 'electrical', 'carpentry', 'painting', 'cleaning',
    'pest-control', 'appliance-repair', 'home-renovation', 'gardening',
    'moving-packing', 'ac-repair', 'interior-design', 'security', 'other'
];

const Profile = () => {
    const { user, updateUser, isVendor } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        location: user?.location || '',
        businessName: user?.businessName || '',
        businessCategory: user?.businessCategory || '',
        avatar: user?.avatar || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await updateProfile(formData);
            if (response.success) {
                updateUser(response.data);
                setSuccess('Profile updated successfully!');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="container container-sm">
                <div className="profile-card card card-elevated">
                    <div className="profile-header">
                        <div className="avatar-container">
                            <div className="avatar">
                                {(user?.avatar || formData.avatar) ? (
                                    <img
                                        src={user?.avatar || formData.avatar}
                                        alt={user?.name}
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                ) : (
                                    <User size={40} />
                                )}
                            </div>
                            <div className="avatar-badge">
                                <Camera size={12} />
                            </div>
                        </div>
                        <div>
                            <h1>{user?.name}</h1>
                            <span className={`role-badge ${user?.role}`}>{user?.role}</span>
                        </div>
                    </div>

                    <div className="profile-info">
                        <div className="info-item">
                            <Mail size={18} />
                            <span>{user?.email}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <CheckCircle size={18} />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="input-group">
                            <label htmlFor="avatar">Profile Picture URL</label>
                            <div className="input-with-icon">
                                <Camera className="input-icon" size={18} />
                                <input
                                    type="url"
                                    id="avatar"
                                    name="avatar"
                                    className="input"
                                    placeholder="https://example.com/your-photo.jpg"
                                    value={formData.avatar}
                                    onChange={handleChange}
                                />
                            </div>
                            <span className="helper-text">Paste a URL to your profile photo</span>
                        </div>

                        <div className="input-group">
                            <label htmlFor="name">Full Name</label>
                            <div className="input-with-icon">
                                <User className="input-icon" size={18} />
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="phone">Phone Number</label>
                            <div className="input-with-icon">
                                <Phone className="input-icon" size={18} />
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className="input"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="location">Location</label>
                            <div className="input-with-icon">
                                <MapPin className="input-icon" size={18} />
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    className="input"
                                    placeholder="City or area"
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {isVendor && (
                            <>
                                <div className="input-group">
                                    <label htmlFor="businessName">Business Name</label>
                                    <div className="input-with-icon">
                                        <Briefcase className="input-icon" size={18} />
                                        <input
                                            type="text"
                                            id="businessName"
                                            name="businessName"
                                            className="input"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="businessCategory">Service Category</label>
                                    <select
                                        id="businessCategory"
                                        name="businessCategory"
                                        className="input"
                                        value={formData.businessCategory}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a category</option>
                                        {SERVICE_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loader"></span>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
        .profile-page {
          padding: var(--space-xl) 0;
        }

        .profile-card {
          padding: var(--space-2xl);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          margin-bottom: var(--space-xl);
          padding-bottom: var(--space-xl);
          border-bottom: 1px solid var(--color-gray-200);
        }

        .avatar-container {
          position: relative;
        }

        .avatar {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-gray-100);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-badge {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 24px;
          height: 24px;
          background: var(--color-accent);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border: 2px solid white;
        }

        .helper-text {
          font-size: 0.75rem;
          color: var(--color-gray-500);
          margin-top: var(--space-xs);
        }

        .profile-header h1 {
          font-size: 1.75rem;
          margin-bottom: var(--space-xs);
        }

        .role-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }

        .role-badge.vendor {
          background-color: var(--color-accent);
          color: white;
        }

        .role-badge.customer {
          background-color: var(--color-primary);
          color: white;
        }

        .profile-info {
          margin-bottom: var(--space-xl);
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--color-gray-600);
          font-size: 0.875rem;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          margin-bottom: var(--space-lg);
        }

        .alert-error {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--color-error);
        }

        .alert-success {
          background-color: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: var(--color-success);
        }

        .profile-form {
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
      `}</style>
        </div>
    );
};

export default Profile;
