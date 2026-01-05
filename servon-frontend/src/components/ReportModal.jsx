import { useState } from 'react';
import { createReport } from '../services/reportService';
import { AlertTriangle, X, Send, CheckCircle } from 'lucide-react';

const REPORT_REASONS = [
    { value: 'scam', label: 'Scam / Fraud' },
    { value: 'harassment', label: 'Harassment / Abusive behavior' },
    { value: 'fake_service', label: 'Fake service / Did not deliver' },
    { value: 'unprofessional', label: 'Unprofessional conduct' },
    { value: 'other', label: 'Other' }
];

const ReportModal = ({ isOpen, onClose, vendorId, vendorName, quotationId, conversationId }) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Debug logging
        console.log('Report submission:', { vendorId, quotationId, conversationId, reason, description });

        if (!reason || !description.trim()) {
            setError('Please select a reason and provide a description');
            return;
        }

        if (!vendorId) {
            setError('Vendor information is missing. Please try again.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await createReport({
                vendorId,
                quotationId,
                conversationId,
                reason,
                description: description.trim()
            });
            console.log('Report submitted successfully:', response);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setReason('');
                setDescription('');
            }, 2000);
        } catch (err) {
            console.error('Report submission error:', err);
            setError(err.response?.data?.error || err.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {success ? (
                    <div className="success-state">
                        <CheckCircle size={48} className="success-icon" />
                        <h3>Report Submitted</h3>
                        <p>Thank you. Our team will review your report shortly.</p>
                    </div>
                ) : (
                    <>
                        <div className="modal-header">
                            <div className="modal-title">
                                <AlertTriangle size={24} className="warning-icon" />
                                <h2>Report Vendor</h2>
                            </div>
                            <button className="close-btn" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <p className="report-info">
                                Reporting: <strong>{vendorName || 'Vendor'}</strong>
                            </p>

                            {error && (
                                <div className="alert alert-error">
                                    <AlertTriangle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="reason">Reason for Report *</label>
                                    <select
                                        id="reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="input"
                                        required
                                    >
                                        <option value="">Select a reason</option>
                                        {REPORT_REASONS.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Description *</label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="input textarea"
                                        placeholder="Please describe the issue in detail. Include any relevant information that will help us investigate."
                                        rows={5}
                                        maxLength={2000}
                                        required
                                    />
                                    <span className="char-count">{description.length}/2000</span>
                                </div>

                                <div className="modal-actions">
                                    {!description.trim() && reason && (
                                        <span className="helper-text">Please add a description</span>
                                    )}
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-danger"
                                        disabled={loading || !reason || !description.trim()}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="loader"></span>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} />
                                                Submit Report
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}

                <style>{`
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        padding: var(--space-md);
                    }

                    .modal-content {
                        background: var(--color-secondary);
                        border-radius: var(--radius-xl);
                        width: 100%;
                        max-width: 500px;
                        max-height: 90vh;
                        overflow-y: auto;
                        box-shadow: var(--shadow-xl);
                    }

                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: var(--space-lg);
                        border-bottom: 1px solid var(--color-gray-200);
                    }

                    .modal-title {
                        display: flex;
                        align-items: center;
                        gap: var(--space-sm);
                    }

                    .modal-title h2 {
                        font-size: 1.25rem;
                        margin: 0;
                    }

                    .warning-icon {
                        color: var(--color-warning);
                    }

                    .close-btn {
                        background: none;
                        border: none;
                        cursor: pointer;
                        padding: var(--space-xs);
                        color: var(--color-gray-500);
                    }

                    .modal-body {
                        padding: var(--space-lg);
                    }

                    .report-info {
                        margin-bottom: var(--space-lg);
                        color: var(--color-gray-600);
                    }

                    .form-group {
                        margin-bottom: var(--space-lg);
                    }

                    .form-group label {
                        display: block;
                        margin-bottom: var(--space-xs);
                        font-weight: 500;
                    }

                    .textarea {
                        resize: vertical;
                        min-height: 100px;
                    }

                    .char-count {
                        display: block;
                        text-align: right;
                        font-size: 0.75rem;
                        color: var(--color-gray-400);
                        margin-top: var(--space-xs);
                    }

                    .modal-actions {
                        display: flex;
                        justify-content: flex-end;
                        align-items: center;
                        gap: var(--space-md);
                        margin-top: var(--space-lg);
                    }

                    .helper-text {
                        font-size: 0.75rem;
                        color: var(--color-warning);
                        margin-right: auto;
                    }

                    .btn-danger {
                        background: var(--color-error);
                        color: white;
                    }

                    .btn-danger:hover:not(:disabled) {
                        background: #dc2626;
                    }

                    .alert {
                        display: flex;
                        align-items: center;
                        gap: var(--space-sm);
                        padding: var(--space-md);
                        border-radius: var(--radius-md);
                        margin-bottom: var(--space-lg);
                    }

                    .alert-error {
                        background: rgba(239, 68, 68, 0.1);
                        color: var(--color-error);
                    }

                    .success-state {
                        padding: var(--space-3xl);
                        text-align: center;
                    }

                    .success-icon {
                        color: var(--color-success);
                        margin-bottom: var(--space-lg);
                    }

                    .success-state h3 {
                        margin-bottom: var(--space-sm);
                    }

                    .success-state p {
                        color: var(--color-gray-600);
                    }
                `}</style>
            </div>
        </div>
    );
};

export default ReportModal;
