"use client";
import { useEffect, useState, useMemo } from "react"
import Image from 'next/image';

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
    const [buyToken, setBuyToken] = useState("usdc");

    useEffect(() => {
        if (!isMounted) {
            setIsMounted(true);
        }
    }, [isMounted]);

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
                                        placeholder="Enter amount..."
                                        required
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
                                        placeholder="Enter amount..."
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
