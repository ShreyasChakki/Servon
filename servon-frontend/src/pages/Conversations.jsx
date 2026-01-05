import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConversations } from '../services/chatService';
import CustomerInfoModal from '../components/CustomerInfoModal';
import {
    MessageSquare,
    User,
    ArrowRight,
    Clock,
    CheckCheck,
    ExternalLink
} from 'lucide-react';

const Conversations = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await getConversations();
            if (response.success) {
                setConversations(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString('en-IN', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short'
            });
        }
    };

    const handleNameClick = (e, conv) => {
        e.preventDefault();
        e.stopPropagation();

        const otherUser = conv.otherUser;

        // Determine the other user's role
        // Priority: 1) Use role from API 2) Infer from conversation type 3) Infer from current user role
        let otherRole = otherUser.role;
        if (!otherRole) {
            // For vendor connections, both users are vendors
            if (conv.type === 'connection') {
                otherRole = 'vendor';
            } else {
                // For quotations/ads: if current user is customer, other is vendor and vice versa
                otherRole = user?.role === 'customer' ? 'vendor' : 'customer';
            }
        }

        if (otherRole === 'vendor') {
            // Navigate to vendor profile
            navigate(`/vendor/${otherUser._id}`);
        } else if (otherRole === 'customer') {
            // Show customer info modal
            setSelectedCustomer({
                _id: otherUser._id,
                name: otherUser.name,
            });
        }
    };

    if (loading) {
        return (
            <div className="conversations-loading">
                <div className="loader"></div>
                <p>Loading chats...</p>
            </div>
        );
    }

    const backLink = user?.role === 'vendor'
        ? '/vendor/dashboard'
        : '/customer/dashboard';

    return (
        <div className="conversations-page">
            <div className="container">
                <div className="page-header">
                    <h1>
                        <MessageSquare size={28} />
                        Chats
                    </h1>
                    <p className="text-muted">Your conversations with {user?.role === 'vendor' ? 'customers' : 'vendors'}</p>
                </div>

                {conversations.length === 0 ? (
                    <div className="empty-state card">
                        <MessageSquare size={48} className="empty-icon" />
                        <h3>No conversations yet</h3>
                        <p>
                            {user?.role === 'vendor'
                                ? 'Send quotations to start conversations with customers'
                                : 'Accept quotations to start chatting with vendors'}
                        </p>
                        <Link to={backLink} className="btn btn-primary">
                            Go to Dashboard
                        </Link>
                    </div>
                ) : (
                    <div className="conversations-list">
                        {conversations.map(conv => (
                            <Link
                                key={conv.conversationId}
                                to={`/chat/${conv.conversationId}`}
                                className="conversation-item card"
                            >
                                <div className="conv-avatar">
                                    <User size={24} />
                                </div>
                                <div className="conv-details">
                                    <div className="conv-header">
                                        <h3
                                            className="conv-name clickable"
                                            onClick={(e) => handleNameClick(e, conv)}
                                        >
                                            {conv.otherUser.name}
                                            <ExternalLink size={12} className="name-icon" />
                                        </h3>
                                        {conv.lastMessage && (
                                            <span className="conv-time">
                                                {formatTime(conv.lastMessage.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="conv-request">{conv.requestTitle}</p>
                                    {conv.lastMessage && (
                                        <p className="conv-preview">
                                            {conv.lastMessage.isFromMe && (
                                                <CheckCheck size={14} className="sent-icon" />
                                            )}
                                            {conv.lastMessage.content}
                                        </p>
                                    )}
                                </div>
                                {conv.unreadCount > 0 && (
                                    <span className="unread-badge">{conv.unreadCount}</span>
                                )}
                                <ArrowRight size={20} className="conv-arrow" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {selectedCustomer && (
                <CustomerInfoModal
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                />
            )}

            <style>{`
                .conversations-page {
                    padding: var(--space-xl) 0;
                }

                .conversations-loading {
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
                    font-size: 2rem;
                    margin-bottom: var(--space-xs);
                }

                .empty-state {
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

                .empty-state h3 {
                    margin-bottom: var(--space-sm);
                }

                .empty-state p {
                    color: var(--color-gray-500);
                    margin-bottom: var(--space-lg);
                }

                .conversations-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-sm);
                }

                .conversation-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    padding: var(--space-md) var(--space-lg);
                    text-decoration: none;
                    color: inherit;
                    transition: all var(--transition-base);
                }

                .conversation-item:hover {
                    transform: translateX(4px);
                }

                .conv-avatar {
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--color-gray-100);
                    border-radius: var(--radius-full);
                    flex-shrink: 0;
                }

                .conv-details {
                    flex: 1;
                    min-width: 0;
                }

                .conv-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-xs);
                }

                .conv-header h3 {
                    font-size: 1rem;
                    margin: 0;
                }

                .conv-name.clickable {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--space-xs);
                    cursor: pointer;
                    padding: var(--space-xs) var(--space-sm);
                    margin: calc(-1 * var(--space-xs)) calc(-1 * var(--space-sm));
                    border-radius: var(--radius-md);
                    transition: all var(--transition-base);
                }

                .conv-name.clickable:hover {
                    background: var(--color-accent);
                    color: white;
                }

                .name-icon {
                    opacity: 0;
                    transition: opacity var(--transition-base);
                }

                .conv-name.clickable:hover .name-icon {
                    opacity: 1;
                }

                .conv-time {
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                }

                .conv-request {
                    font-size: 0.75rem;
                    color: var(--color-accent);
                    margin-bottom: var(--space-xs);
                }

                .conv-preview {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-size: 0.875rem;
                    color: var(--color-gray-600);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .sent-icon {
                    color: var(--color-accent);
                    flex-shrink: 0;
                }

                .unread-badge {
                    min-width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--color-accent);
                    color: white;
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 0 var(--space-sm);
                }

                .conv-arrow {
                    color: var(--color-gray-400);
                }

                @media (max-width: 768px) {
                    .conversation-item {
                        padding: var(--space-md);
                    }
                }
            `}</style>
        </div>
    );
};

export default Conversations;

