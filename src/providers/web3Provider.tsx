'use client';

import { ReactNode } from 'react';
import 'dotenv/config';
import { SiweMessage } from 'siwe';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, createConfig, WagmiProvider } from 'wagmi';
import { ConnectKitProvider, getDefaultConfig, SIWEConfig, SIWEProvider } from 'connectkit';
import { polygonZkEvmCardona, polygon, mainnet } from 'wagmi/chains';

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [polygonZkEvmCardona, polygon, mainnet],
    transports: {
      // RPC URL for each chain
      [polygonZkEvmCardona.id]: http(`https://polygonzkevm-cardona.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      [mainnet.id]: http(`https://mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
    },

    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

    // Required App Info
    appName: 'Exchange App',

    // Optional App Info
    appDescription: 'Dabl dev camp',
    appUrl: 'http://localhost:3000', // your app's url
    appIcon: 'http://localhost:3000/dablclub-512x512.png', // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const siweConfig = {
  getNonce: async () => {
    const res = await fetch(`/api/siwe`, { method: 'PUT' })
    if (!res.ok) throw new Error('Failed to fetch SIWE nonce')

    return res.text()
  },
  createMessage: ({ nonce, address, chainId }) => {
    return new SiweMessage({
      nonce,
      chainId,
      address,
      version: '1',
      uri: window.location.origin,
      domain: window.location.host,
      statement: 'Sign In With Ethereum to prove you control this wallet.',
    }).prepareMessage()
  },
  verifyMessage: ({ message, signature }) => {
    return fetch(`/api/siwe`, {
      method: 'POST',
      body: JSON.stringify({ message, signature }),
      headers: { 'Content-Type': 'application/json' },
    }).then(res => res.ok)
  },
  getSession: async () => {
    const res = await fetch(`/api/siwe`)
    if (!res.ok) throw new Error('Failed to fetch SIWE session')

    const { address, chainId } = await res.json()
    return address && chainId ? { address, chainId } : null
  },
  signOut: () => fetch(`/api/siwe`, { method: 'DELETE' }).then(res => res.ok),
} satisfies SIWEConfig

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SIWEProvider {...siweConfig}>
          <ConnectKitProvider>{children}</ConnectKitProvider>
        </SIWEProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}