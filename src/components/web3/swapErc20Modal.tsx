import { useEffect, useState } from "react"
import Image from 'next/image';

import { PriceResponse, QuoteResponse } from '@/app/api/types/index';
import {
    useBalance,
    useChainId,
    useReadContract,
} from 'wagmi';
import {
    erc20Abi,
    formatUnits,
    parseUnits
} from 'viem';
import qs from 'qs';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

import { POLYGON_TOKENS_BY_SYMBOL } from '@/lib/constants';
import ApproveOrReviewButton from "./ApproveOrReviewButton";
import ConfirmSwapButton from "./ConfirmSwapButton";
import TokenList from "./TokenList";

interface Props {
    userAddress: `0x${string}` | undefined
};

export default function SwapErc20Modal({ userAddress }: Props) {
    const [isMounted, setIsMounted] = useState(false);
    const [sellToken, setSellToken] = useState("wmatic");
    const [sellAmount, setSellAmount] = useState('');
    const [buyToken, setBuyToken] = useState("usdc");
    const [buyAmount, setBuyAmount] = useState('');
    const [tradeDirection, setSwapDirection] = useState('sell');
    const [price, setPrice] = useState<PriceResponse | undefined>();
    const [quote, setQuote] = useState<QuoteResponse | undefined>();
    const [finalize, setFinalize] = useState(false);
    const [error, setError] = useState([]);

    const chainId = useChainId() || 137;

    const tokensByChain = (chainId: number) => {
        if (chainId === 137) {
            return POLYGON_TOKENS_BY_SYMBOL;
        }
        return POLYGON_TOKENS_BY_SYMBOL;
    };

    const sellTokenObject = tokensByChain(chainId)[sellToken];
    const buyTokenObject = tokensByChain(chainId)[buyToken];

    const sellTokenDecimals = sellTokenObject.decimals;
    const buyTokenDecimals = buyTokenObject.decimals;

    const parsedSellAmount =
        sellAmount && tradeDirection === 'sell'
            ? parseUnits(sellAmount, sellTokenDecimals).toString()
            : undefined;

    const parsedBuyAmount =
        buyAmount && tradeDirection === 'buy'
            ? parseUnits(buyAmount, buyTokenDecimals).toString()
            : undefined;


    useEffect(() => {
        if (!isMounted) {
            setIsMounted(true);
        }
    }, [isMounted]);

    useEffect(() => {
        const params = {
            sellToken: sellTokenObject.address,
            buyToken: buyTokenObject.address,
            sellAmount: parsedSellAmount,
            takerAddress: userAddress,
        };

        async function main() {
            const response = await fetch(`/api/price?${qs.stringify(params)}`);
            const data = await response.json();

            if (data?.validationErrors?.length > 0) {
                // error for sellAmount too low
                setError(data.validationErrors);
            } else {
                setError([]);
            }
            if (data.buyAmount) {
                setBuyAmount(formatUnits(data.buyAmount, buyTokenObject.decimals));
                setPrice(data);
            }
        }

        if (sellAmount !== '') {
            main();
        }
    }, [sellTokenObject.address, buyTokenObject.address, parsedSellAmount, parsedBuyAmount, userAddress, sellAmount, setPrice, buyTokenObject.decimals]);

    // useBalance token parameter is deprecated; use useReadContracts instead for non-native tokens
    const { data: sellTokenBalance } = useReadContract({
                address: sellTokenObject.address,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [userAddress || '0x0'],
    });

    const userTokenBalance = {
        value: sellTokenBalance || BigInt(0),
        decimals: sellTokenObject.decimals,
        symbol: sellTokenObject.symbol,
    };


    // Check if user can cover the desired sellAmount comparing it to the user's token balance
    const insufficientBalance =
        userTokenBalance && sellAmount
            ? parseUnits(sellAmount, sellTokenDecimals) > userTokenBalance.value
            : true;

    async function getQuote(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        if (!userAddress || !price) {
            toast.warning('You must connect your wallet...');
            return;
        }

        const params = {
            sellToken: price.sellTokenAddress,
            buyToken: price.buyTokenAddress,
            sellAmount: price.sellAmount,
            takerAddress: userAddress,
        };
        try {
            const response = await fetch(`/api/quote?${qs.stringify(params)}`);
            const data = await response.json();
            setQuote(data);
            setFinalize(true);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild className="w-full">
                <Button>Swap ERC20</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">Swap ERC20</DialogTitle>
                    <DialogDescription>
                        The amount entered will be swapped for the amount of tokens
                        displayed in the second row
                    </DialogDescription>
                </DialogHeader>
                {isMounted ? (
                    <div className="w-full">
                        <form className="flex flex-col w-full gap-y-8">
                            <div className="w-full flex flex-col gap-y-4">
                                <div className="w-full flex items-center gap-1.5">
                                    <Image
                                        alt={buyToken}
                                        className="h-9 w-9 mr-2 rounded-md"
                                        src={POLYGON_TOKENS_BY_SYMBOL[sellToken].logoURI}
                                        width={6}
                                        height={6}
                                    />
                                    <TokenList defaultValue="wmatic" setToken={(value) => setSellToken(value)} />
                                    <Input
                                        className="w-3/4"
                                        type="number"
                                        name="sell-amount"
                                        id="sell-amount"
                                        value={sellAmount}
                                        placeholder="Enter amount..."
                                        required
                                        onChange={(e) => {
                                            setSwapDirection('sell');
                                            setSellAmount(e.target.value)
                                        }}
                                    />
                                </div>
                                <div className="w-full flex items-center gap-1.5">
                                    <Image
                                        alt={buyToken}
                                        className="h-9 w-9 mr-2 rounded-md"
                                        src={POLYGON_TOKENS_BY_SYMBOL[buyToken].logoURI}
                                        width={6}
                                        height={6}
                                    />
                                    <TokenList defaultValue="usdc" setToken={(value) => setBuyToken(value)} />
                                    <Input
                                        className="w-3/4"
                                        type="number"
                                        id="buy-amount"
                                        name="buy-amount"
                                        value={price ? formatUnits(BigInt(price.buyAmount), buyTokenDecimals) : buyAmount}
                                        placeholder="Enter amount..."
                                        onChange={(event) => {
                                            setSwapDirection('buy');
                                            setSellAmount(event.target.value);
                                        }}
                                        disabled
                                    />
                                </div>
                            </div>
                            {finalize && price ? (
                                <ConfirmSwapButton quote={quote} setFinalize={setFinalize} />
                            ) : (
                                <ApproveOrReviewButton
                                    sellAmount={sellAmount}
                                    sellTokenAddress={POLYGON_TOKENS_BY_SYMBOL[sellToken].address}
                                    userAddress={userAddress}
                                    onClick={getQuote}
                                    disabled={insufficientBalance}
                                />
                            )}
                        </form>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </DialogContent>
        </Dialog>
    )
}
