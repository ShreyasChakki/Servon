import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    getVendors,
    getMyConnections,
    getPendingRequests,
    sendConnectionRequest,
    acceptRequest,
    rejectRequest
} from '../../services/vendorNetworkService';
import {
    Users,
    UserPlus,
    Check,
    X,
    Search,
    Briefcase,
    Phone,
    MapPin,
    MessageSquare
} from 'lucide-react';

const Network = () => {
    const [activeTab, setActiveTab] = useState('browse');
    const [vendors, setVendors] = useState([]);
    const [connections, setConnections] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'browse') {
                const response = await getVendors(null, searchQuery || null);
                if (response.success) setVendors(response.data);
            } else if (activeTab === 'connections') {
                const response = await getMyConnections();
                if (response.success) setConnections(response.data);
            } else if (activeTab === 'requests') {
                const response = await getPendingRequests();
                if (response.success) setPendingRequests(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await getVendors(null, searchQuery || null);
            if (response.success) setVendors(response.data);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (vendorId) => {
        try {
            await sendConnectionRequest(vendorId, 'I would like to connect with you.');
            // Update vendor's connection status locally
            setVendors(prev => prev.map(v =>
                v._id === vendorId
                    ? { ...v, connectionStatus: 'pending', isRequester: true }
                    : v
            ));
        } catch (err) {
            console.error('Failed to send request:', err);
        }
    };

    const handleAccept = async (connectionId) => {
        try {
            await acceptRequest(connectionId);
            setPendingRequests(prev => prev.filter(r => r._id !== connectionId));
            // Optionally refresh connections
            const response = await getMyConnections();
            if (response.success) setConnections(response.data);
        } catch (err) {
            console.error('Failed to accept:', err);
        }
    };

    const handleReject = async (connectionId) => {
        try {
            await rejectRequest(connectionId);
            setPendingRequests(prev => prev.filter(r => r._id !== connectionId));
        } catch (err) {
            console.error('Failed to reject:', err);
        }
    };

    const CATEGORY_LABELS = {
        'plumbing': 'Plumbing',
        'electrical': 'Electrical',
        'carpentry': 'Carpentry',
        'painting': 'Painting',
        'cleaning': 'Cleaning',
        'pest-control': 'Pest Control',
        'appliance-repair': 'Appliance Repair',
        'home-renovation': 'Home Renovation',
        'gardening': 'Gardening',
        'moving-packing': 'Moving & Packing',
        'ac-repair': 'AC Repair',
        'interior-design': 'Interior Design',
        'security': 'Security',
        'other': 'Other'
    };

    return (
        <div className="network-page">
            <div className="container">
                <div className="page-header">
                    <h1>
                        <Users size={28} />
                        Vendor Network
                    </h1>
                    <p className="text-muted">Connect with other vendors for collaborations</p>
                </div>

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
                        onClick={() => setActiveTab('browse')}
                    >
                        <Search size={18} />
                        Browse Vendors
                    </button>
                    <button
                        className={`tab ${activeTab === 'connections' ? 'active' : ''}`}
                        onClick={() => setActiveTab('connections')}
                    >
                        <Users size={18} />
                        My Connections ({connections.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        <UserPlus size={18} />
                        Requests ({pendingRequests.length})
                    </button>
                </div>

                {activeTab === 'browse' && (
                    <div className="search-bar">
                        <input
                            type="text"
                            className="input"
                            placeholder="Search vendors by name or business..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button className="btn btn-primary" onClick={handleSearch}>
                            <Search size={18} />
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">
                        <div className="loader"></div>
                        <p>Loading...</p>
                    </div>
                ) : (
                    <div className="content">
                        {activeTab === 'browse' && (
                            <div className="vendors-grid">
                                {vendors.length === 0 ? (
                                    <div className="empty-state card">
                                        <Users size={48} className="empty-icon" />
                                        <h3>No vendors found</h3>
                                        <p>Try adjusting your search</p>
                                    </div>
                                ) : (
                                    vendors.map(vendor => (
                                        <div key={vendor._id} className="vendor-card card">
                                            <div className="vendor-avatar">
                                                <Briefcase size={24} />
                                            </div>
                                            <div className="vendor-info">
                                                <h3>{vendor.businessName || vendor.name}</h3>
                                                {vendor.location && (
                                                    <p className="vendor-location">
                                                        <MapPin size={14} />
                                                        {vendor.location}
                                                    </p>
                                                )}
                                                {vendor.serviceCategories?.length > 0 && (
                                                    <p className="vendor-categories">
                                                        {vendor.serviceCategories.map(c => CATEGORY_LABELS[c] || c).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="vendor-action">
                                                {vendor.connectionStatus === 'connected' ? (
                                                    <span className="badge badge-success">Connected</span>
                                                ) : vendor.connectionStatus === 'pending' ? (
                                                    <span className="badge badge-warning">
                                                        {vendor.isRequester ? 'Request Sent' : 'Pending'}
                                                    </span>
                                                ) : (
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleConnect(vendor._id)}
                                                    >
                                                        <UserPlus size={14} />
                                                        Connect
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'connections' && (
                            <div className="connections-list">
                                {connections.length === 0 ? (
                                    <div className="empty-state card">
                                        <Users size={48} className="empty-icon" />
                                        <h3>No connections yet</h3>
                                        <p>Browse vendors and start connecting</p>
                                    </div>
                                ) : (
                                    connections.map(conn => (
                                        <div key={conn.connectionId} className="connection-card card">
                                            <div className="vendor-avatar">
                                                <Briefcase size={24} />
                                            </div>
                                            <div className="vendor-info">
                                                <h3>{conn.otherUser.businessName || conn.otherUser.name}</h3>
                                                {conn.otherUser.phone && (
                                                    <p className="vendor-phone">
                                                        <Phone size={14} />
                                                        {conn.otherUser.phone}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="connection-actions">
                                                <Link
                                                    to={`/conversations?connection=${conn.connectionId}`}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    <MessageSquare size={14} />
                                                    Chat
                                                </Link>
                                                <span className="badge badge-success">Connected</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'requests' && (
                            <div className="requests-list">
                                {pendingRequests.length === 0 ? (
                                    <div className="empty-state card">
                                        <UserPlus size={48} className="empty-icon" />
                                        <h3>No pending requests</h3>
                                        <p>You'll see connection requests here</p>
                                    </div>
                                ) : (
                                    pendingRequests.map(req => (
                                        <div key={req._id} className="request-card card">
                                            <div className="vendor-avatar">
                                                <Briefcase size={24} />
                                            </div>
                                            <div className="vendor-info">
                                                <h3>{req.requesterId.businessName || req.requesterId.name}</h3>
                                                {req.message && (
                                                    <p className="request-message">"{req.message}"</p>
                                                )}
                                            </div>
                                            <div className="request-actions">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => handleAccept(req._id)}
                                                >
                                                    <Check size={14} />
                                                    Accept
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-ghost"
                                                    onClick={() => handleReject(req._id)}
                                                >
                                                    <X size={14} />
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .network-page {
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
                    padding-bottom: var(--space-sm);
                }

                .tab {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    padding: var(--space-sm) var(--space-md);
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 0.875rem;
                    color: var(--color-gray-600);
                    transition: all var(--transition-base);
                }

                .tab.active {
                    color: var(--color-primary);
                    border-bottom: 2px solid var(--color-primary);
                    margin-bottom: -1px;
                }

                .search-bar {
                    display: flex;
                    gap: var(--space-sm);
                    margin-bottom: var(--space-xl);
                }

                .search-bar .input {
                    flex: 1;
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
                    padding: var(--space-3xl);
                    text-align: center;
                    grid-column: 1 / -1;
                }

                .empty-icon {
                    color: var(--color-gray-300);
                    margin-bottom: var(--space-lg);
                }

                .vendors-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: var(--space-md);
                }

                .vendor-card, .connection-card, .request-card {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    padding: var(--space-lg);
                }

                .vendor-avatar {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--color-gray-100);
                    border-radius: var(--radius-full);
                    flex-shrink: 0;
                }

                .vendor-info {
                    flex: 1;
                    min-width: 0;
                }

                .vendor-info h3 {
                    font-size: 1rem;
                    margin-bottom: var(--space-xs);
                }

                .vendor-location, .vendor-phone {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                }

                .vendor-categories {
                    font-size: 0.75rem;
                    color: var(--color-accent);
                }

                .request-message {
                    font-size: 0.875rem;
                    color: var(--color-gray-600);
                    font-style: italic;
                }

                .request-actions {
                    display: flex;
                    gap: var(--space-sm);
                }

                .btn-success {
                    background: var(--color-success);
                    color: white;
                }

                .connection-actions {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                }

                .connections-list, .requests-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-sm);
                }

                @media (max-width: 768px) {
                    .tabs {
                        flex-wrap: wrap;
                    }

                    .search-bar {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
};

export default Network;
