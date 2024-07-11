"use client";
import { useEffect, useState, useMemo } from "react"
import Image from 'next/image';

import { PriceResponse } from '@/app/api/types/index';
import { useChainId } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import qs from 'qs';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
    POLYGON_TOKENS,
    POLYGON_TOKENS_EXTENDED,
    POLYGON_TOKENS_BY_SYMBOL,
    Token,
} from '@/lib/constants';
interface TokenListProps {
    defaultValue: string;
    setToken: (value: string) => void;
}

const TokenList = ({ defaultValue, setToken }: TokenListProps) => {
    const [extendedList, showExtendedList] = useState(false);

    const handleTokenChange = (value: string) => {
        if (value === "extendedOptions") {
            showExtendedList(true);
        } else if(value === "fewerOptions") {
            showExtendedList(false);
        } else {
            setToken(value)
        }
    }

    const extendedTokens = useMemo(() => POLYGON_TOKENS_EXTENDED.map((token: Token) => (
        <SelectItem key={token.address} value={token.symbol.toLowerCase()}>
            {token.symbol}
        </SelectItem>
    )), []);

    return (
        <Select
            onValueChange={handleTokenChange}
            defaultValue={defaultValue}
        >
            <SelectTrigger className="w-1/4">
                <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
                {POLYGON_TOKENS.map((token: Token) => {
                    return (
                        <SelectItem
                            key={token.address}
                            value={token.symbol.toLowerCase()}
                        >
                            {token.symbol}
                        </SelectItem>
                    );
                })}
                {extendedList && extendedTokens}
                {extendedList ? (
                    <SelectItem key="fewerOptions" value="fewerOptions">
                        <span className="italic">fewer options</span>
                    </SelectItem>
                ) : (
                    <SelectItem key="extendedOptions" value="extendedOptions">
                      <span className="italic">more options</span>
                    </SelectItem>
                )}
            </SelectContent>
        </Select>
    )
}

interface Props {
    userAddress: `0x${string}` | undefined
};

export default function SwapErc20Modal({ userAddress }: Props) {
    const [isMounted, setIsMounted] = useState(false);
    const [sellToken, setSellToken] = useState("wmatic");
    const [sellAmount, setSellAmount] = useState('');
    const [buyToken, setBuyToken] = useState("usdc");
    const [buyAmount, setBuyAmount] = useState('');
    const [price, setPrice] = useState<PriceResponse | undefined>();
    const [tradeDirection, setSwapDirection] = useState('sell');
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
      }, [
        sellTokenObject.address,
        buyTokenObject.address,
        parsedSellAmount,
        parsedBuyAmount,
        userAddress,
        sellAmount,
        setPrice,
      ]);

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
                            <Button>Swap</Button>
                        </form>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </DialogContent>
        </Dialog>
    )
}
