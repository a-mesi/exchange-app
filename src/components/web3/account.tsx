'use client';
import { useAccount, useBalance, useEnsAvatar, useEnsName } from 'wagmi';
import { useEffect, useState } from 'react';
import { mainnet } from 'viem/chains';
import Image from 'next/image';
import SendErc20Modal from './sendErc20Modal';
import SendEthModal from './sendEthModal';
import SwapErc20Modal from './swapErc20Modal';

export default function Account() {
  const [isMounted, setIsMounted] = useState(false);
  const { address, chain, chainId, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: ensName } = useEnsName({ address, chainId: mainnet.id });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName!, chainId: mainnet.id });

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);

  if (!isConnected) {
    return (
      <div>
        <div className="flex gap-x-4">
          <p className="text-lg w-3/5">Not connected</p>
          <div className="w-3/5">
            <SwapErc20Modal userAddress={address} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center gap-y-4">
      {ensAvatar && ensName && isMounted && (
        <div className="flex items-center gap-x-2">
          <Image
            alt="ENS Avatar"
            src={ensAvatar}
            className="h-16 w-16 rounded-full"
            height={64}
            width={64}
          />
          {ensName && <p className="text-2xl">{ensName}</p>}
        </div>
      )}
      {address && isMounted && (
        <>
          <p className="text-lg">{address}</p>
        </>
      )}
      <div className="flex flex-col gap-y-2">
        {balance && (
          <p className="text-xl">
            Balance: {balance?.formatted} {balance?.symbol}
          </p>
        )}
        {chain && chainId && isMounted && (
          <p className="text-lg">
            {chain.name}, chainId: {chainId}
          </p>
        )}
      </div>
      <div className="flex justify-center gap-x-4">
        <div className="w-3/5">
          <SendEthModal />
        </div>
        <div className="w-3/5">
          <SendErc20Modal userAddress={address} />
        </div>
        <div className="w-3/5">
          <SwapErc20Modal userAddress={address} />
        </div>
      </div>
    </div>
  );
}
