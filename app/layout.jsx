'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { StrictMode } from 'react';
import { Web3AuthProvider, useWeb3Auth } from '../components/Web3AuthProvider';
import XMTPClientProvider from '../components/XMTPClientProvider';

const inter = Inter({ subsets: ['latin'] });

function LayoutContent({ children }) {
  const { provider, isLoading } = useWeb3Auth();

  if (isLoading) {
    return <div>Loading Web3Auth...</div>;
  }

  return provider ? (
    <XMTPClientProvider provider={provider}>{children}</XMTPClientProvider>
  ) : (
    children
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <StrictMode>
          <Web3AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </Web3AuthProvider>
        </StrictMode>
      </body>
    </html>
  );
}
