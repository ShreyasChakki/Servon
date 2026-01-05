import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginService } from '../services/authService';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

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
            const response = await loginService(formData);

            if (response.success) {
                login(response.data, response.data.token);

                // Redirect based on role
                if (response.data.role === 'vendor') {
                    navigate('/vendor/dashboard');
                } else if (response.data.role === 'customer') {
                    navigate('/customer/dashboard');
                } else if (response.data.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate(from);
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card card card-elevated">
                    <div className="auth-header">
                        <div className="auth-icon">
                            <LogIn size={28} />
                        </div>
                        <h1>Welcome Back</h1>
                        <p className="text-muted">Sign in to continue to SERVON</p>
                    </div>

                    {error && (
                        <div className="error-alert">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
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
                                    placeholder="Enter your password"
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

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loader"></span>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Don't have an account?{' '}
                            <Link to="/register" className="auth-link">Create one</Link>
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

        .auth-container {
          width: 100%;
          max-width: 420px;
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
        }

        .password-toggle:hover {
          color: var(--color-primary);
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
        }

        .auth-link:hover {
          text-decoration: underline;
        }
      `}</style>
        </div>
    );
};

export default Login;
