import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getMessages, getConversationInfo, sendMessage, sendVendorMessage, sendDirectMessage } from '../services/chatService';
import ReportModal from '../components/ReportModal';
import {
    Send,
    ArrowLeft,
    User,
    Clock,
    CheckCheck,
    IndianRupee,
    Flag
} from 'lucide-react';

const Chat = () => {
    const { conversationId } = useParams();
    const { user } = useAuth();
    const { socket } = useSocket();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [conversationInfo, setConversationInfo] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        fetchConversationData();

        if (socket) {
            socket.emit('joinConversation', conversationId);

            socket.on('conversationMessage', handleNewMessage);
            socket.on('userTyping', handleTyping);

            return () => {
                socket.emit('leaveConversation', conversationId);
                socket.off('conversationMessage', handleNewMessage);
                socket.off('userTyping', handleTyping);
            };
        }
    }, [conversationId, socket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversationData = async () => {
        try {
            const [messagesRes, infoRes] = await Promise.all([
                getMessages(conversationId),
                getConversationInfo(conversationId)
            ]);

            if (messagesRes.success) {
                setMessages(messagesRes.data);
            }
            if (infoRes.success) {
                setConversationInfo(infoRes.data);
            }
        } catch (err) {
            console.error('Failed to fetch conversation:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleNewMessage = (data) => {
        if (data.conversationId === conversationId) {
            // Only add message if it's from the other user (avoid duplicates for sender)
            // Convert to strings for proper ObjectId comparison
            const senderId = String(data.message.senderId?._id || data.message.senderId);
            const currentUserId = String(user._id);
            const messageFromMe = senderId === currentUserId;

            if (!messageFromMe) {
                setMessages(prev => [...prev, data.message]);
            }
        }
    };

    const handleTyping = (data) => {
        if (data.conversationId === conversationId && data.userId !== user._id) {
            setIsTyping(data.isTyping);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTypingIndicator = () => {
        if (socket) {
            socket.emit('typing', {
                conversationId,
                userId: user._id,
                isTyping: true
            });

            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing', {
                    conversationId,
                    userId: user._id,
                    isTyping: false
                });
            }, 2000);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending || !conversationInfo?.otherUser) return;

        setSending(true);
        const content = newMessage.trim();
        setNewMessage('');

        try {
            let response;

            // Check if this is a vendor connection chat or a quotation chat
            if (conversationInfo?.type === 'connection') {
                // Vendor-to-vendor connection chat
                response = await sendVendorMessage(
                    conversationInfo.connectionId,
                    conversationInfo.otherUser._id,
                    content
                );
            } else if (conversationInfo?.type === 'direct' || conversationInfo?.type === 'advertisement' || conversationInfo?.type === 'ad_request') {
                // Direct/ad-based/ad-request customer-vendor chat
                response = await sendDirectMessage(
                    conversationId,
                    conversationInfo.otherUser._id,
                    content
                );
            } else if (conversationInfo?.quotation?._id) {
                // Customer-vendor quotation chat
                response = await sendMessage(
                    conversationInfo.quotation._id,
                    conversationInfo.otherUser._id,
                    content
                );
            } else {
                throw new Error('Unknown conversation type');
            }

            if (response.success) {
                // Add message locally immediately for the sender
                setMessages(prev => [...prev, response.data]);

                // Broadcast via socket to the other user
                if (socket && conversationInfo?.otherUser?._id) {
                    socket.emit('sendMessage', {
                        conversationId,
                        receiverId: conversationInfo.otherUser._id,
                        message: response.data
                    });
                }
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            setNewMessage(content); // Restore message on failure
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
    };

    if (loading) {
        return (
            <div className="chat-loading">
                <div className="loader"></div>
                <p>Loading chat...</p>
            </div>
        );
    }

    const backLink = user?.role === 'vendor'
        ? '/vendor/dashboard'
        : '/customer/dashboard';

    return (
        <div className="chat-page">
            {/* Chat Header */}
            <div className="chat-header">
                <Link to={backLink} className="back-btn">
                    <ArrowLeft size={20} />
                </Link>
                <div className="chat-header-info">
                    <div className="avatar">
                        <User size={24} />
                    </div>
                    <div>
                        <h3>{conversationInfo?.otherUser?.name || 'User'}</h3>
                        <p className="text-muted text-xs">
                            {conversationInfo?.type === 'connection'
                                ? 'Vendor Network'
                                : conversationInfo?.request?.title}
                        </p>
                    </div>
                </div>
                {conversationInfo?.quotation && (
                    <div className="quotation-badge">
                        <IndianRupee size={14} />
                        {conversationInfo.quotation.price}
                    </div>
                )}
                {/* Report Button - Only show for customers when chatting with vendors */}
                {user?.role === 'customer' && conversationInfo?.otherUser && (
                    <button
                        className="report-btn"
                        onClick={() => setShowReportModal(true)}
                        title="Report this vendor"
                    >
                        <Flag size={18} />
                    </button>
                )}
                {/* Admin viewing indicator */}
                {user?.role === 'admin' && (
                    <span className="admin-viewing-badge">🔍 Admin View</span>
                )}
            </div>

            {/* Report Modal */}
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                vendorId={conversationInfo?.otherUser?._id}
                vendorName={conversationInfo?.otherUser?.name}
                quotationId={conversationInfo?.quotation?._id}
                conversationId={conversationId}
            />

            {/* Messages Area */}
            <div className="messages-container">
                <div className="messages-list">
                    {messages.map((msg, index) => {
                        const senderId = msg.senderId?._id || msg.senderId;
                        const isFromMe = senderId?.toString() === user?._id?.toString();
                        const showDate = index === 0 ||
                            formatDate(messages[index - 1]?.createdAt) !== formatDate(msg.createdAt);

                        const senderName = msg.senderId?.businessName || msg.senderId?.name || 'Unknown';
                        // For ad-based/direct conversations, check if sender is the vendor
                        const isVendorMessage = conversationInfo?.type === 'advertisement' || conversationInfo?.type === 'direct'
                            ? senderId?.toString() === conversationInfo?.otherUser?._id?.toString()
                            : (conversationInfo?.quotation
                                ? senderId?.toString() === conversationInfo?.otherUser?._id?.toString()
                                : false);

                        return (
                            <div key={msg._id || index} className={`message-wrapper ${user?.role === 'admin' ? (isVendorMessage ? 'admin-vendor' : 'admin-customer') : (isFromMe ? 'sent' : 'received')}`}>
                                {showDate && (
                                    <div className="date-separator">
                                        <span>{formatDate(msg.createdAt)}</span>
                                    </div>
                                )}
                                {/* Admin view: Show sender label */}
                                {user?.role === 'admin' && (
                                    <div className={`sender-label ${isVendorMessage ? 'vendor' : 'customer'}`}>
                                        {isVendorMessage ? '🏪 Vendor' : '👤 Customer'}: {senderName}
                                    </div>
                                )}
                                <div className={`message ${user?.role === 'admin' ? (isVendorMessage ? 'vendor-msg' : 'customer-msg') : (isFromMe ? 'sent' : 'received')}`}>
                                    <div className="message-content">
                                        <p>{msg.content}</p>
                                        <span className="message-time">
                                            {formatTime(msg.createdAt)}
                                            {isFromMe && msg.readAt && (
                                                <CheckCheck size={14} className="read-icon" />
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {isTyping && (
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input - Hide for admins (view only) */}
            {user?.role === 'admin' ? (
                <div className="admin-notice">
                    🔒 View-only mode - Admins cannot send messages
                </div>
            ) : (
                <form className="message-input-form" onSubmit={handleSend}>
                    <input
                        type="text"
                        className="message-input"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTypingIndicator();
                        }}
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        className="send-btn"
                        disabled={!newMessage.trim() || sending}
                    >
                        <Send size={20} />
                    </button>
                </form>
            )}

            <style>{`
                .chat-page {
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 140px);
                    max-width: 800px;
                    margin: 0 auto;
                    background: var(--color-secondary);
                    border: 1px solid var(--color-gray-200);
                    border-radius: var(--radius-xl);
                    overflow: hidden;
                }

                .chat-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 60vh;
                    gap: var(--space-md);
                }

                .chat-header {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    padding: var(--space-md) var(--space-lg);
                    background: var(--color-primary);
                    color: var(--color-secondary);
                    min-height: 70px;
                    flex-shrink: 0;
                }

                .back-btn {
                    color: var(--color-secondary);
                    padding: var(--space-sm);
                    flex-shrink: 0;
                }

                .chat-header-info {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    flex: 1;
                }

                .avatar {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.1);
                    border-radius: var(--radius-full);
                }

                .chat-header-info h3 {
                    font-size: 1rem;
                    margin: 0;
                }

                .quotation-badge {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    padding: var(--space-xs) var(--space-md);
                    background: var(--color-accent);
                    border-radius: var(--radius-full);
                    font-size: 0.875rem;
                    font-weight: 600;
                }

                .report-btn {
                    padding: var(--space-sm);
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: var(--radius-full);
                    color: var(--color-secondary);
                    cursor: pointer;
                    transition: all var(--transition-base);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .report-btn:hover {
                    background: rgba(239, 68, 68, 0.8);
                }

                .admin-viewing-badge {
                    padding: var(--space-xs) var(--space-md);
                    background: rgba(245, 158, 11, 0.9);
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                }

                .admin-notice {
                    padding: var(--space-md) var(--space-lg);
                    background: linear-gradient(135deg, var(--color-gray-100) 0%, var(--color-gray-200) 100%);
                    text-align: center;
                    font-size: 0.875rem;
                    color: var(--color-gray-600);
                    border-top: 1px solid var(--color-gray-300);
                }

                .messages-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: var(--space-md);
                    background: var(--color-gray-50);
                }

                .messages-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-sm);
                }

                .message-wrapper {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                }

                .message-wrapper.sent {
                    align-items: flex-end;
                }

                .message-wrapper.received {
                    align-items: flex-start;
                }

                /* Admin view: Vendor messages on right, Customer on left */
                .message-wrapper.admin-vendor {
                    align-items: flex-end;
                }

                .message-wrapper.admin-customer {
                    align-items: flex-start;
                }

                .date-separator {
                    text-align: center;
                    padding: var(--space-md) 0;
                }

                .date-separator span {
                    background: var(--color-gray-200);
                    padding: var(--space-xs) var(--space-md);
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    color: var(--color-gray-600);
                }

                .message {
                    display: flex;
                    max-width: 80%;
                }

                .message.sent {
                    align-self: flex-end;
                }

                .message.received {
                    align-self: flex-start;
                }

                .message-content {
                    padding: var(--space-sm) var(--space-md);
                    border-radius: var(--radius-lg);
                    position: relative;
                }

                .message.sent .message-content {
                    background: var(--color-primary);
                    color: var(--color-secondary);
                    border-bottom-right-radius: 4px;
                }

                .message.received .message-content {
                    background: var(--color-secondary);
                    border: 1px solid var(--color-gray-200);
                    border-bottom-left-radius: 4px;
                }

                /* Admin view: Sender labels */
                .sender-label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: var(--radius-sm);
                    margin-bottom: 4px;
                    display: inline-block;
                }

                .sender-label.vendor {
                    background: rgba(16, 185, 129, 0.15);
                    color: #059669;
                }

                .sender-label.customer {
                    background: rgba(59, 130, 246, 0.15);
                    color: #2563eb;
                }

                /* Admin view: Message colors */
                .message.vendor-msg {
                    align-self: flex-end;
                }

                .message.vendor-msg .message-content {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .message.customer-msg {
                    align-self: flex-start;
                }

                .message.customer-msg .message-content {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border-bottom-left-radius: 4px;
                }

                .message-content p {
                    margin: 0;
                    word-wrap: break-word;
                }

                .message-time {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    font-size: 0.625rem;
                    opacity: 0.7;
                    margin-top: var(--space-xs);
                    justify-content: flex-end;
                }

                .read-icon {
                    color: var(--color-accent);
                }

                .typing-indicator {
                    display: flex;
                    gap: 4px;
                    padding: var(--space-md);
                    align-self: flex-start;
                }

                .typing-indicator span {
                    width: 8px;
                    height: 8px;
                    background: var(--color-gray-400);
                    border-radius: 50%;
                    animation: typing 1.4s infinite ease-in-out both;
                }

                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

                @keyframes typing {
                    0%, 80%, 100% { transform: scale(0.6); }
                    40% { transform: scale(1); }
                }

                .message-input-form {
                    display: flex;
                    gap: var(--space-sm);
                    padding: var(--space-md);
                    background: var(--color-secondary);
                    border-top: 1px solid var(--color-gray-200);
                }

                .message-input {
                    flex: 1;
                    padding: var(--space-md);
                    border: 1px solid var(--color-gray-200);
                    border-radius: var(--radius-full);
                    font-size: 0.875rem;
                    outline: none;
                    transition: border-color var(--transition-base);
                }

                .message-input:focus {
                    border-color: var(--color-primary);
                }

                .send-btn {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--color-primary);
                    color: var(--color-secondary);
                    border: none;
                    border-radius: var(--radius-full);
                    cursor: pointer;
                    transition: all var(--transition-base);
                }

                .send-btn:hover:not(:disabled) {
                    background: var(--color-primary-light);
                    transform: scale(1.05);
                }

                .send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .chat-page {
                        height: calc(100vh - 80px);
                        border-radius: 0;
                        border: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default Chat;
