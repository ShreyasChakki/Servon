import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getUsers, toggleUserBan, getRecentActivity } from '../../services/adminService';
import { getReportStats } from '../../services/reportService';
import {
    Users,
    FileText,
    IndianRupee,
    TrendingUp,
    MessageSquare,
    Megaphone,
    Ban,
    Check,
    ChevronRight,
    ShieldCheck,
    Flag
} from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [activity, setActivity] = useState(null);
    const [reportStats, setReportStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [filter, setFilter] = useState({ role: '', search: '' });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab, filter]);

    const fetchData = async () => {
        try {
            const [statsRes, activityRes, reportsRes] = await Promise.all([
                getDashboardStats(),
                getRecentActivity(),
                getReportStats()
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (activityRes.success) setActivity(activityRes.data);
            if (reportsRes.success) setReportStats(reportsRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const params = {};
            if (filter.role) params.role = filter.role;
            if (filter.search) params.search = filter.search;

            const response = await getUsers(params);
            if (response.success) setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const handleBan = async (userId) => {
        try {
            const response = await toggleUserBan(userId);
            if (response.success) {
                setUsers(prev => prev.map(u =>
                    u._id === userId ? { ...u, isBanned: response.data.isBanned } : u
                ));
            }
        } catch (err) {
            console.error('Failed to toggle ban:', err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loader"></div>
                <p>Loading Admin Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="container">
                <div className="page-header">
                    <h1>
                        <ShieldCheck size={28} />
                        Admin Dashboard
                    </h1>
                    <p className="text-muted">Platform overview and management</p>
                </div>

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                    <Link to="/admin/reports" className="tab">
                        <Flag size={14} />
                        Reports
                        {reportStats?.pending > 0 && (
                            <span className="tab-badge">{reportStats.pending}</span>
                        )}
                    </Link>
                </div>

                {activeTab === 'overview' && stats && (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card card">
                                <div className="stat-icon users">
                                    <Users size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.users.total}</h3>
                                    <p>Total Users</p>
                                    <span className="stat-detail">
                                        {stats.users.customers} customers • {stats.users.vendors} vendors
                                    </span>
                                </div>
                            </div>

                            <div className="stat-card card">
                                <div className="stat-icon requests">
                                    <FileText size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.requests.total}</h3>
                                    <p>Service Requests</p>
                                    <span className="stat-detail">
                                        {stats.requests.open} open • {stats.requests.closed} closed
                                    </span>
                                </div>
                            </div>

                            <div className="stat-card card">
                                <div className="stat-icon revenue">
                                    <IndianRupee size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>₹{stats.quotations.revenue + stats.advertisements.totalSpend}</h3>
                                    <p>Total Revenue</p>
                                    <span className="stat-detail">
                                        ₹{stats.quotations.revenue} quotes • ₹{stats.advertisements.totalSpend} ads
                                    </span>
                                </div>
                            </div>

                            <div className="stat-card card">
                                <div className="stat-icon engagement">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.quotations.total}</h3>
                                    <p>Quotations Sent</p>
                                    <span className="stat-detail">
                                        {stats.quotations.accepted} accepted
                                    </span>
                                </div>
                            </div>

                            <div className="stat-card card">
                                <div className="stat-icon messages">
                                    <MessageSquare size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.engagement.messages}</h3>
                                    <p>Messages</p>
                                </div>
                            </div>

                            <div className="stat-card card">
                                <div className="stat-icon ads">
                                    <Megaphone size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.advertisements.total}</h3>
                                    <p>Advertisements</p>
                                    <span className="stat-detail">
                                        {stats.advertisements.active} active
                                    </span>
                                </div>
                            </div>
                        </div>

                        {activity && (
                            <div className="activity-section">
                                <h2>Recent Activity</h2>
                                <div className="activity-grid">
                                    <div className="activity-card card">
                                        <h3>New Users</h3>
                                        {activity.recentUsers.map(user => (
                                            <div key={user._id} className="activity-item">
                                                <span className="activity-name">{user.name}</span>
                                                <span className="badge badge-sm">{user.role}</span>
                                                <span className="activity-date">{formatDate(user.createdAt)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="activity-card card">
                                        <h3>Recent Requests</h3>
                                        {activity.recentRequests.map(req => (
                                            <div key={req._id} className="activity-item">
                                                <span className="activity-name">{req.title}</span>
                                                <span className={`badge badge-sm badge-${req.status === 'open' ? 'success' : 'default'}`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="activity-card card">
                                        <h3>Recent Quotations</h3>
                                        {activity.recentQuotations.map(quote => (
                                            <div key={quote._id} className="activity-item">
                                                <span className="activity-name">
                                                    ₹{quote.price} by {quote.vendorId?.businessName || quote.vendorId?.name}
                                                </span>
                                                <span className={`badge badge-sm badge-${quote.status === 'accepted' ? 'success' : 'default'}`}>
                                                    {quote.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'users' && (
                    <div className="users-section">
                        <div className="filters">
                            <select
                                className="input"
                                value={filter.role}
                                onChange={(e) => setFilter(prev => ({ ...prev, role: e.target.value }))}
                            >
                                <option value="">All Roles</option>
                                <option value="customer">Customers</option>
                                <option value="vendor">Vendors</option>
                                <option value="admin">Admins</option>
                            </select>
                            <input
                                type="text"
                                className="input"
                                placeholder="Search by name or email..."
                                value={filter.search}
                                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
                            />
                        </div>

                        <div className="users-list">
                            {users.map(user => (
                                <div key={user._id} className={`user-card card ${user.isBanned ? 'banned' : ''}`}>
                                    <div className="user-info">
                                        <h3>{user.name}</h3>
                                        <p className="user-email">{user.email}</p>
                                        {user.businessName && (
                                            <p className="user-business">{user.businessName}</p>
                                        )}
                                    </div>
                                    <div className="user-meta">
                                        <span className={`badge badge-${user.role}`}>{user.role}</span>
                                        <span className="user-date">{formatDate(user.createdAt)}</span>
                                    </div>
                                    <div className="user-actions">
                                        {user.role !== 'admin' && (
                                            <button
                                                className={`btn btn-sm ${user.isBanned ? 'btn-success' : 'btn-ghost'}`}
                                                onClick={() => handleBan(user._id)}
                                            >
                                                {user.isBanned ? (
                                                    <>
                                                        <Check size={14} />
                                                        Unban
                                                    </>
                                                ) : (
                                                    <>
                                                        <Ban size={14} />
                                                        Ban
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .admin-dashboard {
                    padding: var(--space-xl) 0;
                }

                .admin-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 60vh;
                    gap: var(--space-md);
                }

                .page-header {
                    margin-bottom: var(--space-xl);
                }

                .page-header h1 {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    font-size: 1.75rem;
                    margin-bottom: var(--space-xs);
                }

                .tabs {
                    display: flex;
                    gap: var(--space-sm);
                    margin-bottom: var(--space-xl);
                    border-bottom: 1px solid var(--color-gray-200);
                }

                .tab {
                    padding: var(--space-sm) var(--space-lg);
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 0.875rem;
                    color: var(--color-gray-600);
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    text-decoration: none;
                }

                .tab.active {
                    color: var(--color-primary);
                    border-bottom: 2px solid var(--color-primary);
                    margin-bottom: -1px;
                }

                .tab-badge {
                    background: var(--color-error);
                    color: white;
                    font-size: 0.625rem;
                    padding: 2px 6px;
                    border-radius: var(--radius-full);
                    font-weight: 600;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: var(--space-lg);
                    margin-bottom: var(--space-2xl);
                }

                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: var(--space-lg);
                    padding: var(--space-xl);
                }

                .stat-icon {
                    width: 56px;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-xl);
                }

                .stat-icon.users { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .stat-icon.requests { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .stat-icon.revenue { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .stat-icon.engagement { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                .stat-icon.messages { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
                .stat-icon.ads { background: rgba(20, 184, 166, 0.1); color: #14b8a6; }

                .stat-info h3 {
                    font-size: 1.5rem;
                    margin-bottom: var(--space-xs);
                }

                .stat-info p {
                    color: var(--color-gray-600);
                    font-size: 0.875rem;
                }

                .stat-detail {
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                }

                .activity-section h2 {
                    font-size: 1.25rem;
                    margin-bottom: var(--space-lg);
                }

                .activity-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: var(--space-lg);
                }

                .activity-card {
                    padding: var(--space-lg);
                }

                .activity-card h3 {
                    font-size: 0.875rem;
                    color: var(--color-gray-600);
                    margin-bottom: var(--space-md);
                }

                .activity-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    padding: var(--space-sm) 0;
                    border-bottom: 1px solid var(--color-gray-100);
                    font-size: 0.875rem;
                }

                .activity-name {
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .activity-date {
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                }

                .users-section {
                    margin-top: var(--space-lg);
                }

                .filters {
                    display: flex;
                    gap: var(--space-md);
                    margin-bottom: var(--space-lg);
                }

                .filters .input {
                    flex: 1;
                }

                .filters select {
                    width: auto;
                    min-width: 150px;
                }

                .users-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-sm);
                }

                .user-card {
                    display: flex;
                    align-items: center;
                    gap: var(--space-lg);
                    padding: var(--space-md) var(--space-lg);
                }

                .user-card.banned {
                    opacity: 0.6;
                    background: rgba(239, 68, 68, 0.05);
                }

                .user-info {
                    flex: 1;
                }

                .user-info h3 {
                    font-size: 1rem;
                    margin-bottom: var(--space-xs);
                }

                .user-email {
                    font-size: 0.875rem;
                    color: var(--color-gray-500);
                }

                .user-business {
                    font-size: 0.75rem;
                    color: var(--color-accent);
                }

                .user-meta {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: var(--space-xs);
                }

                .user-date {
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                }

                .badge-customer { background: #dbeafe; color: #1e40af; }
                .badge-vendor { background: #d1fae5; color: #065f46; }
                .badge-admin { background: #fce7f3; color: #9d174d; }

                @media (max-width: 1024px) {
                    .stats-grid, .activity-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .stats-grid, .activity-grid {
                        grid-template-columns: 1fr;
                    }

                    .filters {
                        flex-direction: column;
                    }

                    .user-card {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
