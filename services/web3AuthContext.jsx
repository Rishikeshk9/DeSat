'use client';

import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { Web3Auth } from '@web3auth/modal';
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { WalletServicesPlugin } from "@web3auth/wallet-services-plugin";
import { UX_MODE } from "@toruslabs/openlogin-utils";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";

import { ethers } from 'ethers';

const clientId = 'BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ';

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0x15b32', // Chilliz testnet chain ID in hex
  rpcTarget: 'https://spicy-rpc.chiliz.com',
  displayName: 'Chilliz Testnet',
  blockExplorerUrl: 'https://testnet.chiliscan.com',
  ticker: 'CHZ',
  tickerName: 'Chilliz',
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3AuthOptions = {
  clientId,
  chainConfig,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
  privateKeyProvider,
};

const openloginAdapter = new OpenloginAdapter({
  loginSettings: {
    mfaLevel: "optional",
  },
  adapterSettings: {
    uxMode: UX_MODE.REDIRECT,
  },
});

const walletServicesPlugin = new WalletServicesPlugin({
  wsEmbedOpts: {},
  walletInitOptions: { whiteLabel: { showWidgetButton: true, buttonPosition: "bottom-right" } },
});

// const web3auth = new Web3Auth(web3AuthOptions);
// web3auth.configureAdapter(openloginAdapter);
// web3auth.addPlugin(walletServicesPlugin);

// const adapters = getDefaultExternalAdapters({ options: web3AuthOptions });


// const Web3AuthContext = createContext(null);
const web3AuthContextConfig = {
    web3AuthOptions,
    adapters: [openloginAdapter],
    plugins: [walletServicesPlugin],
  };
// export const useWeb3Auth = () => useContext(Web3AuthContext);

// export const Web3AuthContext1 = ({ children }) => {
//   const [provider, setProvider] = useState(null);
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [ethersProvider, setEthersProvider] = useState(null);
//   const [signer, setSigner] = useState(null);

//   const initializeWeb3Auth = useCallback(async () => {
//     try {
//       await web3auth.initModal();
//       setIsInitialized(true);
//       if (web3auth.connected) {
//         const web3authProvider = web3auth.provider;
//         setProvider(web3authProvider);
//         const userInfo = await web3auth.getUserInfo();
//         setUser(userInfo);

//         const ethProvider = new ethers.BrowserProvider(web3authProvider);
//         setEthersProvider(ethProvider);
//         const ethSigner = await ethProvider.getSigner();
//         setSigner(ethSigner);
//       }
//     } catch (error) {
//       console.error('Error initializing Web3Auth:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     initializeWeb3Auth();
//   }, [initializeWeb3Auth]);

//   const login = async () => {
//     if (!isInitialized) {
//       console.log('Web3Auth is not initialized yet');
//       return;
//     }
//     setIsLoading(true);
//     try {
//       const web3authProvider = await web3auth.connect();
//       setProvider(web3authProvider);
//       if (web3auth.connected) {
//         const userInfo = await web3auth.getUserInfo();
//         setUser(userInfo);

//         const ethProvider = new ethers.BrowserProvider(web3authProvider);
//         setEthersProvider(ethProvider);
//         const ethSigner = await ethProvider.getSigner();
//         setSigner(ethSigner);
//       }
//     } catch (error) {
//       console.error('Error during login:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = async () => {
//     if (!isInitialized) {
//       console.log('Web3Auth is not initialized yet');
//       return;
//     }
//     setIsLoading(true);
//     try {
//       await web3auth.logout();
//       setProvider(null);
//       setUser(null);
//       setEthersProvider(null);
//       setSigner(null);
//     } catch (error) {
//       console.error('Error during logout:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getChainId = async () => {
//     if (!ethersProvider) return null;
//     try {
//       const network = await ethersProvider.getNetwork();
//       return network.chainId.toString();
//     } catch (error) {
//       console.error('Error getting chain ID:', error);
//       return null;
//     }
//   };

//   const getAccounts = async () => {
//     if (!signer) return null;
//     try {
//       const address = await signer.getAddress();
//       return address;
//     } catch (error) {
//       console.error('Error getting account:', error);
//       return null;
//     }
//   };

//   const getBalance = async () => {
//     if (!ethersProvider || !signer) return null;
//     try {
//       const address = await signer.getAddress();
//       const balance = await ethersProvider.getBalance(address);
//       return ethers.formatEther(balance);
//     } catch (error) {
//       console.error('Error getting balance:', error);
//       return null;
//     }
//   };

//   const value = {
//     provider,
//     user,
//     isLoading,
//     isInitialized,
//     login,
//     logout,
//     ethersProvider,
//     signer,
//     getChainId,
//     getAccounts,
//     getBalance,
//     web3auth,
//   };

//   return (
//     <Web3AuthContext.Provider value={value}>
//       {children}
//     </Web3AuthContext.Provider>
//   );
// };

export default web3AuthContextConfig;
