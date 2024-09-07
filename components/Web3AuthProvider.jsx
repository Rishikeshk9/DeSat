'use client';

import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { Web3Auth } from '@web3auth/modal';
import { ethers } from 'ethers';

const clientId = 'BFlOmzaEDc3C8f9t48td3KPKAhKNo-5tdcA0FOgvSUcy19hJgvHlrzNzkiGrL4lQn67DAR0TysC3cXz2vLyr_zU';

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0xaa36a7',
  rpcTarget: 'https://rpc.ankr.com/eth_sepolia',
  displayName: 'Ethereum Sepolia Testnet',
  blockExplorerUrl: 'https://sepolia.etherscan.io',
  ticker: 'ETH',
  tickerName: 'Ethereum',
  logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
};

const ChillizConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x15b38", // Chilliz testnet chain ID in hex
  rpcTarget: "https://spicy-rpc.chiliz.com",
  displayName: "Chilliz Testnet",
  blockExplorerUrl: "https://testnet.chiliscan.com",
  ticker: "CHZ",
  tickerName: "Chilliz",
  decimals: 18,
  isTestnet: true,
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
});

const Web3AuthContext = createContext(null);

export const useWeb3Auth = () => useContext(Web3AuthContext);

export const Web3AuthProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [ethersProvider, setEthersProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const initializeWeb3Auth = useCallback(async () => {
    try {
      await web3auth.initModal();
      setIsInitialized(true);
      await web3auth.addChain(ChillizConfig);

      if (web3auth.connected) {
        await web3auth.switchChain({ chainId: "0x15b38" });

        const web3authProvider = web3auth.provider;
        setProvider(web3authProvider);
        const userInfo = await web3auth.getUserInfo();
        setUser(userInfo);

        const ethProvider = new ethers.BrowserProvider(web3authProvider);
        setEthersProvider(ethProvider);
        const ethSigner = await ethProvider.getSigner();
        setSigner(ethSigner);
      }
    } catch (error) {
      console.error('Error initializing Web3Auth:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeWeb3Auth();
  }, [initializeWeb3Auth]);

  const login = async () => {
    if (!isInitialized) {
      console.log('Web3Auth is not initialized yet');
      return;
    }
    setIsLoading(true);
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      if (web3auth.connected) {
        const userInfo = await web3auth.getUserInfo();
        setUser(userInfo);

        const ethProvider = new ethers.BrowserProvider(web3authProvider);
        setEthersProvider(ethProvider);
        const ethSigner = await ethProvider.getSigner();
        setSigner(ethSigner);
      }
    } catch (error) {
      console.error('Error during login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!isInitialized) {
      console.log('Web3Auth is not initialized yet');
      return;
    }
    setIsLoading(true);
    try {
      await web3auth.logout();
      setProvider(null);
      setUser(null);
      setEthersProvider(null);
      setSigner(null);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChainId = async () => {
    if (!ethersProvider) return null;
    try {
      const network = await ethersProvider.getNetwork();
      return network.chainId.toString();
    } catch (error) {
      console.error('Error getting chain ID:', error);
      return null;
    }
  };

  const getAccounts = async () => {
    if (!signer) return null;
    try {
      const address = await signer.getAddress();
      return address;
    } catch (error) {
      console.error('Error getting account:', error);
      return null;
    }
  };

  const getBalance = async () => {
    if (!ethersProvider || !signer) return null;
    try {
      const address = await signer.getAddress();
      const balance = await ethersProvider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  };

  const value = {
    provider,
    user,
    isLoading,
    isInitialized,
    login,
    logout,
    ethersProvider,
    signer,
    getChainId,
    getAccounts,
    getBalance,
  };

  return (
    <Web3AuthContext.Provider value={value}>
      {children}
    </Web3AuthContext.Provider>
  );
};

export default Web3AuthProvider;
