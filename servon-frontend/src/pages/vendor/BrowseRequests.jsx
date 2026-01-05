import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getServiceRequests } from '../../services/serviceRequestService';
import {
  Search,
  MapPin,
  Clock,
  IndianRupee,
  Filter,
  Send,
  AlertCircle,
  Calendar,
  X
} from 'lucide-react';

const SERVICE_CATEGORIES = [
  { value: '', label: 'All Categories' },
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

const URGENCY_COLORS = {
  low: 'success',
  medium: 'warning',
  high: 'error',
  urgent: 'error'
};

const BUDGET_RANGES = [
  { value: '', label: 'Any Budget' },
  { value: '0-5000', label: 'Under ₹5,000' },
  { value: '5000-15000', label: '₹5,000 - ₹15,000' },
  { value: '15000-50000', label: '₹15,000 - ₹50,000' },
  { value: '50000-100000', label: '₹50,000 - ₹1,00,000' },
  { value: '100000+', label: 'Above ₹1,00,000' }
];

const BrowseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    urgency: ''
  });

  // Search filters
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [budgetRange, setBudgetRange] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const activeFilters = {};
      if (filters.category) activeFilters.category = filters.category;
      if (filters.urgency) activeFilters.urgency = filters.urgency;

      const response = await getServiceRequests(activeFilters);
      if (response.success) {
        setRequests(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  // Filter requests based on search criteria
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      // Title/description filter
      const matchesTitle = !searchTitle ||
        request.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
        request.description?.toLowerCase().includes(searchTitle.toLowerCase());

      // Location filter
      const matchesLocation = !searchLocation ||
        request.location?.toLowerCase().includes(searchLocation.toLowerCase());

      // Budget range filter
      let matchesBudget = true;
      if (budgetRange && request.budget) {
        const budget = request.budget;
        switch (budgetRange) {
          case '0-5000':
            matchesBudget = budget < 5000;
            break;
          case '5000-15000':
            matchesBudget = budget >= 5000 && budget < 15000;
            break;
          case '15000-50000':
            matchesBudget = budget >= 15000 && budget < 50000;
            break;
          case '50000-100000':
            matchesBudget = budget >= 50000 && budget < 100000;
            break;
          case '100000+':
            matchesBudget = budget >= 100000;
            break;
          default:
            matchesBudget = true;
        }
      }

      return matchesTitle && matchesLocation && matchesBudget;
    });
  }, [requests, searchTitle, searchLocation, budgetRange]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const clearAllFilters = () => {
    setFilters({ category: '', urgency: '' });
    setSearchTitle('');
    setSearchLocation('');
    setBudgetRange('');
  };

  const hasActiveFilters = filters.category || filters.urgency || searchTitle || searchLocation || budgetRange;

  return (
    <div className="browse-requests">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Browse Service Requests</h1>
            <p className="text-muted">Find opportunities matching your skills</p>
          </div>
          <div className="request-count">
            <span className="count">{filteredRequests.length}</span>
            <span className="label">Matching Requests</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-bar card">
          <div className="search-inputs">
            <div className="search-input-group">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="search-input-group">
              <MapPin size={18} />
              <input
                type="text"
                placeholder="Search by location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar card">
          <Filter size={20} />
          <select
            className="filter-select"
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            {SERVICE_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filters.urgency}
            onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
          >
            <option value="">All Urgency</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            className="filter-select"
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
          >
            {BUDGET_RANGES.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          {hasActiveFilters && (
            <button className="clear-filter" onClick={clearAllFilters}>
              <X size={16} />
              Clear All
            </button>
          )}
        </div>

        {error && (
          <div className="error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state card">
            <Search size={48} className="empty-icon" />
            <h3>No requests found</h3>
            <p>
              {hasActiveFilters
                ? 'Try adjusting your search filters'
                : 'No open requests at the moment'}
            </p>
            {hasActiveFilters && (
              <button className="btn btn-secondary" onClick={clearAllFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="requests-grid">
            {filteredRequests.map(request => (
              <div key={request._id} className="request-card card">
                <div className="request-header">
                  <span className={`badge badge-${URGENCY_COLORS[request.urgency]}`}>
                    {request.urgency}
                  </span>
                  <span className="request-date">
                    <Calendar size={14} />
                    {formatDate(request.createdAt)}
                  </span>
                </div>

                <h3 className="request-title">{request.title}</h3>

                <span className="request-category">
                  {request.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>

                <p className="request-description">{request.description}</p>

                <div className="request-meta">
                  <div className="meta-item">
                    <MapPin size={16} />
                    <span>{request.location}</span>
                  </div>
                  {request.budget && (
                    <div className="meta-item budget">
                      <IndianRupee size={16} />
                      <span>₹{request.budget.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>{request.quotationsCount} quotes</span>
                  </div>
                </div>

                <div className="request-customer">
                  <span>By {request.customerId?.name || 'Customer'}</span>
                </div>

                <Link
                  to={`/vendor/send-quotation/${request._id}`}
                  className="btn btn-primary w-full"
                >
                  <Send size={16} />
                  Send Quotation (₹1)
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .browse-requests {
          padding: var(--space-lg) 0;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-xl);
        }

        .page-header h1 {
          font-size: 2rem;
          margin-bottom: var(--space-xs);
        }

        .request-count {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .request-count .count {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-accent);
        }

        .request-count .label {
          font-size: 0.75rem;
          color: var(--color-gray-500);
        }

        .search-bar {
          padding: var(--space-lg);
          margin-bottom: var(--space-md);
        }

        .search-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-md);
        }

        .search-input-group {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          background: var(--color-gray-50);
          padding: var(--space-sm) var(--space-md);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-gray-200);
          transition: all var(--transition-base);
        }

        .search-input-group:focus-within {
          border-color: var(--color-accent);
          background: white;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .search-input-group svg {
          color: var(--color-gray-400);
          flex-shrink: 0;
        }

        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.875rem;
          outline: none;
        }

        .search-input::placeholder {
          color: var(--color-gray-400);
        }

        .filters-bar {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md) var(--space-lg);
          margin-bottom: var(--space-xl);
          flex-wrap: wrap;
        }

        .filter-select {
          padding: var(--space-sm) var(--space-md);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          background-color: var(--color-secondary);
          cursor: pointer;
        }

        .clear-filter {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          background: none;
          border: none;
          color: var(--color-gray-500);
          cursor: pointer;
          font-size: 0.875rem;
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
        }

        .clear-filter:hover {
          color: var(--color-error);
          background: rgba(239, 68, 68, 0.1);
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

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-3xl);
          gap: var(--space-md);
        }

        .loading-state p {
          color: var(--color-gray-500);
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

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-lg);
        }

        .request-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          padding: var(--space-xl);
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .request-date {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.75rem;
          color: var(--color-gray-500);
        }

        .request-title {
          font-size: 1.125rem;
          margin: 0;
        }

        .request-category {
          font-size: 0.75rem;
          color: var(--color-accent);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .request-description {
          font-size: 0.875rem;
          color: var(--color-gray-600);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .request-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-md);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.75rem;
          color: var(--color-gray-600);
        }

        .meta-item.budget {
          color: var(--color-success);
          font-weight: 600;
        }

        .request-customer {
          font-size: 0.75rem;
          color: var(--color-gray-500);
          padding-top: var(--space-sm);
          border-top: 1px solid var(--color-gray-100);
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: var(--space-md);
          }

          .request-count {
            align-items: flex-start;
          }

          .search-inputs {
            grid-template-columns: 1fr;
          }

          .filters-bar {
            flex-wrap: wrap;
          }

          .requests-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default BrowseRequests;

