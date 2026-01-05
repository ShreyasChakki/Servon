import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getWalletBalance } from '../../services/walletService';
import { getServiceRequests } from '../../services/serviceRequestService';
import {
  Search,
  FileText,
  Wallet,
  MessageSquare,
  Megaphone,
  Users,
  ArrowRight,
  IndianRupee,
  ClipboardList
} from 'lucide-react';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [walletRes, requestsRes] = await Promise.all([
        getWalletBalance(),
        getServiceRequests()
      ]);

      if (walletRes.success) {
        setWalletBalance(walletRes.data.balance);
      }
      if (requestsRes.success) {
        setRequestsCount(requestsRes.count || requestsRes.data?.length || 0);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {user?.businessName || user?.name}!</h1>
            <p className="text-muted">Find leads and grow your business</p>
          </div>
          <Link to="/vendor/wallet" className="wallet-preview card">
            <Wallet size={20} />
            <span>Wallet Balance:</span>
            <strong>
              <IndianRupee size={16} />
              {loading ? '...' : walletBalance.toFixed(2)}
            </strong>
          </Link>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card card">
            <Search size={24} />
            <div>
              <span className="stat-value">{loading ? '-' : requestsCount}</span>
              <span className="stat-label">Available Requests</span>
            </div>
          </div>
          <div className="stat-card card">
            <FileText size={24} />
            <div>
              <span className="stat-value">0</span>
              <span className="stat-label">Quotations Sent</span>
            </div>
          </div>
          <div className="stat-card card">
            <MessageSquare size={24} />
            <div>
              <span className="stat-value">0</span>
              <span className="stat-label">Active Chats</span>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <Link to="/vendor/browse-requests" className="action-card card primary">
            <div className="action-icon">
              <Search size={32} />
            </div>
            <div className="action-content">
              <h3>Browse Requests</h3>
              <p>Find service requests matching your skills and send quotations</p>
            </div>
            <ArrowRight size={24} className="action-arrow" />
          </Link>

          <Link to="/vendor/wallet" className="action-card card">
            <div className="action-icon">
              <Wallet size={32} />
            </div>
            <div className="action-content">
              <h3>Manage Wallet</h3>
              <p>Add funds to send quotations (₹1 per quotation)</p>
            </div>
            <ArrowRight size={24} className="action-arrow" />
          </Link>

          <Link to="/vendor/my-quotations" className="action-card card">
            <div className="action-icon">
              <FileText size={32} />
            </div>
            <div className="action-content">
              <h3>My Quotations</h3>
              <p>Track your sent quotations and their status</p>
            </div>
            <ArrowRight size={24} className="action-arrow" />
          </Link>

          <Link to="/vendor/create-ad" className="action-card card">
            <div className="action-icon">
              <Megaphone size={32} />
            </div>
            <div className="action-content">
              <h3>Advertise Services</h3>
              <p>Promote your services to reach more customers</p>
            </div>
            <ArrowRight size={24} className="action-arrow" />
          </Link>

          <Link to="/vendor/my-ads" className="action-card card">
            <div className="action-icon">
              <ClipboardList size={32} />
            </div>
            <div className="action-content">
              <h3>My Ads</h3>
              <p>View, edit and manage your advertisements</p>
            </div>
            <ArrowRight size={24} className="action-arrow" />
          </Link>

          <Link to="/vendor/inquiries" className="action-card card">
            <div className="action-icon">
              <MessageSquare size={32} />
            </div>
            <div className="action-content">
              <h3>Ad Inquiries</h3>
              <p>View and respond to customer inquiries about your ads</p>
            </div>
            <ArrowRight size={24} className="action-arrow" />
          </Link>

          <Link to="/vendor/network" className="action-card card">
            <div className="action-icon">
              <Users size={32} />
            </div>
            <div className="action-content">
              <h3>Vendor Network</h3>
              <p>Connect with other vendors for collaborations</p>
            </div>
            <ArrowRight size={24} className="action-arrow" />
          </Link>
        </div>

        <div className="dashboard-section">
          <h2>Recent Activity</h2>
          <div className="empty-state card">
            <Search size={48} className="empty-icon" />
            <h3>No activity yet</h3>
            <p>Start browsing requests to find your first lead</p>
            <Link to="/vendor/browse-requests" className="btn btn-primary">
              <Search size={18} />
              Browse Requests
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard {
          padding: var(--space-lg) 0;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-xl);
          flex-wrap: wrap;
          gap: var(--space-lg);
        }

        .dashboard-header h1 {
          font-size: 2rem;
          margin-bottom: var(--space-xs);
        }

        .wallet-preview {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md) var(--space-lg);
          background-color: var(--color-gray-100);
          font-size: 0.875rem;
          text-decoration: none;
          color: inherit;
          transition: all var(--transition-base);
        }

        .wallet-preview:hover {
          background-color: var(--color-gray-200);
          transform: translateY(-2px);
        }

        .wallet-preview strong {
          display: flex;
          align-items: center;
          font-size: 1.125rem;
          color: var(--color-accent);
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-lg);
          margin-bottom: var(--space-xl);
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          padding: var(--space-xl);
        }

        .stat-card svg {
          color: var(--color-accent);
        }

        .stat-value {
          display: block;
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--color-gray-500);
        }

        .dashboard-actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-lg);
          margin-bottom: var(--space-2xl);
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          padding: var(--space-xl);
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          transition: all var(--transition-base);
        }

        .action-card.primary {
          background-color: var(--color-primary);
          color: var(--color-secondary);
          grid-column: span 2;
        }

        .action-card.primary .action-icon {
          background-color: rgba(255,255,255,0.1);
        }

        .action-card.primary .action-content p {
          color: var(--color-gray-400);
        }

        .action-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .action-icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-gray-100);
          border-radius: var(--radius-xl);
          flex-shrink: 0;
        }

        .action-content {
          flex: 1;
        }

        .action-content h3 {
          font-size: 1.125rem;
          margin-bottom: var(--space-xs);
        }

        .action-content p {
          font-size: 0.875rem;
          color: var(--color-gray-500);
        }

        .action-arrow {
          color: var(--color-gray-400);
          transition: transform var(--transition-base);
        }

        .action-card:hover .action-arrow {
          transform: translateX(4px);
          color: var(--color-accent);
        }

        .action-card.primary .action-arrow {
          color: var(--color-gray-500);
        }

        .action-card.primary:hover .action-arrow {
          color: var(--color-secondary);
        }

        .dashboard-section {
          margin-top: var(--space-2xl);
        }

        .dashboard-section h2 {
          font-size: 1.5rem;
          margin-bottom: var(--space-lg);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-3xl);
          text-align: center;
        }

        .empty-icon {
          color: var(--color-gray-300);
          margin-bottom: var(--space-lg);
        }

        .empty-state h3 {
          font-size: 1.25rem;
          margin-bottom: var(--space-sm);
        }

        .empty-state p {
          color: var(--color-gray-500);
          margin-bottom: var(--space-lg);
        }

        @media (max-width: 768px) {
          .dashboard-stats {
            grid-template-columns: 1fr;
          }
          
          .dashboard-actions {
            grid-template-columns: 1fr;
          }

          .action-card.primary {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
};

export default VendorDashboard;
