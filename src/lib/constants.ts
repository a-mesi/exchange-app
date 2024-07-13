
import { Address } from 'viem';
import tokenList from './polygonTokenList.json';

export const POLYGON_EXCHANGE_PROXY =
  '0xDef1C0ded9bec7F1a1670819833240f027b25EfF';

export const MAX_ALLOWANCE =
  115792089237316195423570985008687907853269984665640564039457584007913129639935n;

export interface Token {
  asset?: string;
  name: string;
  address: Address;
  symbol: string;
  decimals: number;
  chainId?: number;
  logoURI: string;
}

export const POLYGON_TOKENS_EXTENDED = tokenList.tokens as Token[];

export const POLYGON_TOKENS: Token[] = [
  {
    chainId: 137,
    name: 'Wrapped Matic',
    symbol: 'WMATIC',
    decimals: 18,
    address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    logoURI:
      'https://raw.githubusercontent.com/maticnetwork/polygon-token-assets/main/assets/tokenAssets/matic.svg',
  },
  {
    chainId: 137,
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    logoURI:
      'https://raw.githubusercontent.com/maticnetwork/polygon-token-assets/main/assets/tokenAssets/usdc.svg',
  },
  {
    chainId: 137,
    name: 'Dai - PoS',
    symbol: 'DAI',
    decimals: 18,
    address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
    logoURI:
      'https://raw.githubusercontent.com/maticnetwork/polygon-token-assets/main/assets/tokenAssets/dai.svg',
  },
];

export const POLYGON_TOKENS_BY_SYMBOL = POLYGON_TOKENS.concat(POLYGON_TOKENS_EXTENDED).reduce(
  (acc, token) => {
    acc[token.symbol.toLowerCase()] = token;
    return acc;
  },
  {} as Record<string, Token>
);
