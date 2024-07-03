'use client';

import { ReactNode } from 'react';
import 'dotenv/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, createConfig, WagmiProvider } from 'wagmi';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { polygonZkEvmCardona } from 'wagmi/chains';

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [polygonZkEvmCardona],
    transports: {
      // RPC URL for each chain
      [polygonZkEvmCardona.id]: http(
`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`

      ),
    },

    // Required API Keys
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

    // Required App Info
    appName: 'Exchange App',

    // Optional App Info
    appDescription: 'Dabl dev camp',
    appUrl: 'http://localhost:3000', // your app's url
    appIcon: 'http://localhost:3000/dablclub-512x512.png', // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}