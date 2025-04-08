import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import './Market.css';

const Market = () => {
  const [ethData, setEthData] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [timeRange, setTimeRange] = useState('7d'); // 24h, 7d, 30d, 90d
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        
        // Fetch current ETH data
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false'
        );
        
        setEthData(response.data);
        
        // Fetch price history based on selected time range
        let days = '7';
        let interval = 'daily';
        
        switch (timeRange) {
          case '24h':
            days = '1';
            interval = 'hourly';
            break;
          case '7d':
            days = '7';
            interval = 'daily';
            break;
          case '30d':
            days = '30';
            interval = 'daily';
            break;
          case '90d':
            days = '90';
            interval = 'daily';
            break;
          default:
            days = '7';
            interval = 'daily';
        }
        
        const historyResponse = await axios.get(
          `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=${days}&interval=${interval}`
        );
        
        // Format price history data
        const formattedHistory = historyResponse.data.prices.map(item => {
          const date = new Date(item[0]);
          return {
            timestamp: date.getTime(),
            date: timeRange === '24h' 
              ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : date.toLocaleDateString(),
            price: parseFloat(item[1].toFixed(2))
          };
        });
        
        setPriceHistory(formattedHistory);
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    
    // Set up interval to refresh data
    const intervalTime = timeRange === '24h' ? 60000 : 300000; // 1 min for 24h, 5 mins for others
    const intervalId = setInterval(fetchMarketData, intervalTime);
    
    return () => clearInterval(intervalId);
  }, [timeRange]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  if (loading && !ethData) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="market-page">
      <h1 className="page-title">Market</h1>
      
      <div className="market-content">
        {ethData && (
          <div className="price-overview-card">
            <div className="price-header">
              <div className="coin-info">
                <img 
                  src={ethData.image.small} 
                  alt="Ethereum" 
                  className="coin-icon" 
                />
                <h2>{ethData.name} ({ethData.symbol.toUpperCase()})</h2>
              </div>
              <div className="price-data">
                <div className="current-price">
                  ${ethData.market_data.current_price.usd.toLocaleString()}
                </div>
                <div className={`price-change ${ethData.market_data.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
                  {ethData.market_data.price_change_percentage_24h >= 0 ? '+' : ''}
                  {ethData.market_data.price_change_percentage_24h.toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div className="market-stats">
              <div className="stat-item">
                <div className="stat-label">Market Cap</div>
                <div className="stat-value">${ethData.market_data.market_cap.usd.toLocaleString()}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">24h Volume</div>
                <div className="stat-value">${ethData.market_data.total_volume.usd.toLocaleString()}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">24h High</div>
                <div className="stat-value">${ethData.market_data.high_24h.usd.toLocaleString()}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">24h Low</div>
                <div className="stat-value">${ethData.market_data.low_24h.usd.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="price-chart-card">
          <div className="chart-header">
            <h2>Price Chart</h2>
            <div className="time-range-selector">
              <button 
                className={`time-button ${timeRange === '24h' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('24h')}
              >
                24H
              </button>
              <button 
                className={`time-button ${timeRange === '7d' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('7d')}
              >
                7D
              </button>
              <button 
                className={`time-button ${timeRange === '30d' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('30d')}
              >
                30D
              </button>
              <button 
                className={`time-button ${timeRange === '90d' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('90d')}
              >
                90D
              </button>
            </div>
          </div>
          
          {priceHistory.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={priceHistory}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3498db" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3498db" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickMargin={10}
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Price']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#3498db" 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="loading-spinner"></div>
          )}
        </div>
        
        <div className="market-description-card">
          <h2>About Ethereum</h2>
          {ethData && (
            <div className="description">
              <p>
                Ethereum is a decentralized, open-source blockchain with smart contract functionality. 
                Ether (ETH) is the native cryptocurrency of the platform. It is the second-largest 
                cryptocurrency by market capitalization, after Bitcoin.
              </p>
              <p>
                Ethereum is used for a wide range of decentralized applications (dApps), 
                decentralized finance (DeFi), and non-fungible tokens (NFTs).
              </p>
              <div className="links">
                <a href={ethData.links.homepage[0]} target="_blank" rel="noopener noreferrer">
                  Official Website
                </a>
                <a href={`https://etherscan.io/`} target="_blank" rel="noopener noreferrer">
                  Etherscan
                </a>
                <a href={ethData.links.blockchain_site[0]} target="_blank" rel="noopener noreferrer">
                  Block Explorer
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Market;