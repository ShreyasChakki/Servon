import { useState, useEffect } from 'react';
import { getTransactions, addFunds } from '../../services/walletService';
import {
    Wallet as WalletIcon,
    IndianRupee,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    AlertCircle,
    CheckCircle,
    History
} from 'lucide-react';

const QUICK_ADD_AMOUNTS = [50, 100, 200, 500];

const Wallet = () => {
    const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
    const [loading, setLoading] = useState(true);
    const [addAmount, setAddAmount] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = async () => {
        try {
            const response = await getTransactions();
            if (response.success) {
                setWallet(response.data);
            }
        } catch (err) {
            setError('Failed to load wallet');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFunds = async (amount) => {
        const addVal = amount || Number(addAmount);
        if (!addVal || addVal <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setAdding(true);
        setError('');
        setSuccess('');

        try {
            const response = await addFunds(addVal);
            if (response.success) {
                setSuccess(`Successfully added ₹${addVal}!`);
                setAddAmount('');
                fetchWallet();
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add funds');
        } finally {
            setAdding(false);
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

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loader"></div>
                <p>Loading wallet...</p>
            </div>
        );
    }

    return (
        <div className="wallet-page">
            <div className="container">
                <div className="page-header">
                    <h1>Wallet</h1>
                    <p className="text-muted">Manage your wallet balance and transactions</p>
                </div>

                {/* Balance Card */}
                <div className="balance-card card card-dark">
                    <div className="balance-header">
                        <WalletIcon size={32} />
                        <span>Available Balance</span>
                    </div>
                    <div className="balance-amount">
                        <IndianRupee size={36} />
                        <span>{wallet.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="balance-note">₹1 is deducted per quotation sent</p>
                </div>

                {/* Add Funds Section */}
                <div className="add-funds-section card">
                    <h3>
                        <Plus size={20} />
                        Add Funds
                    </h3>

                    {error && (
                        <div className="alert alert-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <CheckCircle size={18} />
                            <span>{success}</span>
                        </div>
                    )}

                    <div className="quick-add">
                        {QUICK_ADD_AMOUNTS.map(amt => (
                            <button
                                key={amt}
                                className="quick-add-btn btn btn-secondary"
                                onClick={() => handleAddFunds(amt)}
                                disabled={adding}
                            >
                                +₹{amt}
                            </button>
                        ))}
                    </div>

                    <div className="custom-add">
                        <div className="input-with-icon">
                            <IndianRupee className="input-icon" size={18} />
                            <input
                                type="number"
                                className="input"
                                placeholder="Custom amount"
                                min="1"
                                value={addAmount}
                                onChange={(e) => { setAddAmount(e.target.value); setError(''); }}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleAddFunds()}
                            disabled={adding || !addAmount}
                        >
                            {adding ? (
                                <>
                                    <span className="loader"></span>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    Add
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="transactions-section">
                    <h3>
                        <History size={20} />
                        Transaction History
                    </h3>

                    {wallet.transactions.length === 0 ? (
                        <div className="empty-transactions card">
                            <History size={40} className="empty-icon" />
                            <p>No transactions yet</p>
                        </div>
                    ) : (
                        <div className="transactions-list">
                            {wallet.transactions.map((txn, index) => (
                                <div key={index} className={`txn-item card ${txn.type}`}>
                                    <div className="txn-icon">
                                        {txn.type === 'credit' ? (
                                            <ArrowDownLeft size={20} />
                                        ) : (
                                            <ArrowUpRight size={20} />
                                        )}
                                    </div>
                                    <div className="txn-details">
                                        <span className="txn-description">{txn.description}</span>
                                        <span className="txn-date">{formatDate(txn.timestamp)}</span>
                                    </div>
                                    <div className={`txn-amount ${txn.type}`}>
                                        {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .wallet-page {
          padding: var(--space-lg) 0;
        }

        .page-header {
          margin-bottom: var(--space-xl);
        }

        .page-header h1 {
          font-size: 2rem;
          margin-bottom: var(--space-xs);
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: var(--space-md);
        }

        .balance-card {
          padding: var(--space-2xl);
          margin-bottom: var(--space-xl);
        }

        .balance-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          font-size: 0.875rem;
          color: var(--color-gray-400);
          margin-bottom: var(--space-lg);
        }

        .balance-amount {
          display: flex;
          align-items: center;
          font-family: var(--font-display);
          font-size: 3rem;
          font-weight: 700;
        }

        .balance-note {
          margin-top: var(--space-lg);
          font-size: 0.75rem;
          color: var(--color-gray-500);
        }

        .add-funds-section {
          padding: var(--space-xl);
          margin-bottom: var(--space-xl);
        }

        .add-funds-section h3 {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 1.125rem;
          margin-bottom: var(--space-lg);
        }

        .alert {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          margin-bottom: var(--space-lg);
        }

        .alert-error {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--color-error);
        }

        .alert-success {
          background-color: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
        }

        .quick-add {
          display: flex;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
          flex-wrap: wrap;
        }

        .quick-add-btn {
          flex: 1;
          min-width: 100px;
        }

        .custom-add {
          display: flex;
          gap: var(--space-md);
        }

        .custom-add .input-with-icon {
          flex: 1;
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-gray-400);
        }

        .custom-add .input {
          padding-left: 2.5rem;
        }

        .transactions-section h3 {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 1.25rem;
          margin-bottom: var(--space-lg);
        }

        .empty-transactions {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-3xl);
          text-align: center;
        }

        .empty-icon {
          color: var(--color-gray-300);
          margin-bottom: var(--space-md);
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .txn-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md) var(--space-lg);
        }

        .txn-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-full);
        }

        .txn-item.credit .txn-icon {
          background-color: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
        }

        .txn-item.debit .txn-icon {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--color-error);
        }

        .txn-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .txn-description {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .txn-date {
          font-size: 0.75rem;
          color: var(--color-gray-500);
        }

        .txn-amount {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 600;
        }

        .txn-amount.credit {
          color: var(--color-success);
        }

        .txn-amount.debit {
          color: var(--color-error);
        }

        @media (max-width: 768px) {
          .balance-amount {
            font-size: 2.5rem;
          }

          .quick-add {
            flex-wrap: wrap;
          }

          .quick-add-btn {
            flex: 1 1 40%;
          }

          .custom-add {
            flex-direction: column;
          }
        }
      `}</style>
        </div>
    );
};

export default Wallet;
