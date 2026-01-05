import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  LogIn,
  UserPlus,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  MessageSquare,
  Megaphone
} from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isVendor, isCustomer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getDashboardLink = () => {
    if (isVendor) return '/vendor/dashboard';
    if (isCustomer) return '/customer/dashboard';
    if (isAdmin) return '/admin/dashboard';
    return '/';
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="logo">
            <span className="logo-text">SERVON</span>
          </Link>

          {/* Desktop Menu */}
          <div className="nav-links hide-mobile">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link
              to="/browse-ads"
              className={`nav-link ${isActive('/browse-ads') ? 'active' : ''}`}
            >
              <Megaphone size={18} />
              <span>Ads</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className={`nav-link ${location.pathname.includes('dashboard') ? 'active' : ''}`}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/conversations"
                  className={`nav-link ${location.pathname.includes('conversation') || location.pathname.includes('chat') ? 'active' : ''}`}
                >
                  <MessageSquare size={18} />
                  <span>Chats</span>
                </Link>
                <Link
                  to="/profile"
                  className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>
                <button onClick={handleLogout} className="nav-link logout-btn">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <UserPlus size={16} />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>

          {/* User Badge (Desktop) */}
          {isAuthenticated && (
            <div className="user-badge hide-mobile">
              <span className="user-name">{user?.name}</span>
              <span className={`role-badge ${user?.role}`}>{user?.role}</span>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle hide-desktop"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <Link
              to="/"
              className={`mobile-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/conversations"
                  className="mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare size={18} />
                  <span>Chats</span>
                </Link>
                <Link
                  to="/profile"
                  className="mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="mobile-link">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus size={18} />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        .navbar {
          background-color: var(--color-secondary);
          border-bottom: 1px solid var(--color-gray-200);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .logo-text {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.05em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-sm) var(--space-md);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-gray-600);
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
          background: none;
          border: none;
          cursor: pointer;
        }

        .nav-link:hover, .nav-link.active {
          color: var(--color-primary);
          background-color: var(--color-gray-100);
        }

        .logout-btn:hover {
          color: var(--color-error);
          background-color: rgba(239, 68, 68, 0.1);
        }

        .user-badge {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background-color: var(--color-gray-100);
          border-radius: var(--radius-full);
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .role-badge {
          font-size: 0.625rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .role-badge.vendor {
          background-color: var(--color-accent);
          color: white;
        }

        .role-badge.customer {
          background-color: var(--color-primary);
          color: white;
        }

        .role-badge.admin {
          background-color: var(--color-error);
          color: white;
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-sm);
        }

        .mobile-menu {
          display: none;
          flex-direction: column;
          padding: var(--space-md) 0;
          border-top: 1px solid var(--color-gray-200);
        }

        .mobile-link {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          font-size: 1rem;
          color: var(--color-gray-700);
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }

        .mobile-link:hover, .mobile-link.active {
          background-color: var(--color-gray-100);
          color: var(--color-primary);
        }

        @media (max-width: 768px) {
          .hide-mobile {
            display: none !important;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .mobile-menu {
            display: flex;
          }
        }

        @media (min-width: 769px) {
          .hide-desktop {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
