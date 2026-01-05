import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyServiceRequests } from '../../services/serviceRequestService';
import {
  PlusCircle,
  FileText,
  MessageSquare,
  User,
  ArrowRight,
  MapPin,
  Clock,
  IndianRupee,
  Eye,
  Megaphone
} from 'lucide-react';

const URGENCY_COLORS = {
  low: 'success',
  medium: 'warning',
  high: 'error',
  urgent: 'error'
};

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const response = await getMyServiceRequests();
      if (response.success) {
        setRequests(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeRequests = requests.filter(r => r.status === 'open' || r.status === 'in_progress');
  const totalQuotations = requests.reduce((sum, r) => sum + (r.quotationsCount || 0), 0);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {user?.name}!</h1>
            <p className="text-muted">Manage your service requests and quotations</p>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card card">
            <FileText size={24} />
            <div>
              <span className="stat-value">{activeRequests.length}</span>
              <span className="stat-label">Active Requests</span>
            </div>
          </div>
          <div className="stat-card card">
            <MessageSquare size={24} />
            <div>
              <span className="stat-value">{totalQuotations}</span>
              <span className="stat-label">Quotations Received</span>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <Link to="/customer/post-request" className="action-card card">
            <div className="action-icon">
              <PlusCircle size={32} />
            </div>
            <div className="action-content">
              <h3>Post New Request</h3>
              <p>Create a new service request and get quotations from vendors</p>
            </div>
            <ArrowRight size={24} className="action-arrow" />
          </Link>

          <Link to="/profile" className="action-card card">
            <div className="action-icon">
              <User size={32} />
            </div>
            <div className="action-content">
              <h3>Edit Profile</h3>
              <p>Update your personal information and preferences</p>
            </div>
            <ArrowRight size={24} className="action-arrow" />
          </Link>

          <Link to="/customer/my-inquiries" className="action-card card">
            <div className="action-icon">
              <Megaphone size={32} />
            </div>
            <div className="action-content">
              <h3>My Ad Inquiries</h3>
              <p>Track your inquiries to vendor advertisements</p>
            </div>
            <ArrowRight size={24} className="action-arrow" />
          </Link>
        </div>

        <div className="dashboard-section">
          <h2>My Requests</h2>

          {loading ? (
            <div className="loading-state card">
              <div className="loader"></div>
              <p>Loading your requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="empty-state card">
              <FileText size={48} className="empty-icon" />
              <h3>No requests yet</h3>
              <p>Start by posting your first service request</p>
              <Link to="/customer/post-request" className="btn btn-primary">
                <PlusCircle size={18} />
                Post Request
              </Link>
            </div>
          ) : (
            <div className="requests-list">
              {requests.map(request => (
                <div key={request._id} className="request-item card">
                  <div className="request-header">
                    <h3>{request.title}</h3>
                    <div className="request-badges">
                      <span className={`badge badge-${URGENCY_COLORS[request.urgency]}`}>
                        {request.urgency}
                      </span>
                      <span className={`badge ${request.status === 'open' ? 'badge-primary' : 'badge-info'}`}>
                        {STATUS_LABELS[request.status]}
                      </span>
                    </div>
                  </div>

                  <p className="request-category">
                    {request.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>

                  <p className="request-description">{request.description}</p>

                  <div className="request-meta">
                    <div className="meta-item">
                      <MapPin size={14} />
                      <span>{request.location}</span>
                    </div>
                    {request.budget && (
                      <div className="meta-item">
                        <IndianRupee size={14} />
                        <span>₹{request.budget.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="meta-item">
                      <Clock size={14} />
                      <span>{formatDate(request.createdAt)}</span>
                    </div>
                    <div className="meta-item highlight">
                      <MessageSquare size={14} />
                      <span>{request.quotationsCount || 0} quotations</span>
                    </div>
                  </div>

                  {request.quotationsCount > 0 && (
                    <Link
                      to={`/customer/view-quotations/${request._id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye size={14} />
                      View Quotations
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dashboard {
          padding: var(--space-lg) 0;
        }

        .dashboard-header {
          margin-bottom: var(--space-xl);
        }

        .dashboard-header h1 {
          font-size: 2rem;
          margin-bottom: var(--space-xs);
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
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

        .dashboard-section {
          margin-top: var(--space-2xl);
        }

        .dashboard-section h2 {
          font-size: 1.5rem;
          margin-bottom: var(--space-lg);
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

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .request-item {
          padding: var(--space-xl);
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-sm);
          gap: var(--space-md);
        }

        .request-header h3 {
          font-size: 1.125rem;
          margin: 0;
        }

        .request-badges {
          display: flex;
          gap: var(--space-sm);
          flex-shrink: 0;
        }

        .request-category {
          font-size: 0.75rem;
          color: var(--color-accent);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--space-sm);
        }

        .request-description {
          font-size: 0.875rem;
          color: var(--color-gray-600);
          margin-bottom: var(--space-md);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .request-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-md);
          margin-bottom: var(--space-md);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.75rem;
          color: var(--color-gray-500);
        }

        .meta-item.highlight {
          color: var(--color-accent);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .dashboard-stats,
          .dashboard-actions {
            grid-template-columns: 1fr;
          }

          .request-header {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerDashboard;
