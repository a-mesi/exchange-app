import { useEffect } from "react";
import { useChainId, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Address, erc20Abi, parseEther } from 'viem';
import { Button } from '../ui/button';

import { POLYGON_EXCHANGE_PROXY } from '@/lib/constants';

interface Props {
  userAddress: Address | undefined;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  sellAmount: string;
  sellTokenAddress: Address;
  disabled?: boolean;
}

export default function ApproveOrReviewButton({
  userAddress,
  onClick,
  sellAmount,
  sellTokenAddress,
  disabled,
}: Props) {
  const chainId = useChainId() || 137;

  const exchangeProxy = (chainId: number): Address => {
    if (chainId === 137) {
      return POLYGON_EXCHANGE_PROXY;
    }
    return POLYGON_EXCHANGE_PROXY;
  };

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [userAddress ?? '0x0', exchangeProxy(chainId)],
    query: {
      enabled: Boolean(userAddress),
    },
  });

  const {
    data: approvalTxHash,
    error: errorWriteContract,
    writeContractAsync,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isTxConfirmed } =
    useWaitForTransactionReceipt({
      hash: approvalTxHash,
    });

  useEffect(() => {
    if (isTxConfirmed) {
      refetchAllowance();
    }
  }, [isTxConfirmed, refetchAllowance, allowance]);

  if (errorWriteContract) {
    return <div>Something went wrong: {errorWriteContract.message}</div>;
  }

  async function onClickHandler(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();

    try {
      await writeContractAsync({
        abi: erc20Abi,
        address: sellTokenAddress,
        functionName: 'approve',
        args: [exchangeProxy(chainId), parseEther(sellAmount)],
      });
    } catch (error) {
      console.error(error);
    }
  }

  // update button depending if needs approval or approval pending
  if (!disabled && (allowance === BigInt(0) || (allowance && allowance < parseEther(sellAmount)))) {
    return (
      <>
        <Button onClick={onClickHandler}>
          {isConfirming ? 'Approving…' : 'Approve'}
        </Button>
      </>
    );
  }

  return (
    <Button
      disabled={disabled}
      onClick={async (event) => await onClick(event)}
    >
      {disabled ? 'Insufficient Balance' : 'Review Swap'}
    </Button>
  );
}
