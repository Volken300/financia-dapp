import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

// Components
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Balance from './pages/Balance';
import Transfer from './pages/Transfer';
import History from './pages/History';
import Market from './pages/Market';

// Context
import { Web3Provider } from './context/Web3Context';

// Contract ABI and address
import FinanciaABI from './contracts/FinanciaABI.json';
import { CONTRACT_ADDRESS } from './constants/addresses';

import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if MetaMask is installed
  useEffect(() => {
    const checkMetaMask = async () => {
      if (window.ethereum) {
        try {
          // Listen for account changes
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          
          // Listen for chain changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });

          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error('Error checking MetaMask connection:', error);
        }
      } else {
        toast.error('MetaMask is not installed. Please install it to use this app.');
      }
    };

    checkMetaMask();

    // Cleanup listeners on unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setIsConnected(false);
      setAccount(null);
      setSigner(null);
      setContract(null);
      toast.info('Wallet disconnected');
    } else if (accounts[0] !== account) {
      // User switched accounts
      await connectWallet();
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Check if we're on Sepolia testnet (chainId: 11155111)
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0xaa36a7') { // Sepolia chainId in hex
          try {
            // Try to switch to Sepolia
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }],
            });
          } catch (switchError) {
            // If Sepolia is not added to MetaMask, add it
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia Testnet',
                    nativeCurrency: {
                      name: 'Sepolia ETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://sepolia.infura.io/v3/'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io'],
                  },
                ],
              });
            } else {
              throw switchError;
            }
          }
        }
        
        // Setup ethers provider and signer
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        const ethersSigner = ethersProvider.getSigner();
        
        // Initialize contract
        const financiaContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          FinanciaABI,
          ethersSigner
        );
        
        setAccount(accounts[0]);
        setProvider(ethersProvider);
        setSigner(ethersSigner);
        setContract(financiaContract);
        setIsConnected(true);
        
        toast.success('Wallet connected successfully!');
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast.error('Failed to connect wallet: ' + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('MetaMask is not installed. Please install it to use this app.');
    }
  };

  return (
    <Web3Provider
      value={{
        isConnected,
        account,
        provider,
        signer,
        contract,
        loading,
        connectWallet
      }}
    >
      <div className="app">
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/balance" element={<Balance />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/history" element={<History />} />
            <Route path="/market" element={<Market />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Web3Provider>
  );
}

export default App;