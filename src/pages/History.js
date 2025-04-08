import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import './History.css';

const History = () => {
  const { isConnected, account, contract } = useWeb3();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (isConnected && contract) {
        try {
          setLoading(true);
          const history = await contract.getTransactionHistory();
          
          // Format and sort transactions by timestamp (newest first)
          const formattedTransactions = history.map(tx => ({
            from: tx.from,
            to: tx.to,
            amount: ethers.utils.formatEther(tx.amount),
            timestamp: new Date(tx.timestamp.toNumber() * 1000),
            type: tx.transactionType
          }));
          
          // Sort by timestamp (newest first)
          formattedTransactions.sort((a, b) => b.timestamp - a.timestamp);
          
          setTransactions(formattedTransactions);
        } catch (error) {
          console.error('Error fetching transaction history:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchTransactionHistory();
    
    // Set up event listener for contract events
    if (isConnected && contract) {
      const depositFilter = contract.filters.Deposit(account);
      const withdrawalFilter = contract.filters.Withdrawal(account);
      const transferFilter = contract.filters.Transfer(null, null);
      
      const handleEvent = () => {
        fetchTransactionHistory();
      };
      
      contract.on(depositFilter, handleEvent);
      contract.on(withdrawalFilter, handleEvent);
      contract.on(transferFilter, handleEvent);
      
      return () => {
        contract.off(depositFilter, handleEvent);
        contract.off(withdrawalFilter, handleEvent);
        contract.off(transferFilter, handleEvent);
      };
    }
  }, [isConnected, account, contract]);

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format address for display
  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Determine if the transaction is incoming or outgoing relative to the current user
  const getTransactionDirection = (tx) => {
    if (tx.type === 'Deposit') return 'deposit';
    if (tx.type === 'Withdrawal') return 'withdrawal';
    
    // For transfers
    if (tx.from.toLowerCase() === account?.toLowerCase()) {
      return 'outgoing';
    } else if (tx.to.toLowerCase() === account?.toLowerCase()) {
      return 'incoming';
    } else {
      return 'other';
    }
  };

  return (
    <div className="history-page">
      <h1 className="page-title">Transaction History</h1>
      
      {isConnected ? (
        <div className="history-content">
          {loading ? (
            <div className="loading-spinner"></div>
          ) : transactions.length > 0 ? (
            <ul className="transaction-list">
              {transactions.map((tx, index) => {
                const direction = getTransactionDirection(tx);
                
                return (
                  <li key={index} className={`transaction-item ${direction}`}>
                    <div className="transaction-info">
                      <div className="transaction-type">
                        {tx.type}
                        <span className="transaction-direction">
                          {direction === 'incoming' && ' (Received)'}
                          {direction === 'outgoing' && ' (Sent)'}
                        </span>
                      </div>
                      
                      <div className="transaction-addresses">
                        {tx.from !== ethers.constants.AddressZero && (
                          <div className="transaction-from">
                            From: <span className="address">{formatAddress(tx.from)}</span>
                            {tx.from.toLowerCase() === account?.toLowerCase() && ' (You)'}
                          </div>
                        )}
                        
                        {tx.to !== ethers.constants.AddressZero && (
                          <div className="transaction-to">
                            To: <span className="address">{formatAddress(tx.to)}</span>
                            {tx.to.toLowerCase() === account?.toLowerCase() && ' (You)'}
                          </div>
                        )}
                      </div>
                      
                      <div className="transaction-date">
                        {formatDate(tx.timestamp)}
                      </div>
                    </div>
                    
                    <div className={`transaction-amount ${direction === 'incoming' || direction === 'deposit' ? 'positive' : 'negative'}`}>
                      {direction === 'incoming' || direction === 'deposit' ? '+' : '-'}
                      {parseFloat(tx.amount).toFixed(4)} ETH
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="no-transactions">
              <div className="no-data-icon">📝</div>
              <h2>No Transactions Yet</h2>
              <p>Your transaction history will appear here once you make deposits, withdrawals, or transfers.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="connect-wallet-container">
          <div className="connect-wallet-icon">📊</div>
          <h2 className="connect-wallet-title">Connect Your Wallet</h2>
          <p className="connect-wallet-description">
            Connect your MetaMask wallet to view your transaction history.
          </p>
        </div>
      )}
    </div>
  );
};

export default History;