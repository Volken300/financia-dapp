import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { isConnected, account, contract, provider } = useWeb3();
  const [balance, setBalance] = useState('0');
  const [ethPrice, setEthPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (isConnected && account && provider) {
        try {
          // Fetch wallet balance
          const balanceWei = await provider.getBalance(account);
          setBalance(ethers.utils.formatEther(balanceWei));
          
          // Fetch ETH price data from CoinGecko
          const response = await axios.get(
            'https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false'
          );
          
          setEthPrice(response.data.market_data.current_price.usd);
          setPriceChange(response.data.market_data.price_change_percentage_24h);
          
          // Fetch price history for the chart
          const historyResponse = await axios.get(
            'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7&interval=daily'
          );
          
          const formattedHistory = historyResponse.data.prices.map(item => ({
            date: new Date(item[0]).toLocaleDateString(),
            price: parseFloat(item[1].toFixed(2))
          }));
          
          setPriceHistory(formattedHistory);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Fetch only ETH price data if not connected
        try {
          const response = await axios.get(
            'https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false'
          );
          
          setEthPrice(response.data.market_data.current_price.usd);
          setPriceChange(response.data.market_data.price_change_percentage_24h);
          
          // Fetch price history for the chart
          const historyResponse = await axios.get(
            'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7&interval=daily'
          );
          
          const formattedHistory = historyResponse.data.prices.map(item => ({
            date: new Date(item[0]).toLocaleDateString(),
            price: parseFloat(item[1].toFixed(2))
          }));
          
          setPriceHistory(formattedHistory);
        } catch (error) {
          console.error('Error fetching ETH price data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    // Set up interval to refresh data every 60 seconds
    const intervalId = setInterval(fetchData, 60000);
    
    return () => clearInterval(intervalId);
  }, [isConnected, account, provider]);

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      
      {isConnected ? (
        <div className="dashboard-content">
          <div className="wallet-card">
            <h2>Your Wallet</h2>
            <div className="wallet-address">{account}</div>
            <div className="balance-amount">{parseFloat(balance).toFixed(4)} ETH</div>
            {ethPrice && (
              <div className="balance-usd">
                ${(parseFloat(balance) * ethPrice).toFixed(2)} USD
              </div>
            )}
          </div>
          
          <div className="price-chart-container">
            <h2>ETH Price</h2>
            <div className="price-info">
              <div className="current-price">${ethPrice?.toFixed(2)}</div>
              <div className={`price-change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange?.toFixed(2)}%
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3498db" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="connect-wallet-container">
          <div className="connect-wallet-icon">💰</div>
          <h2 className="connect-wallet-title">Connect Your Wallet</h2>
          <p className="connect-wallet-description">
            Connect your MetaMask wallet to view your balance, make transfers, and track your transaction history.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;