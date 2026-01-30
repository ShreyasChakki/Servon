import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerService } from '../services/authService';
import {
    UserPlus,
    Mail,
    Lock,
    User,
    Phone,
    MapPin,
    Briefcase,
    Eye,
    EyeOff,
    AlertCircle,
    Check
} from 'lucide-react';

const SERVICE_CATEGORIES = [
    'plumbing',
    'electrical',
    'carpentry',
    'painting',
    'cleaning',
    'pest-control',
    'appliance-repair',
    'home-renovation',
    'gardening',
    'moving-packing',
    'ac-repair',
    'interior-design',
    'security',
    'other'
];

const Register = () => {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: searchParams.get('role') || 'customer',
        phone: '',
        location: '',
        businessName: '',
        businessCategory: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (formData.role === 'vendor' && !formData.businessName) {
            setError('Business name is required for vendors');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const { confirmPassword, ...submitData } = formData;
            const response = await registerService(submitData);

            if (response.success) {
                login(response.data, response.data.token);

                // Redirect based on role
                if (response.data.role === 'vendor') {
                    navigate('/vendor/dashboard');
                } else {
                    navigate('/customer/dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container auth-container-wide">
                <div className="auth-card card card-elevated">
                    <div className="auth-header">
                        <div className="auth-icon">
                            <UserPlus size={28} />
                        </div>
                        <h1>Create Account</h1>
                        <p className="text-muted">Join SERVON and start today</p>
                    </div>

                    {/* Role Toggle */}
                    <div className="role-toggle">
                        <button
                            type="button"
                            className={`role-btn ${formData.role === 'customer' ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, role: 'customer' }))}
                        >
                            <User size={18} />
                            <span>I need services</span>
                        </button>
                        <button
                            type="button"
                            className={`role-btn ${formData.role === 'vendor' ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, role: 'vendor' }))}
                        >
                            <Briefcase size={18} />
                            <span>I provide services</span>
                        </button>
                    </div>

                    {error && (
                        <div className="error-alert">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-grid">
                            <div className="input-group">
                                <label htmlFor="name">Full Name</label>
                                <div className="input-with-icon">
                                    <User className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="input"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="email">Email Address</label>
                                <div className="input-with-icon">
                                    <Mail className="input-icon" size={18} />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="input"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="password">Password</label>
                                <div className="input-with-icon">
                                    <Lock className="input-icon" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        className="input"
                                        placeholder="Create password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="input-with-icon">
                                    <Lock className="input-icon" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        className="input"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                        <Check className="password-match" size={18} />
                                    )}
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

                            {/* Vendor-specific fields */}
                            {formData.role === 'vendor' && (
                                <div className="form-section">
                                    <div className="form-section-title">
                                        <Briefcase size={16} />
                                        <span>Business Information</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                        <div className="input-group">
                                            <label htmlFor="businessName">Business Name *</label>
                                            <div className="input-with-icon">
                                                <Briefcase className="input-icon" size={18} />
                                                <input
                                                    type="text"
                                                    id="businessName"
                                                    name="businessName"
                                                    className="input"
                                                    placeholder="Your business name"
                                                    value={formData.businessName}
                                                    onChange={handleChange}
                                                    required
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
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loader"></span>
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    <span>Create Account</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login" className="auth-link">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
        .auth-page {
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-xl);
          background: linear-gradient(135deg, var(--color-gray-50) 0%, var(--color-secondary) 100%);
        }

        .auth-container-wide {
          max-width: 480px;
          width: 100%;
        }

        .auth-card {
          padding: var(--space-2xl);
        }

        .auth-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        .auth-icon {
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

        .auth-header h1 {
          font-size: 1.75rem;
          margin-bottom: var(--space-xs);
        }

        .role-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-sm);
          margin-bottom: var(--space-xl);
          padding: 4px;
          background-color: var(--color-gray-100);
          border-radius: var(--radius-lg);
        }

        .role-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background-color: transparent;
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-gray-600);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .role-btn:hover {
          color: var(--color-primary);
        }

        .role-btn.active {
          background-color: var(--color-secondary);
          color: var(--color-primary);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .form-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .form-section {
          padding: var(--space-lg);
          background-color: var(--color-gray-50);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-gray-200);
          animation: slideIn 0.3s ease-out;
        }

        .form-section-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-gray-700);
          margin-bottom: var(--space-md);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .input-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-gray-700);
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
        }

        .input-with-icon .input {
          padding-left: 2.75rem;
          padding-right: 2.75rem;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-gray-400);
          padding: 0;
          transition: color var(--transition-base);
        }

        .password-toggle:hover {
          color: var(--color-primary);
        }

        .password-match {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-success);
          pointer-events: none;
        }

        .auth-footer {
          margin-top: var(--space-xl);
          text-align: center;
          padding-top: var(--space-lg);
          border-top: 1px solid var(--color-gray-200);
        }

        .auth-footer p {
          font-size: 0.875rem;
          color: var(--color-gray-600);
        }

        .auth-link {
          color: var(--color-accent);
          font-weight: 600;
          transition: color var(--transition-base);
        }

        .auth-link:hover {
          color: var(--color-primary);
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .auth-page {
            padding: var(--space-md);
          }

          .auth-card {
            padding: var(--space-xl);
          }

          .role-toggle {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default Register;
