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
    tokenType: string;
    chainId: number;
    name: string;
    description?: string;
    symbol: string;
    image?: string;
    metadataUri?: string;
    contractCreator: string;
    lpCreator: string;
    createdTimestamp: number;
    mintAuthority?: boolean;
    freezeAuthority?: boolean;
    totalSupply: number;
    tokenMint: string;
    marketId: string;
    migratedMarketId?: string;
    initialAssetLiquidity: number;
    initialUsdLiquidity: number;
    tokenLiquidityAsset: number;
    tokenLiquidityUsd: number;
    pooledToken: number;
    pooledAsset: number;
    tokenPriceAsset: number;
    tokenPriceUsd: number;
    tokenMarketCapAsset: number;
    tokenMarketCapUsd: number;
    abused?: boolean;
    isMigrated?: boolean;
    lpBurned: boolean;
    website?: string;
    twitter?: string;
    telegram?: string;
    bondingCurvePercentage?: number;
    migrationState?: MigrationState;
    top10HoldingPercent: number;
    holderCount: number;
    botHolderCount: number;
    percentChange5m: number;
    totalTxnCount5m: number;
    buyTxnCount5m: number;
    sellTxnCount5m: number;
    totalVolume5m: number;
    buyVolume5m: number;
    sellVolume5m: number;
    totalMakers5m: number;
    buyMakers5m: number;
    sellMakers5m: number;
    percentChange1h: number;
    totalTxnCount1h: number;
    buyTxnCount1h: number;
    sellTxnCount1h: number;
    totalVolume1h: number;
    buyVolume1h: number;
    sellVolume1h: number;
    totalMakers1h: number;
    buyMakers1h: number;
    sellMakers1h: number;
    percentChange6h: number;
    totalTxnCount6h: number;
    buyTxnCount6h: number;
    sellTxnCount6h: number;
    totalVolume6h: number;
    buyVolume6h: number;
    sellVolume6h: number;
    totalMakers6h: number;
    buyMakers6h: number;
    sellMakers6h: number;
    percentChange24h: number;
    totalTxnCount24h: number;
    buyTxnCount24h: number;
    sellTxnCount24h: number;
    totalVolume24h: number;
    buyVolume24h: number;
    sellVolume24h: number;
    totalMakers24h: number;
    buyMakers24h: number;
    sellMakers24h: number;
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
