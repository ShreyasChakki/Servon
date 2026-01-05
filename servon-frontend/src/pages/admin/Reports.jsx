import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getReports, updateReportStatus, getReportStats } from '../../services/reportService';
import {
    Flag,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    MessageSquare,
    ChevronDown,
    User,
    Users,
    Filter,
    ShieldCheck
} from 'lucide-react';

const REPORT_REASONS = {
    scam: 'Scam / Fraud',
    harassment: 'Harassment / Abusive',
    fake_service: 'Fake Service',
    unprofessional: 'Unprofessional',
    other: 'Other'
};

const STATUS_BADGES = {
    pending: { label: 'Pending', className: 'badge-warning' },
    reviewed: { label: 'Reviewed', className: 'badge-info' },
    resolved: { label: 'Resolved', className: 'badge-success' },
    dismissed: { label: 'Dismissed', className: 'badge-gray' }
};

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState(null);
    const [vendorReportCounts, setVendorReportCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [expandedReport, setExpandedReport] = useState(null);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter !== 'all') params.status = filter;

            const [reportsRes, statsRes] = await Promise.all([
                getReports(params),
                getReportStats()
            ]);

            if (reportsRes.success) {
                setReports(reportsRes.data);
                setVendorReportCounts(reportsRes.vendorReportCounts || {});
            }
            if (statsRes.success) {
                setStats(statsRes.data);
            }
        } catch (err) {
            console.error('Failed to fetch reports:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (reportId, status) => {
        setUpdating(reportId);
        try {
            await updateReportStatus(reportId, { status });
            setReports(prev => prev.map(r =>
                r._id === reportId ? { ...r, status } : r
            ));
            // Refresh stats
            const statsRes = await getReportStats();
            if (statsRes.success) setStats(statsRes.data);
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setUpdating(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="reports-page">
            <div className="container">
                <div className="page-header">
                    <h1>
                        <ShieldCheck size={28} />
                        Admin Dashboard
                    </h1>
                    <p className="text-muted">Platform overview and management</p>
                </div>

                {/* Navigation Tabs */}
                <div className="tabs">
                    <Link to="/admin/dashboard" className="tab">
                        Overview
                    </Link>
                    <Link to="/admin/dashboard" className="tab">
                        <Users size={14} />
                        Users
                    </Link>
                    <span className="tab active">
                        <Flag size={14} />
                        Reports
                        {stats?.pending > 0 && (
                            <span className="tab-badge">{stats.pending}</span>
                        )}
                    </span>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="stats-grid">
                        <div className="stat-card pending">
                            <AlertTriangle size={24} />
                            <div>
                                <span className="stat-value">{stats.pending}</span>
                                <span className="stat-label">Pending</span>
                            </div>
                        </div>
                        <div className="stat-card reviewed">
                            <Eye size={24} />
                            <div>
                                <span className="stat-value">{stats.reviewed}</span>
                                <span className="stat-label">Reviewed</span>
                            </div>
                        </div>
                        <div className="stat-card resolved">
                            <CheckCircle size={24} />
                            <div>
                                <span className="stat-value">{stats.resolved}</span>
                                <span className="stat-label">Resolved</span>
                            </div>
                        </div>
                        <div className="stat-card dismissed">
                            <XCircle size={24} />
                            <div>
                                <span className="stat-value">{stats.dismissed}</span>
                                <span className="stat-label">Dismissed</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter */}
                <div className="filter-bar">
                    <Filter size={18} />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="input filter-select"
                    >
                        <option value="all">All Reports</option>
                        <option value="pending">Pending Only</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                    </select>
                </div>

                {/* Reports List */}
                {loading ? (
                    <div className="loading-state">
                        <div className="loader"></div>
                        <p>Loading reports...</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="empty-state card">
                        <Flag size={48} className="empty-icon" />
                        <h3>No reports found</h3>
                        <p>No vendor reports match your filter criteria</p>
                    </div>
                ) : (
                    <div className="reports-list">
                        {reports.map(report => (
                            <div
                                key={report._id}
                                className={`report-card card ${expandedReport === report._id ? 'expanded' : ''}`}
                            >
                                <div
                                    className="report-header"
                                    onClick={() => setExpandedReport(
                                        expandedReport === report._id ? null : report._id
                                    )}
                                >
                                    <div className="report-info">
                                        <div className="report-vendor">
                                            <User size={16} />
                                            <strong>{report.vendorId?.businessName || report.vendorId?.name}</strong>
                                            <span className="report-count">
                                                ({vendorReportCounts[report.vendorId?._id] || 1} total reports)
                                            </span>
                                        </div>
                                        <div className="report-meta">
                                            <span className={`badge ${STATUS_BADGES[report.status].className}`}>
                                                {STATUS_BADGES[report.status].label}
                                            </span>
                                            <span className="reason-badge">
                                                {REPORT_REASONS[report.reason]}
                                            </span>
                                            <span className="report-date">{formatDate(report.createdAt)}</span>
                                        </div>
                                    </div>
                                    <ChevronDown
                                        size={20}
                                        className={`expand-icon ${expandedReport === report._id ? 'rotated' : ''}`}
                                    />
                                </div>

                                {expandedReport === report._id && (
                                    <div className="report-details">
                                        <div className="detail-section">
                                            <h4>Reporter</h4>
                                            <p>{report.reporterId?.name} ({report.reporterId?.email})</p>
                                        </div>

                                        <div className="detail-section">
                                            <h4>Description</h4>
                                            <p className="description">{report.description}</p>
                                        </div>

                                        {report.conversationId && (
                                            <div className="detail-section">
                                                <Link
                                                    to={`/chat/${report.conversationId}`}
                                                    className="btn btn-sm btn-ghost"
                                                >
                                                    <MessageSquare size={14} />
                                                    View Chat History
                                                </Link>
                                            </div>
                                        )}

                                        <div className="report-actions">
                                            {report.status === 'pending' && (
                                                <>
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleStatusUpdate(report._id, 'reviewed')}
                                                        disabled={updating === report._id}
                                                    >
                                                        <Eye size={14} />
                                                        Mark Reviewed
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleStatusUpdate(report._id, 'resolved')}
                                                        disabled={updating === report._id}
                                                    >
                                                        <CheckCircle size={14} />
                                                        Resolve
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-ghost"
                                                        onClick={() => handleStatusUpdate(report._id, 'dismissed')}
                                                        disabled={updating === report._id}
                                                    >
                                                        <XCircle size={14} />
                                                        Dismiss
                                                    </button>
                                                </>
                                            )}
                                            {report.status === 'reviewed' && (
                                                <>
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleStatusUpdate(report._id, 'resolved')}
                                                        disabled={updating === report._id}
                                                    >
                                                        <CheckCircle size={14} />
                                                        Resolve
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-ghost"
                                                        onClick={() => handleStatusUpdate(report._id, 'dismissed')}
                                                        disabled={updating === report._id}
                                                    >
                                                        <XCircle size={14} />
                                                        Dismiss
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .reports-page {
                    padding: var(--space-xl) 0;
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

                .tab:hover {
                    color: var(--color-primary);
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
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--space-md);
                    margin-bottom: var(--space-xl);
                }

                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    padding: var(--space-lg);
                    border-radius: var(--radius-lg);
                    background: var(--color-secondary);
                    box-shadow: var(--shadow-sm);
                }

                .stat-card.pending { color: var(--color-warning); }
                .stat-card.reviewed { color: var(--color-primary); }
                .stat-card.resolved { color: var(--color-success); }
                .stat-card.dismissed { color: var(--color-gray-500); }

                .stat-value {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--color-primary);
                }

                .stat-label {
                    font-size: 0.875rem;
                    color: var(--color-gray-500);
                }

                .filter-bar {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    margin-bottom: var(--space-lg);
                }

                .filter-select {
                    max-width: 200px;
                }

                .loading-state, .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: var(--space-3xl);
                    text-align: center;
                }

                .empty-icon {
                    color: var(--color-gray-300);
                    margin-bottom: var(--space-lg);
                }

                .reports-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-md);
                }

                .report-card {
                    overflow: hidden;
                }

                .report-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--space-lg);
                    cursor: pointer;
                    transition: background var(--transition-base);
                }

                .report-header:hover {
                    background: var(--color-gray-50);
                }

                .report-info {
                    flex: 1;
                }

                .report-vendor {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    margin-bottom: var(--space-xs);
                }

                .report-count {
                    font-size: 0.75rem;
                    color: var(--color-error);
                    font-weight: 500;
                }

                .report-meta {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    font-size: 0.875rem;
                }

                .reason-badge {
                    padding: 2px 8px;
                    background: var(--color-gray-100);
                    border-radius: var(--radius-sm);
                    font-size: 0.75rem;
                }

                .report-date {
                    color: var(--color-gray-500);
                }

                .expand-icon {
                    transition: transform var(--transition-base);
                }

                .expand-icon.rotated {
                    transform: rotate(180deg);
                }

                .report-details {
                    padding: var(--space-lg);
                    border-top: 1px solid var(--color-gray-200);
                    background: var(--color-gray-50);
                }

                .detail-section {
                    margin-bottom: var(--space-lg);
                }

                .detail-section h4 {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: var(--color-gray-500);
                    margin-bottom: var(--space-xs);
                }

                .description {
                    background: var(--color-secondary);
                    padding: var(--space-md);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--color-gray-200);
                }

                .report-actions {
                    display: flex;
                    gap: var(--space-sm);
                    margin-top: var(--space-lg);
                    padding-top: var(--space-lg);
                    border-top: 1px solid var(--color-gray-200);
                }

                .badge-warning {
                    background: var(--color-warning);
                    color: white;
                }

                .badge-info {
                    background: var(--color-primary);
                    color: white;
                }

                .badge-success {
                    background: var(--color-success);
                    color: white;
                }

                .badge-gray {
                    background: var(--color-gray-400);
                    color: white;
                }

                .btn-success {
                    background: var(--color-success);
                    color: white;
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .report-meta {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </div>
    );
};

export default Reports;
