import { X, User, MapPin, Calendar, FileText } from 'lucide-react';

const CustomerInfoModal = ({ customer, onClose }) => {
    if (!customer) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="customer-header">
                    <div className="customer-avatar">
                        <User size={32} />
                    </div>
                    <h2>{customer.name}</h2>
                    <span className="customer-badge">Customer</span>
                </div>

                <div className="customer-details">
                    {customer.location && (
                        <div className="detail-item">
                            <MapPin size={16} />
                            <span>{customer.location}</span>
                        </div>
                    )}
                    {customer.memberSince && (
                        <div className="detail-item">
                            <Calendar size={16} />
                            <span>Member since {customer.memberSince}</span>
                        </div>
                    )}
                    {customer.requestsCount !== undefined && (
                        <div className="detail-item">
                            <FileText size={16} />
                            <span>{customer.requestsCount} service requests posted</span>
                        </div>
                    )}
                </div>

                <p className="customer-note">
                    This customer is looking for quality service providers.
                </p>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.2s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .modal-content {
                    background: var(--color-secondary);
                    border-radius: var(--radius-xl);
                    padding: var(--space-2xl);
                    width: 90%;
                    max-width: 400px;
                    position: relative;
                    animation: slideUp 0.3s ease;
                    box-shadow: var(--shadow-lg);
                }

                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .modal-close {
                    position: absolute;
                    top: var(--space-md);
                    right: var(--space-md);
                    background: none;
                    border: none;
                    color: var(--color-gray-400);
                    cursor: pointer;
                    padding: var(--space-xs);
                    border-radius: var(--radius-md);
                    transition: all var(--transition-base);
                }

                .modal-close:hover {
                    background: var(--color-gray-100);
                    color: var(--color-gray-600);
                }

                .customer-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    margin-bottom: var(--space-xl);
                }

                .customer-avatar {
                    width: 80px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--color-accent), #818cf8);
                    border-radius: var(--radius-full);
                    color: white;
                    margin-bottom: var(--space-md);
                }

                .customer-header h2 {
                    font-size: 1.5rem;
                    margin-bottom: var(--space-xs);
                }

                .customer-badge {
                    display: inline-block;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--color-accent);
                    background: rgba(99, 102, 241, 0.1);
                    padding: var(--space-xs) var(--space-md);
                    border-radius: var(--radius-full);
                }

                .customer-details {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-md);
                    padding: var(--space-lg);
                    background: var(--color-gray-50);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--space-lg);
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    font-size: 0.875rem;
                    color: var(--color-gray-600);
                }

                .detail-item svg {
                    color: var(--color-accent);
                    flex-shrink: 0;
                }

                .customer-note {
                    text-align: center;
                    font-size: 0.875rem;
                    color: var(--color-gray-500);
                    font-style: italic;
                }
            `}</style>
        </div>
    );
};

export default CustomerInfoModal;
