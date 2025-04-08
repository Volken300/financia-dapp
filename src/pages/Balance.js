import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { toast } from 'react-toastify';
import './Balance.css';

const Balance = () => {
  const { isConnected, account, contract, provider } = useWeb3();
  const [walletBalance, setWalletBalance] = useState('0');
  const [contractBalance, setContractBalance] = useState('0');
  const [ethPrice, setEthPrice] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [transactionPending, setTransactionPending] = useState(false);

  useEffect(() => {
    const fetchBalances = async () => {
      if (isConnected && account && provider && contract) {
        try {
          // Fetch wallet balance
          const balance = await provider.getBalance(account);
          setWalletBalance(ethers.utils.formatEther(balance));
          
          // Fetch contract balance
          const contractBal = await contract.getBalance();
          setContractBalance(ethers.utils.formatEther(contractBal));
          
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
          console.error('Error fetching balances:', error);
          toast.error('Failed to fetch balances');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchBalances();
    
    // Set up interval to refresh balances every 30 seconds
    const intervalId = setInterval(fetchBalances, 30000);
    
    return () => clearInterval(intervalId);
  }, [isConnected, account, provider, contract]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!isConnected || !contract) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setTransactionPending(true);
      const tx = await contract.deposit({
        value: ethers.utils.parseEther(depositAmount)
      });
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      
      // Wait for transaction to be mined
      await tx.wait();
      
      toast.success('Deposit successful!');
      
      // Refresh balances
      const walletBal = await provider.getBalance(account);
      setWalletBalance(ethers.utils.formatEther(walletBal));
      
      const contractBal = await contract.getBalance();
      setContractBalance(ethers.utils.formatEther(contractBal));
      
      // Reset form
      setDepositAmount('');
    } catch (error) {
      console.error('Error depositing ETH:', error);
      toast.error('Failed to deposit: ' + (error.message || 'Unknown error'));
    } finally {
      setTransactionPending(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!isConnected || !contract) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > parseFloat(contractBalance)) {
      toast.error('Insufficient balance in contract');
      return;
    }

    try {
      setTransactionPending(true);
      const tx = await contract.withdraw(
        ethers.utils.parseEther(withdrawAmount)
      );
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      
      // Wait for transaction to be mined
      await tx.wait();
      
      toast.success('Withdrawal successful!');
      
      // Refresh balances
      const walletBal = await provider.getBalance(account);
      setWalletBalance(ethers.utils.formatEther(walletBal));
      
      const contractBal = await contract.getBalance();
      setContractBalance(ethers.utils.formatEther(contractBal));
      
      // Reset form
      setWithdrawAmount('');
    } catch (error) {
      console.error('Error withdrawing ETH:', error);
      toast.error('Failed to withdraw: ' + (error.message || 'Unknown error'));
    } finally {
      setTransactionPending(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="balance-page">
      <h1 className="page-title">Balance</h1>
      
      {isConnected ? (
        <div className="balance-content">
          <div className="balance-cards">
            <div className="balance-card wallet-balance">
              <h2>Wallet Balance</h2>
              <div className="balance-amount">{parseFloat(walletBalance).toFixed(4)} ETH</div>
              {ethPrice && (
                <div className="balance-usd">
                  ${(parseFloat(walletBalance) * ethPrice).toFixed(2)} USD
                </div>
              )}
            </div>
            
            <div className="balance-card contract-balance">
              <h2>Contract Balance</h2>
              <div className="balance-amount">{parseFloat(contractBalance).toFixed(4)} ETH</div>
              {ethPrice && (
                <div className="balance-usd">
                  ${(parseFloat(contractBalance) * ethPrice).toFixed(2)} USD
                </div>
              )}
            </div>
          </div>
          
          <div className="balance-actions">
            <div className="action-card">
              <h2>Deposit ETH</h2>
              <form onSubmit={handleDeposit}>
                <div className="form-group">
                  <label htmlFor="depositAmount">Amount (ETH)</label>
                  <input
                    type="number"
                    id="depositAmount"
                    className="form-control"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.001"
                    min="0"
                    disabled={transactionPending}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={transactionPending}
                >
                  {transactionPending ? 'Processing...' : 'Deposit'}
                </button>
              </form>
            </div>
            
            <div className="action-card">
              <h2>Withdraw ETH</h2>
              <form onSubmit={handleWithdraw}>
                <div className="form-group">
                  <label htmlFor="withdrawAmount">Amount (ETH)</label>
                  <input
                    type="number"
                    id="withdrawAmount"
                    className="form-control"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.001"
                    min="0"
                    max={contractBalance}
                    disabled={transactionPending}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={transactionPending || parseFloat(contractBalance) === 0}
                >
                  {transactionPending ? 'Processing...' : 'Withdraw'}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="connect-wallet-container">
          <div className="connect-wallet-icon">💰</div>
          <h2 className="connect-wallet-title">Connect Your Wallet</h2>
          <p className="connect-wallet-description">
            Connect your MetaMask wallet to view your balance, make deposits, and withdrawals.
          </p>
        </div>
      )}
    </div>
  );
};

export default Balance;