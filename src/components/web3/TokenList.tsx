import { useState, useMemo } from "react"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import {
    POLYGON_TOKENS,
    POLYGON_TOKENS_EXTENDED,
    Token,
} from '@/lib/constants';

interface Props {
    defaultValue: string;
    setToken: (value: string) => void;
}
const TokenList = ({ defaultValue, setToken }: Props) => {
    const [extendedList, showExtendedList] = useState(false);

    const handleTokenChange = (value: string) => {
        if (value === "extendedOptions") {
            showExtendedList(true);
        } else if (value === "fewerOptions") {
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

export default TokenList;
