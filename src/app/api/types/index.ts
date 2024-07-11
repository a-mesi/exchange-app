// https://docs.0x.org/0x-api-swap/api-references/get-swap-v1-price#response
export interface PriceResponse {
    chainId: number;
    price: string;
    estimatedPriceImpact: string;
    value: string;
    gasPrice: bigint;
    grossBuyAmount: string;
    gas: bigint;
    estimatedGas: string;
    protocolFee: string;
    minimumProtocolFee: string;
    buyTokenAddress: string;
    buyAmount: string;
    sellTokenAddress: string;
    sellAmount: string;
    sources: any[];
    allowanceTarget: string;
    sellTokenToEthRate: string;
    buyTokenToEthRate: string;
    expectedSlippage: string | null;
  }
  