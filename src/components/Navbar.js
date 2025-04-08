import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const { isConnected, account, loading, connectWallet } = useWeb3();

  // Function to format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Financia</span>
        </Link>

        <div className="navbar-menu">
          <Link 
            to="/" 
            className={`navbar-item ${location.pathname === '/' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/balance" 
            className={`navbar-item ${location.pathname === '/balance' ? 'active' : ''}`}
          >
            Balance
          </Link>
          <Link 
            to="/transfer" 
            className={`navbar-item ${location.pathname === '/transfer' ? 'active' : ''}`}
          >
            Transfer
          </Link>
          <Link 
            to="/history" 
            className={`navbar-item ${location.pathname === '/history' ? 'active' : ''}`}
          >
            History
          </Link>
          <Link 
            to="/market" 
            className={`navbar-item ${location.pathname === '/market' ? 'active' : ''}`}
          >
            Market
          </Link>
        </div>

        <div className="navbar-end">
          {isConnected ? (
            <div className="connected-account">
              <span className="account-address">{formatAddress(account)}</span>
            </div>
          ) : (
            <button 
              className="btn btn-primary connect-button" 
              onClick={connectWallet}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;