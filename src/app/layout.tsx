import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { Web3Provider } from '@/providers/web3Provider';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Dabl dev camp',
  description: 'Dabl dev camp',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <Web3Provider>{children}</Web3Provider>
        <Toaster richColors />
      </body>
    </html>
  );
}
