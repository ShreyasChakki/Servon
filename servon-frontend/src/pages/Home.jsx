import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ArrowRight,
    Briefcase,
    Users,
    MessageSquare,
    Shield,
    Star,
    TrendingUp
} from 'lucide-react';

const Home = () => {
    const { isAuthenticated, isVendor, isCustomer } = useAuth();

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <p className="hero-subtitle">We make services simple...</p>
                        <h1 className="hero-title">Experiences</h1>
                        <p className="hero-text">
                            Connect with trusted service providers or find clients for your business.
                            SERVON bridges the gap between customers and vendors.
                        </p>
                        <div className="hero-actions">
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/register" className="btn btn-primary btn-lg">
                                        Get Started <ArrowRight size={20} />
                                    </Link>
                                    <Link to="/login" className="btn btn-secondary btn-lg">
                                        Sign In
                                    </Link>
                                </>
                            ) : isCustomer ? (
                                <Link to="/customer/dashboard" className="btn btn-primary btn-lg">
                                    Post a Request <ArrowRight size={20} />
                                </Link>
                            ) : isVendor ? (
                                <Link to="/vendor/dashboard" className="btn btn-primary btn-lg">
                                    Browse Requests <ArrowRight size={20} />
                                </Link>
                            ) : null}
                        </div>
                    </div>
                    <div className="hero-illustration">
                        <div className="illustration-wrapper">
                            <svg viewBox="0 0 400 300" className="illustration-svg">
                                {/* Person reading newspaper */}
                                <g className="person-1">
                                    <circle cx="120" cy="80" r="20" fill="#000" />
                                    <rect x="90" y="105" width="60" height="80" rx="5" fill="#000" />
                                    <rect x="70" y="110" width="100" height="70" rx="3" fill="#fff" stroke="#000" strokeWidth="2" />
                                    <line x1="80" y1="130" x2="160" y2="130" stroke="#000" strokeWidth="1" />
                                    <line x1="80" y1="145" x2="150" y2="145" stroke="#000" strokeWidth="1" />
                                    <line x1="80" y1="160" x2="140" y2="160" stroke="#000" strokeWidth="1" />
                                </g>
                                {/* Person pointing */}
                                <g className="person-2">
                                    <circle cx="280" cy="75" r="18" fill="#000" />
                                    <ellipse cx="280" cy="170" rx="30" ry="60" fill="#000" />
                                    <line x1="280" y1="110" x2="320" y2="90" stroke="#000" strokeWidth="8" strokeLinecap="round" />
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Badge */}
            <section className="featured">
                <div className="container">
                    <p className="featured-text">Featured by <strong>FWA</strong></p>
                </div>
            </section>

            {/* Features Section */}
            <section className="features section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>How SERVON Works</h2>
                        <p className="text-muted">Simple, transparent, and efficient</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card card">
                            <div className="feature-icon">
                                <Briefcase size={32} />
                            </div>
                            <h3>Post Your Need</h3>
                            <p>Customers post service requirements with details and budget.</p>
                        </div>

                        <div className="feature-card card">
                            <div className="feature-icon">
                                <Users size={32} />
                            </div>
                            <h3>Get Quotations</h3>
                            <p>Verified vendors send competitive quotations for just ₹1 each.</p>
                        </div>

                        <div className="feature-card card">
                            <div className="feature-icon">
                                <MessageSquare size={32} />
                            </div>
                            <h3>Chat & Finalize</h3>
                            <p>Direct communication unlocks after quotation. Discuss and agree.</p>
                        </div>

                        <div className="feature-card card">
                            <div className="feature-icon">
                                <Shield size={32} />
                            </div>
                            <h3>Secure & Trusted</h3>
                            <p>All vendors are vetted. Transparent pricing, quality service.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <Star className="stat-icon" size={28} />
                            <span className="stat-number">10K+</span>
                            <span className="stat-label">Happy Customers</span>
                        </div>
                        <div className="stat-item">
                            <Users className="stat-icon" size={28} />
                            <span className="stat-number">2K+</span>
                            <span className="stat-label">Verified Vendors</span>
                        </div>
                        <div className="stat-item">
                            <Briefcase className="stat-icon" size={28} />
                            <span className="stat-number">50K+</span>
                            <span className="stat-label">Services Completed</span>
                        </div>
                        <div className="stat-item">
                            <TrendingUp className="stat-icon" size={28} />
                            <span className="stat-number">98%</span>
                            <span className="stat-label">Satisfaction Rate</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta section">
                <div className="container">
                    <div className="cta-card card card-dark">
                        <h2>Ready to get started?</h2>
                        <p>Join SERVON today and experience seamless service connections.</p>
                        <div className="cta-actions">
                            <Link to="/register?role=customer" className="btn btn-secondary">
                                I need a service
                            </Link>
                            <Link to="/register?role=vendor" className="btn btn-accent">
                                I'm a service provider
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
        .hero {
          padding: var(--space-3xl) 0;
          overflow: hidden;
        }

        .hero .container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3xl);
          align-items: center;
        }

        .hero-subtitle {
          font-size: 0.875rem;
          color: var(--color-gray-500);
          margin-bottom: var(--space-sm);
        }

        .hero-title {
          font-size: 5rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: var(--space-lg);
          line-height: 1;
        }

        .hero-text {
          font-size: 1.125rem;
          color: var(--color-gray-600);
          max-width: 450px;
          margin-bottom: var(--space-xl);
        }

        .hero-actions {
          display: flex;
          gap: var(--space-md);
        }

        .hero-illustration {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .illustration-wrapper {
          width: 100%;
          max-width: 400px;
        }

        .illustration-svg {
          width: 100%;
          height: auto;
        }

        .featured {
          padding: var(--space-xl) 0;
          border-top: 1px solid var(--color-gray-200);
        }

        .featured-text {
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .section-header {
          margin-bottom: var(--space-3xl);
        }

        .section-header h2 {
          margin-bottom: var(--space-sm);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-lg);
        }

        .feature-card {
          text-align: center;
          padding: var(--space-xl);
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-gray-100);
          border-radius: var(--radius-xl);
          margin: 0 auto var(--space-lg);
        }

        .feature-card h3 {
          margin-bottom: var(--space-sm);
          font-size: 1.125rem;
        }

        .feature-card p {
          font-size: 0.875rem;
          color: var(--color-gray-600);
        }

        .stats {
          background-color: var(--color-gray-50);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-xl);
        }

        .stat-item {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
        }

        .stat-icon {
          color: var(--color-accent);
        }

        .stat-number {
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 700;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--color-gray-500);
        }

        .cta-card {
          text-align: center;
          padding: var(--space-3xl);
        }

        .cta-card h2 {
          margin-bottom: var(--space-md);
        }

        .cta-card p {
          color: var(--color-gray-400);
          margin-bottom: var(--space-xl);
        }

        .cta-actions {
          display: flex;
          gap: var(--space-md);
          justify-content: center;
        }

        @media (max-width: 768px) {
          .hero .container {
            grid-template-columns: 1fr;
          }

          .hero-title {
            font-size: 3rem;
          }

          .hero-illustration {
            order: -1;
          }

          .features-grid,
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .cta-actions {
            flex-direction: column;
          }
        }
      `}</style>
        </div>
    );
};

export default Home;
