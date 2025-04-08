import React, { createContext } from 'react';

// Create the context
const Web3Context = createContext(null);

// Create a provider component
export const Web3Provider = ({ children, value }) => {
  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// Create a custom hook to use the Web3 context
export const useWeb3 = () => {
  const context = React.useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export default Web3Context;