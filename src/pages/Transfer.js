import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { toast } from 'react-toastify';
import './Transfer.css';

const Transfer = () => {
  const { isConnected, account, contract, provider } = useWeb3();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState('0');
  const [ethPrice, setEthPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactionPending, setTransactionPending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (isConnected && account && provider) {
        try {
          // Fetch wallet balance
          const balance = await provider.getBalance(account);
          setWalletBalance(ethers.utils.formatEther(balance));
          
          // Fetch ETH price
          try {
            const response = await fetch(
              'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
            );
            const data = await response.json();
            setEthPrice(data.ethereum.usd);
          } catch (error) {
            console.error('Error fetching ETH price:', error);
          }
        } catch (error) {
          console.error('Error fetching wallet balance:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    
    return () => clearInterval(intervalId);
  }, [isConnected, account, provider]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!ethers.utils.isAddress(recipientAddress)) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(amount) > parseFloat(walletBalance)) {
      toast.error('Insufficient balance');
      return;
    }
    
    try {
      setTransactionPending(true);
      
      // Use the contract's transfer function
      const tx = await contract.transfer(recipientAddress, {
        value: ethers.utils.parseEther(amount)
      });
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      
      // Wait for transaction to be mined
      await tx.wait();
      
      toast.success('Transfer successful!');
      
      // Refresh wallet balance
      const balance = await provider.getBalance(account);
      setWalletBalance(ethers.utils.formatEther(balance));
      
      // Reset form
      setRecipientAddress('');
      setAmount('');
    } catch (error) {
      console.error('Error transferring ETH:', error);
      toast.error('Failed to transfer: ' + (error.message || 'Unknown error'));
    } finally {
      setTransactionPending(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="transfer-page">
      <h1 className="page-title">Transfer</h1>
      
      {isConnected ? (
        <div className="transfer-content">
          <div className="wallet-info-card">
            <h2>Your Wallet</h2>
            <div className="wallet-address">{account}</div>
            <div className="balance-amount">{parseFloat(walletBalance).toFixed(4)} ETH</div>
            {ethPrice && (
              <div className="balance-usd">
                ${(parseFloat(walletBalance) * ethPrice).toFixed(2)} USD
              </div>
            )}
          </div>
          
          <div className="transfer-form-card">
            <h2>Send ETH</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="recipientAddress">Recipient Address</label>
                <input
                  type="text"
                  id="recipientAddress"
                  className="form-control"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  disabled={transactionPending}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="amount">Amount (ETH)</label>
                <input
                  type="number"
                  id="amount"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.001"
                  min="0"
                  max={walletBalance}
                  disabled={transactionPending}
                  required
                />
                {ethPrice && amount && (
                  <div className="amount-usd">
                    ≈ ${(parseFloat(amount || 0) * ethPrice).toFixed(2)} USD
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={transactionPending}
              >
                {transactionPending ? 'Processing...' : 'Send ETH'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="connect-wallet-container">
          <div className="connect-wallet-icon">💸</div>
          <h2 className="connect-wallet-title">Connect Your Wallet</h2>
          <p className="connect-wallet-description">
            Connect your MetaMask wallet to transfer ETH to other addresses.
          </p>
        </div>
      )}
    </div>
  );
};

export default Transfer;