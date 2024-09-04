'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { XMTPProvider, useClient } from '@xmtp/react-sdk';
import { ethers } from 'ethers';

const CreateClient = ({ provider }) => {
  const { client, error, isLoading, initialize } = useClient();
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    const setupSigner = async () => {
      if (provider) {
        try {
          const ethersProvider = new ethers.BrowserProvider(provider);
          const newSigner = await ethersProvider.getSigner();
          setSigner(newSigner);
        } catch (error) {
          console.error('Error setting up signer:', error);
        }
      }
    };

    setupSigner();
  }, [provider]);

  useEffect(() => {
    const connectToXMTP = async () => {
      if (signer && !client) {
        try {
          const options = {
            persistConversations: true,
            env: 'production',
          };
          await initialize({ signer, options });
        } catch (error) {
          console.error('Error connecting to XMTP:', error);
        }
      }
    };

    connectToXMTP();
  }, [signer, client, initialize]);

  if (error) {
    return <div>An error occurred while initializing the XMTP client</div>;
  }

  if (isLoading) {
    return <div>Connecting to XMTP...</div>;
  }

  if (!client) {
    return <div>Waiting for Web3Auth connection...</div>;
  }

  return null; // Return null when client is initialized
};

const XMTPClientProvider = ({ children, provider }) => {
  return (
    <XMTPProvider>
      <CreateClient provider={provider} />
      {children}
    </XMTPProvider>
  );
};

export default XMTPClientProvider;
