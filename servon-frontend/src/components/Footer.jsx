import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">SERVON</Link>
                        <p className="footer-tagline">
                            Connecting customers with trusted service providers
                        </p>
                    </div>

                    <div className="footer-links">
                        <div className="footer-section">
                            <h4>For Customers</h4>
                            <Link to="/customer/dashboard">Post a Request</Link>
                            <Link to="/">Browse Services</Link>
                            <Link to="/">How It Works</Link>
                        </div>

                        <div className="footer-section">
                            <h4>For Vendors</h4>
                            <Link to="/vendor/dashboard">Browse Requests</Link>
                            <Link to="/vendor/advertise">Advertise</Link>
                            <Link to="/vendor/network">Vendor Network</Link>
                        </div>

                        <div className="footer-section">
                            <h4>Company</h4>
                            <Link to="/">About Us</Link>
                            <Link to="/">Contact</Link>
                            <Link to="/">Privacy Policy</Link>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} SERVON. All rights reserved.</p>
                </div>
            </div>

            <style>{`
        .footer {
          background-color: var(--color-primary);
          color: var(--color-secondary);
          padding: var(--space-3xl) 0 var(--space-lg);
        }

        .footer-content {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: var(--space-3xl);
          padding-bottom: var(--space-2xl);
          border-bottom: 1px solid var(--color-gray-800);
        }

        .footer-logo {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-secondary);
          letter-spacing: -0.05em;
        }

        .footer-tagline {
          margin-top: var(--space-sm);
          color: var(--color-gray-400);
          font-size: 0.875rem;
          max-width: 250px;
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-xl);
        }

        .footer-section h4 {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: var(--space-md);
          color: var(--color-secondary);
        }

        .footer-section a {
          display: block;
          font-size: 0.875rem;
          color: var(--color-gray-400);
          margin-bottom: var(--space-sm);
          transition: color var(--transition-base);
        }

        .footer-section a:hover {
          color: var(--color-secondary);
        }

        .footer-bottom {
          padding-top: var(--space-lg);
          text-align: center;
        }

        .footer-bottom p {
          font-size: 0.75rem;
          color: var(--color-gray-500);
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: var(--space-xl);
          }

          .footer-links {
            grid-template-columns: 1fr;
            gap: var(--space-lg);
          }
        }
      `}</style>
        </footer>
    );
};

export default Footer;
