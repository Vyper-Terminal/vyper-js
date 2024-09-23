export interface APIResponse<T> {
    status: string;
    message: string;
    data: T;
}

export interface WalletAggregatedPnL {
    investedAmount: number;
    pnlPercent: number;
    pnlUsd: number;
    soldAmount: number;
    tokensTraded: number;
    totalPnlPercent: number;
    totalPnlUsd: number;
    unrealizedPnlPercent: number;
    unrealizedPnlUsd: number;
}

export interface WalletHolding {
    marketId: string;
    tokenHoldings: number;
    tokenSymbol: string;
    usdValue: number;
}

export interface WalletPnL {
    holderSince: number;
    investedAmount: number;
    investedTxns: number;
    pnlPercent: number;
    pnlUsd: number;
    remainingTokens: number;
    remainingUsd: number;
    soldAmount: number;
    soldTxns: number;
}

export interface TopTrader {
    investedAmount_tokens: number;
    investedAmount_usd: number;
    investedTxns: number;
    pnlUsd: number;
    remainingTokens: number;
    remainingUsd: number;
    soldAmountTokens: number;
    soldAmountUsd: number;
    soldTxns: number;
    walletAddress: string;
    walletTag?: string;
}

export interface TokenSearchResult {
    chainId: number;
    marketId: string;
    createdTimestamp: number;
    name: string;
    symbol: string;
    tokenMint: string;
    tokenType: string;
    percentChange24h: number;
    pooledAsset: number;
    tokenLiquidityUsd: number;
    tokenMarketCapUsd: number;
    tokenPriceUsd: number;
    volumeUsd: number;
    image?: string;
    telegram?: string;
    twitter?: string;
    website?: string;
}

export interface TokenMarket {
    marketCapUsd: number;
    marketID: string;
    tokenLiquidityUsd: number;
    tokenType: string;
}

export interface TokenMetadata {
    image?: string;
    name: string;
    symbol: string;
    telegram?: string;
    twitter?: string;
    website?: string;
}

export interface TokenSymbol {
    symbol: string;
}

export interface TokenHolder {
    percentOwned: number;
    tokenHoldings: number;
    usdHoldings: number;
    walletAddress: string;
    walletTag?: string;
}

export interface TokenATH {
    marketCapUsd: number;
    timestamp: number;
    tokenLiquidityUsd: number;
}

export interface MigrationState {
    durationMinutes: number;
    makers: number;
    migrationTimestamp: number;
    volume: number;
}

export interface TokenPair {
    abused?: boolean;
    bondingCurvePercentage?: number;
    buyTxnCount: number;
    chainId: number;
    contractCreator: string;
    createdTimestamp: number;
    description?: string;
    freezeAuthority?: boolean;
    image?: string;
    initialAssetLiquidity: number;
    initialUsdLiquidity: number;
    isMigrated?: boolean;
    lpBurned: boolean;
    lpCreator: string;
    marketId: string;
    metadataUri?: string;
    migratedMarketId?: string;
    migrationState?: MigrationState;
    mintAuthority?: boolean;
    name: string;
    pooledAsset: number;
    pooledToken: number;
    priceChangePercent: number;
    sellTxnCount: number;
    symbol: string;
    telegram?: string;
    tokenLiquidityAsset: number;
    tokenLiquidityUsd: number;
    tokenMarketCapAsset: number;
    tokenMarketCapUsd: number;
    tokenMint: string;
    tokenPriceAsset: number;
    tokenPriceUsd: number;
    tokenType: string;
    top10HoldingPercent: number;
    totalSupply: number;
    transactionCount: number;
    twitter?: string;
    volumeAsset: number;
    volumeUsd: number;
    website?: string;
}

export interface TokenPairs {
    hasNext: boolean;
    pairs: TokenPair[];
}

export interface ChainAction {
    signer: string;
    tokenAccount?: string;
    transactionId: string;
    tokenMint?: string;
    marketId: string;
    actionType: string;
    tokenAmount: number;
    assetAmount: number;
    tokenPriceUsd: number;
    tokenPriceAsset: number;
    swapTotalUsd?: number;
    swapTotalAsset?: number;
    tokenMarketCapAsset: number;
    tokenMarketCapUsd: number;
    tokenLiquidityAsset: number;
    tokenLiquidityUsd: number;
    pooledToken: number;
    pooledAsset: number;
    actionTimestamp: number;
    bondingCurvePercentage?: number;
    botUsed?: string;
}

export interface TokenPairsParams {
    atLeastOneSocial?: boolean;
    buysMax?: number;
    buysMin?: number;
    chainIds?: string | number[];
    freezeAuthDisabled?: boolean;
    initialLiquidityMax?: number;
    initialLiquidityMin?: number;
    interval?: string;
    liquidityMax?: number;
    liquidityMin?: number;
    lpBurned?: boolean;
    marketCapMax?: number;
    marketCapMin?: number;
    mintAuthDisabled?: boolean;
    page?: number;
    sellsMax?: number;
    sellsMin?: number;
    sorting?: string;
    swapsMax?: number;
    swapsMin?: number;
    tokenTypes?: string | string[];
    top10Holders?: boolean;
    volumeMax?: number;
    volumeMin?: number;
}
