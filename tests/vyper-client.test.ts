import { VyperClient } from '../src/vyper-client';
import axios from 'axios';
import { AuthenticationError, VyperApiError, ServerError } from '../src/errors';
import {
    TokenATH,
    TokenPair,
    TokenHolder,
    TokenMarket,
    WalletAggregatedPnL,
    TokenMetadata,
    TopTrader,
    TokenSymbol,
    TokenSearchResult,
    WalletHolding,
    WalletPnL,
    TokenPairs,
} from '../src/types';

jest.mock('axios');

describe('VyperClient', () => {
    let client: VyperClient;
    const mockApiKey = 'test-api-key';

    beforeEach(() => {
        client = new VyperClient(mockApiKey);
        (axios.create as jest.Mock).mockReturnValue(axios);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should create an instance with API key', () => {
            expect(client).toBeInstanceOf(VyperClient);
            expect(axios.create).toHaveBeenCalledWith({
                baseURL: 'https://api.vyper.trade',
                headers: { 'X-API-Key': mockApiKey },
            });
        });

        it('should create an instance without API key', () => {
            const clientWithoutApiKey = new VyperClient();
            expect(clientWithoutApiKey).toBeInstanceOf(VyperClient);
            expect(axios.create).toHaveBeenCalledWith({
                baseURL: 'https://api.vyper.trade',
                headers: {},
            });
        });
    });

    describe('getChainIds', () => {
        it('should fetch chain IDs successfully', async () => {
            const mockResponse = {
                data: {
                    data: {
                        ethereum: 1,
                        'binance-smart-chain': 56,
                    },
                },
            };
            (axios.request as jest.Mock).mockResolvedValue(mockResponse);

            const result = await client.getChainIds();

            expect(result).toEqual({
                ethereum: 1,
                'binance-smart-chain': 56,
            });
            expect(axios.request).toHaveBeenCalledWith({
                method: 'GET',
                url: '/api/v1/chain/ids',
                params: undefined,
            });
        });

        it('should handle server errors', async () => {
            (axios.request as jest.Mock).mockRejectedValue({
                response: {
                    status: 500,
                    data: { message: 'Internal server error' },
                },
            });

            await expect(client.getChainIds()).rejects.toThrow(ServerError);
        });

        it('should handle other API errors', async () => {
            (axios.request as jest.Mock).mockRejectedValue({
                response: {
                    status: 400,
                    data: { message: 'Bad request' },
                },
            });

            await expect(client.getChainIds()).rejects.toThrow(VyperApiError);
        });
    });
    describe('getTokenAth', () => {
        const chainId = 1;
        const marketId = 'test-market';

        it('should fetch token ATH successfully', async () => {
            const mockResponse: { data: { data: TokenATH } } = {
                data: {
                    data: {
                        marketCapUsd: 100000,
                        timestamp: 1630000000,
                        tokenLiquidityUsd: 10000,
                    },
                },
            };
            (axios.request as jest.Mock).mockResolvedValue(mockResponse);

            const result = await client.getTokenAth(chainId, marketId);

            expect(result).toEqual(mockResponse.data.data);
            expect(axios.request).toHaveBeenCalledWith({
                method: 'GET',
                url: '/api/v1/token/ath',
                params: { chainID: chainId, marketID: marketId },
            });
        });

        it('should throw AuthenticationError if API key is not provided', async () => {
            const clientWithoutApiKey = new VyperClient();
            await expect(
                clientWithoutApiKey.getTokenAth(chainId, marketId)
            ).rejects.toThrow(AuthenticationError);
        });

        it('should handle server errors', async () => {
            (axios.request as jest.Mock).mockRejectedValue({
                response: {
                    status: 500,
                    data: { message: 'Internal server error' },
                },
            });

            await expect(client.getTokenAth(chainId, marketId)).rejects.toThrow(
                ServerError
            );
        });

        it('should handle other API errors', async () => {
            (axios.request as jest.Mock).mockRejectedValue({
                response: {
                    status: 400,
                    data: { message: 'Bad request' },
                },
            });

            await expect(client.getTokenAth(chainId, marketId)).rejects.toThrow(
                VyperApiError
            );
        });
    });

    describe('getTokenMarket', () => {
        const marketId = 'test-market';
        const chainId = 1;
        const interval = '24h';

        it('should fetch token market successfully', async () => {
            const mockResponse: { data: { data: TokenPair } } = {
                data: {
                    data: {
                        marketId: marketId,
                        chainId: chainId,
                        name: 'Test Token',
                        symbol: 'TEST',
                        tokenMint: 'test-mint',
                        tokenType: 'test-type',
                        description: 'A test token for development',
                        image: 'https://test.com/image.png',
                        metadataUri: 'https://test.com/metadata.json',
                        contractCreator: 'test-creator',
                        createdTimestamp: Date.now(),
                        lpCreator: 'test-lp-creator',
                        lpBurned: false,
                        mintAuthority: true,
                        freezeAuthority: false,
                        tokenPriceUsd: 1.5,
                        tokenPriceAsset: 2,
                        tokenMarketCapAsset: 1000000,
                        tokenMarketCapUsd: 1500000,
                        tokenLiquidityAsset: 500000,
                        tokenLiquidityUsd: 750000,
                        pooledAsset: 400000,
                        pooledToken: 300000,
                        totalSupply: 1000000,
                        initialAssetLiquidity: 5000,
                        initialUsdLiquidity: 7500,
                        holderCount: 1000,
                        botHolderCount: 50,
                        top10HoldingPercent: 60,
                        isMigrated: false,
                        abused: false,
                        bondingCurvePercentage: 0.5,
                        website: 'https://test.com',
                        twitter: '@testtoken',
                        telegram: 't.me/testtoken',
                        percentChange5m: 2.5,
                        totalTxnCount5m: 150,
                        buyTxnCount5m: 90,
                        sellTxnCount5m: 60,
                        totalVolume5m: 50000,
                        buyVolume5m: 30000,
                        sellVolume5m: 20000,
                        totalMakers5m: 100,
                        buyMakers5m: 60,
                        sellMakers5m: 40,
                        percentChange1h: 5.8,
                        totalTxnCount1h: 600,
                        buyTxnCount1h: 350,
                        sellTxnCount1h: 250,
                        totalVolume1h: 200000,
                        buyVolume1h: 120000,
                        sellVolume1h: 80000,
                        totalMakers1h: 400,
                        buyMakers1h: 250,
                        sellMakers1h: 150,
                        percentChange6h: -3.2,
                        totalTxnCount6h: 2500,
                        buyTxnCount6h: 1200,
                        sellTxnCount6h: 1300,
                        totalVolume6h: 1000000,
                        buyVolume6h: 450000,
                        sellVolume6h: 550000,
                        totalMakers6h: 1500,
                        buyMakers6h: 700,
                        sellMakers6h: 800,
                        percentChange24h: 12.5,
                        totalTxnCount24h: 8000,
                        buyTxnCount24h: 4500,
                        sellTxnCount24h: 3500,
                        totalVolume24h: 3000000,
                        buyVolume24h: 1800000,
                        sellVolume24h: 1200000,
                        totalMakers24h: 5000,
                        buyMakers24h: 3000,
                        sellMakers24h: 2000,
                    },
                },
            };
            (axios.request as jest.Mock).mockResolvedValue(mockResponse);

            const result = await client.getTokenMarket(
                marketId,
                chainId,
                interval
            );

            expect(result).toEqual(mockResponse.data.data);
            expect(axios.request).toHaveBeenCalledWith({
                method: 'GET',
                url: `/api/v1/token/market/${marketId}`,
                params: { chainID: chainId, interval },
            });
        });

        it('should use default values for chainId and interval', async () => {
            const mockResponse: { data: { data: TokenPair } } = {
                data: {
                    data: {
                        marketId: marketId,
                        name: 'Test Token',
                        symbol: 'TEST',
                        tokenMint: 'test-mint',
                        tokenType: 'test-type',
                        description: 'A test token for development',
                        image: 'https://test.com/image.png',
                        metadataUri: 'https://test.com/metadata.json',
                        chainId: 900,
                        contractCreator: 'test-creator',
                        createdTimestamp: Date.now(),
                        lpCreator: 'test-lp-creator',
                        lpBurned: false,
                        mintAuthority: true,
                        freezeAuthority: false,
                        tokenPriceUsd: 1.5,
                        tokenPriceAsset: 2,
                        tokenMarketCapAsset: 1000000,
                        tokenMarketCapUsd: 1500000,
                        tokenLiquidityAsset: 500000,
                        tokenLiquidityUsd: 750000,
                        pooledAsset: 400000,
                        pooledToken: 300000,
                        totalSupply: 1000000,
                        initialAssetLiquidity: 5000,
                        initialUsdLiquidity: 7500,
                        holderCount: 1000,
                        botHolderCount: 50,
                        top10HoldingPercent: 60,
                        isMigrated: false,
                        abused: false,
                        bondingCurvePercentage: 0.5,
                        website: 'https://test.com',
                        twitter: '@testtoken',
                        telegram: 't.me/testtoken',
                        percentChange5m: 2.5,
                        totalTxnCount5m: 150,
                        buyTxnCount5m: 90,
                        sellTxnCount5m: 60,
                        totalVolume5m: 50000,
                        buyVolume5m: 30000,
                        sellVolume5m: 20000,
                        totalMakers5m: 100,
                        buyMakers5m: 60,
                        sellMakers5m: 40,
                        percentChange1h: 5.8,
                        totalTxnCount1h: 600,
                        buyTxnCount1h: 350,
                        sellTxnCount1h: 250,
                        totalVolume1h: 200000,
                        buyVolume1h: 120000,
                        sellVolume1h: 80000,
                        totalMakers1h: 400,
                        buyMakers1h: 250,
                        sellMakers1h: 150,
                        percentChange6h: -3.2,
                        totalTxnCount6h: 2500,
                        buyTxnCount6h: 1200,
                        sellTxnCount6h: 1300,
                        totalVolume6h: 1000000,
                        buyVolume6h: 450000,
                        sellVolume6h: 550000,
                        totalMakers6h: 1500,
                        buyMakers6h: 700,
                        sellMakers6h: 800,
                        percentChange24h: 12.5,
                        totalTxnCount24h: 8000,
                        buyTxnCount24h: 4500,
                        sellTxnCount24h: 3500,
                        totalVolume24h: 3000000,
                        buyVolume24h: 1800000,
                        sellVolume24h: 1200000,
                        totalMakers24h: 5000,
                        buyMakers24h: 3000,
                        sellMakers24h: 2000,
                    },
                },
            };
            (axios.request as jest.Mock).mockResolvedValue(mockResponse);

            await client.getTokenMarket(marketId);

            expect(axios.request).toHaveBeenCalledWith({
                method: 'GET',
                url: `/api/v1/token/market/${marketId}`,
                params: { chainID: 900, interval: '24h' },
            });
        });
    });

    describe('getTokenHolders', () => {
        const marketId = 'test-market';
        const chainId = 1;

        it('should fetch token holders successfully', async () => {
            const mockResponse: {
                data: {
                    data: { holders: TokenHolder[]; total_holders: number };
                };
            } = {
                data: {
                    data: {
                        holders: [
                            {
                                walletAddress: '0x123',
                                percentOwned: 10,
                                tokenHoldings: 1000,
                                usdHoldings: 10000,
                            },
                            {
                                walletAddress: '0x456',
                                percentOwned: 5,
                                tokenHoldings: 500,
                                usdHoldings: 5000,
                            },
                        ],
                        total_holders: 2,
                    },
                },
            };
            (axios.request as jest.Mock).mockResolvedValue(mockResponse);

            const result = await client.getTokenHolders(marketId, chainId);

            expect(result).toEqual({
                holders: [
                    {
                        walletAddress: '0x123',
                        percentOwned: 10,
                        tokenHoldings: 1000,
                        usdHoldings: 10000,
                    },
                    {
                        walletAddress: '0x456',
                        percentOwned: 5,
                        tokenHoldings: 500,
                        usdHoldings: 5000,
                    },
                ],
                totalHolders: 2,
            });
            expect(axios.request).toHaveBeenCalledWith({
                method: 'GET',
                url: '/api/v1/token/holders',
                params: { marketID: marketId, chainID: chainId },
            });
        });

        it('should throw AuthenticationError if API key is not provided', async () => {
            const clientWithoutApiKey = new VyperClient();
            await expect(
                clientWithoutApiKey.getTokenHolders(marketId, chainId)
            ).rejects.toThrow(AuthenticationError);
        });
    });

    describe('getTokenMarkets', () => {
        const tokenMint = '0xtoken';
        const chainId = 1;

        it('should fetch token markets successfully', async () => {
            const mockResponse: { data: { data: TokenMarket[] } } = {
                data: {
                    data: [
                        {
                            marketCapUsd: 1000000,
                            marketID: 'market1',
                            tokenLiquidityUsd: 100000,
                            tokenType: 'ERC20',
                        },
                        {
                            marketCapUsd: 2000000,
                            marketID: 'market2',
                            tokenLiquidityUsd: 200000,
                            tokenType: 'ERC20',
                        },
                    ],
                },
            };
            (axios.request as jest.Mock).mockResolvedValue(mockResponse);

            const result = await client.getTokenMarkets(tokenMint, chainId);

            expect(result).toEqual([
                {
                    marketCapUsd: 1000000,
                    marketID: 'market1',
                    tokenLiquidityUsd: 100000,
                    tokenType: 'ERC20',
                },
                {
                    marketCapUsd: 2000000,
                    marketID: 'market2',
                    tokenLiquidityUsd: 200000,
                    tokenType: 'ERC20',
                },
            ]);
            expect(axios.request).toHaveBeenCalledWith({
                method: 'GET',
                url: '/api/v1/token/markets',
                params: { tokenMint, chainID: chainId },
            });
        });
    });

    describe('getTokenMetadata', () => {
        const chainId = 1;
        const tokenMint = '0xtoken';

        it('should fetch token metadata successfully', async () => {
            const mockResponse: { data: { data: TokenMetadata } } = {
                data: {
                    data: {
                        name: 'Test Token',
                        symbol: 'TEST',
                        image: 'https://example.com/image.png',
                        telegram: 'https://t.me/testtoken',
                        twitter: 'https://twitter.com/testtoken',
                        website: 'https://testtoken.com',
                    },
                },
            };
            (axios.request as jest.Mock).mockResolvedValue(mockResponse);

            const result = await client.getTokenMetadata(chainId, tokenMint);

            expect(result).toEqual({
                name: 'Test Token',
                symbol: 'TEST',
                image: 'https://example.com/image.png',
                telegram: 'https://t.me/testtoken',
                twitter: 'https://twitter.com/testtoken',
                website: 'https://testtoken.com',
            });
            expect(axios.request).toHaveBeenCalledWith({
                method: 'GET',
                url: '/api/v1/token/metadata',
                params: { chainID: chainId, tokenMint },
            });
        });
    });

    describe('getTokenSymbol', () => {
        const chainId = 1;
        const tokenMint = '0xtoken';

        it('should fetch token symbol successfully', async () => {
            const mockResponse: { data: { data: TokenSymbol } } = {
                data: {
                    data: {
                        symbol: 'TEST',
                    },
                },
            };
            (axios.request as jest.Mock).mockResolvedValue(mockResponse);

            const result = await client.getTokenSymbol(chainId, tokenMint);

            expect(result).toEqual({
                symbol: 'TEST',
            });
            expect(axios.request).toHaveBeenCalledWith({
                method: 'GET',
                url: '/api/v1/token/symbol',
                params: { chainID: chainId, tokenMint },
            });
        });
    });

    describe('getTopTraders', () => {
        const marketId = 'test-market';
        const chainId = 1;

        it('should fetch top traders successfully', async () => {
            const mockResponse: { data: { data: TopTrader[] } } = {
                data: {
                    data: [
                        {
                            walletAddress: '0x123',
                            pnlUsd: 1000,
                            investedAmount_tokens: 100,
                            investedAmount_usd: 1000,
                            investedTxns: 5,
                            remainingTokens: 50,
                            remainingUsd: 500,
                            soldAmountTokens: 50,
                            soldAmountUsd: 500,
                            soldTxns: 2,
                        },
                        {
                            walletAddress: '0x456',
                            pnlUsd: 500,
                            investedAmount_tokens: 200,
                            investedAmount_usd: 2000,
                            investedTxns: 10,
                            remainingTokens: 100,
                            remainingUsd: 1000,
                            soldAmountTokens: 100,
                            soldAmountUsd: 1000,
                            soldTxns: 5,
                        },
                    ],
                },
            };
            (axios.request as jest.Mock).mockResolvedValue(mockResponse);

            const result = await client.getTopTraders(marketId, chainId);

            expect(result).toEqual([
                {
                    walletAddress: '0x123',
                    pnlUsd: 1000,
                    investedAmount_tokens: 100,
                    investedAmount_usd: 1000,
                    investedTxns: 5,
                    remainingTokens: 50,
                    remainingUsd: 500,
                    soldAmountTokens: 50,
                    soldAmountUsd: 500,
                    soldTxns: 2,
                },
                {
                    walletAddress: '0x456',
                    pnlUsd: 500,
                    investedAmount_tokens: 200,
                    investedAmount_usd: 2000,
                    investedTxns: 10,
                    remainingTokens: 100,
                    remainingUsd: 1000,
                    soldAmountTokens: 100,
                    soldAmountUsd: 1000,
                    soldTxns: 5,
                },
            ]);
            expect(axios.request).toHaveBeenCalledWith({
                method: 'GET',
                url: '/api/v1/token/top-traders',
                params: { marketID: marketId, chainID: chainId },
            });
        });
    });

    describe('searchTokens', () => {
        const criteria = 'test';
        const chainId = 1;

        it('should search tokens successfully', async () => {
            const mockResponse: { data: { data: TokenSearchResult[] } } = {
                data: {
                    data: [
                        {
                            chainId: 1,
                            marketId: 'market1',
                            name: 'Test Token 1',
                            symbol: 'TEST1',
                            tokenMint: '0xtoken1',
                            tokenType: 'ERC20',
                            percentChange24h: 5,
                            pooledAsset: 1000,
                            tokenLiquidityUsd: 100000,
                            tokenMarketCapUsd: 1000000,
                            tokenPriceUsd: 1,
                            volumeUsd: 500000,
                            createdTimestamp: 1630000000,
                        },
                        {
                            chainId: 1,
                            marketId: 'market2',
                            name: 'Test Token 2',
                            symbol: 'TEST2',
                            tokenMint: '0xtoken2',
                            tokenType: 'ERC20',
                            percentChange24h: -2,
                            pooledAsset: 2000,
                            tokenLiquidityUsd: 200000,
                            tokenMarketCapUsd: 2000000,
                            tokenPriceUsd: 2,
                            volumeUsd: 1000000,
                            createdTimestamp: 1631000000,
                        },
                    ],
                },
            };
            (axios.request as jest.Mock).mockResolvedValue(mockResponse);

            const result = await client.searchTokens(criteria, chainId);

            expect(result).toEqual([
                {
                    chainId: 1,
                    marketId: 'market1',
                    name: 'Test Token 1',
                    symbol: 'TEST1',
                    tokenMint: '0xtoken1',
                    tokenType: 'ERC20',
                    percentChange24h: 5,
                    pooledAsset: 1000,
                    tokenLiquidityUsd: 100000,
                    tokenMarketCapUsd: 1000000,
                    tokenPriceUsd: 1,
                    volumeUsd: 500000,
                    createdTimestamp: 1630000000,
                },
                {
                    chainId: 1,
                    marketId: 'market2',
                    name: 'Test Token 2',
                    symbol: 'TEST2',
                    tokenMint: '0xtoken2',
                    tokenType: 'ERC20',
                    percentChange24h: -2,
                    pooledAsset: 2000,
                    tokenLiquidityUsd: 200000,
                    tokenMarketCapUsd: 2000000,
                    tokenPriceUsd: 2,
                    volumeUsd: 1000000,
                    createdTimestamp: 1631000000,
                },
            ]);
            expect(axios.request).toHaveBeenCalledWith({
                method: 'GET',
                url: '/api/v1/token/search',
                params: { criteria, chainID: chainId },
            });
        });
    });

    describe('getWalletHoldings', () => {
        const walletAddress = '0xwallet';
        const chainId = 1;

        it('should fetch wallet holdings successfully', async () => {
            const mockResponse: { data: { data: WalletHolding[] } } = {
                data: {
                    data: [
                        {
                            marketId: 'market1',
                            tokenHoldings: 1000,
                            tokenSymbol: 'TEST1',
                            usdValue: 1000,
                        },
                        {
                            marketId: 'market2',
                            tokenHoldings: 2000,
                            tokenSymbol: 'TEST2',
                            usdValue: 2000,
                        },
                    ],
                },
            };
            (axios.request as jest.Mock).mockResolvedValue(mockResponse);

            const result = await client.getWalletHoldings(
                walletAddress,
                chainId
            );

            expect(result).toEqual([
                {
                    marketId: 'market1',
                    tokenHoldings: 1000,
                    tokenSymbol: 'TEST1',
                    usdValue: 1000,
                },
                {
                    marketId: 'market2',
                    tokenHoldings: 2000,
                    tokenSymbol: 'TEST2',
                    usdValue: 2000,
                },
            ]);
            expect(axios.request).toHaveBeenCalledWith({
                method: 'GET',
                url: '/api/v1/wallet/holdings',
                params: { walletAddress, chainID: chainId },
            });
        });
    });

    describe('getWalletAggregatedPnl', () => {
        const walletAddress = '0xwallet';
        const chainId = 1;

        it('should fetch wallet aggregated PnL successfully', async () => {
            const mockResponse: { data: { data: WalletAggregatedPnL } } = {
                data: {
                    data: {
                        investedAmount: 10000,
                        pnlPercent: 10,
                        pnlUsd: 1000,
                        soldAmount: 5000,
                        tokensTraded: 5,
                        totalPnlPercent: 15,
                        totalPnlUsd: 1500,
                        unrealizedPnlPercent: 5,
                        unrealizedPnlUsd: 500,
                    },
                },
            };
            (axios.request as jest.Mock).mockResolvedValue(mockResponse);

            const result = await client.getWalletAggregatedPnl(
                walletAddress,
                chainId
            );

            expect(result).toEqual({
                investedAmount: 10000,
                pnlPercent: 10,
                pnlUsd: 1000,
                soldAmount: 5000,
                tokensTraded: 5,
                totalPnlPercent: 15,
                totalPnlUsd: 1500,
                unrealizedPnlPercent: 5,
                unrealizedPnlUsd: 500,
            });
            expect(axios.request).toHaveBeenCalledWith({
                method: 'GET',
                url: '/api/v1/wallet/aggregated-pnl',
                params: { walletAddress, chainID: chainId },
            });
        });
    });

    describe('getWalletPnl', () => {
        const walletAddress = '0xwallet';
        const marketId = 'test-market';
        const chainId = 1;

        it('should fetch wallet PnL successfully', async () => {
            const mockResponse = {
                data: {
                    data: {
                        holderSince: 1609459200,
                        investedAmount: 10000,
                        investedTxns: 10,
                        pnlPercent: 10,
                        pnlUsd: 1000,
                        remainingTokens: 500,
                        remainingUsd: 5000,
                        soldAmount: 5000,
                        soldTxns: 5,
                    } as WalletPnL,
                },
            };
            (axios.request as jest.Mock).mockResolvedValue(mockResponse);

            const result = await client.getWalletPnl(
                walletAddress,
                marketId,
                chainId
            );

            expect(result).toEqual({
                holderSince: 1609459200,
                investedAmount: 10000,
                investedTxns: 10,
                pnlPercent: 10,
                pnlUsd: 1000,
                remainingTokens: 500,
                remainingUsd: 5000,
                soldAmount: 5000,
                soldTxns: 5,
            });
            expect(axios.request).toHaveBeenCalledWith({
                method: 'GET',
                url: '/api/v1/wallet/pnl',
                params: { walletAddress, marketID: marketId, chainID: chainId },
            });
        });
    });

    describe('getTokenPairs', () => {
        const params = {
            chainIds: '1,56',
            tokenTypes: 'type1,type2',
            liquidityMin: 1000,
            page: 1,
        };

        it('should fetch token pairs successfully', async () => {
            const mockResponse = {
                data: {
                    data: {
                        pairs: [
                            {
                                marketId: 'test-market',
                                name: 'Test Token',
                                symbol: 'TEST',
                                tokenMint: 'test-mint',
                                tokenType: 'test-type',
                                description: 'A test token for development',
                                image: 'https://test.com/image.png',
                                metadataUri: 'https://test.com/metadata.json',
                                chainId: 1,
                                contractCreator: 'test-creator',
                                createdTimestamp: Date.now(),
                                lpCreator: 'test-lp-creator',
                                lpBurned: false,
                                mintAuthority: true,
                                freezeAuthority: false,
                                tokenPriceUsd: 1.5,
                                tokenPriceAsset: 2,
                                tokenMarketCapAsset: 1000000,
                                tokenMarketCapUsd: 1500000,
                                tokenLiquidityAsset: 500000,
                                tokenLiquidityUsd: 750000,
                                pooledAsset: 400000,
                                pooledToken: 300000,
                                totalSupply: 1000000,
                                initialAssetLiquidity: 5000,
                                initialUsdLiquidity: 7500,
                                holderCount: 1000,
                                botHolderCount: 50,
                                top10HoldingPercent: 60,
                                isMigrated: false,
                                abused: false,
                                bondingCurvePercentage: 0.5,
                                website: 'https://test.com',
                                twitter: '@testtoken',
                                telegram: 't.me/testtoken',
                                percentChange5m: 2.5,
                                totalTxnCount5m: 150,
                                buyTxnCount5m: 90,
                                sellTxnCount5m: 60,
                                totalVolume5m: 50000,
                                buyVolume5m: 30000,
                                sellVolume5m: 20000,
                                totalMakers5m: 100,
                                buyMakers5m: 60,
                                sellMakers5m: 40,
                                percentChange1h: 5.8,
                                totalTxnCount1h: 600,
                                buyTxnCount1h: 350,
                                sellTxnCount1h: 250,
                                totalVolume1h: 200000,
                                buyVolume1h: 120000,
                                sellVolume1h: 80000,
                                totalMakers1h: 400,
                                buyMakers1h: 250,
                                sellMakers1h: 150,
                                percentChange6h: -3.2,
                                totalTxnCount6h: 2500,
                                buyTxnCount6h: 1200,
                                sellTxnCount6h: 1300,
                                totalVolume6h: 1000000,
                                buyVolume6h: 450000,
                                sellVolume6h: 550000,
                                totalMakers6h: 1500,
                                buyMakers6h: 700,
                                sellMakers6h: 800,
                                percentChange24h: 12.5,
                                totalTxnCount24h: 8000,
                                buyTxnCount24h: 4500,
                                sellTxnCount24h: 3500,
                                totalVolume24h: 3000000,
                                buyVolume24h: 1800000,
                                sellVolume24h: 1200000,
                                totalMakers24h: 5000,
                                buyMakers24h: 3000,
                                sellMakers24h: 2000,
                            },
                            {
                                marketId: 'test-market2',
                                name: 'Test Token',
                                symbol: 'TEST',
                                tokenMint: 'test-mint',
                                tokenType: 'test-type',
                                description: 'A test token for development',
                                image: 'https://test.com/image.png',
                                metadataUri: 'https://test.com/metadata.json',
                                chainId: 1,
                                contractCreator: 'test-creator',
                                createdTimestamp: Date.now(),
                                lpCreator: 'test-lp-creator',
                                lpBurned: false,
                                mintAuthority: true,
                                freezeAuthority: false,
                                tokenPriceUsd: 1.5,
                                tokenPriceAsset: 2,
                                tokenMarketCapAsset: 1000000,
                                tokenMarketCapUsd: 1500000,
                                tokenLiquidityAsset: 500000,
                                tokenLiquidityUsd: 750000,
                                pooledAsset: 400000,
                                pooledToken: 300000,
                                totalSupply: 1000000,
                                initialAssetLiquidity: 5000,
                                initialUsdLiquidity: 7500,
                                holderCount: 1000,
                                botHolderCount: 50,
                                top10HoldingPercent: 60,
                                isMigrated: false,
                                abused: false,
                                bondingCurvePercentage: 0.5,
                                website: 'https://test.com',
                                twitter: '@testtoken',
                                telegram: 't.me/testtoken',
                                percentChange5m: 2.5,
                                totalTxnCount5m: 150,
                                buyTxnCount5m: 90,
                                sellTxnCount5m: 60,
                                totalVolume5m: 50000,
                                buyVolume5m: 30000,
                                sellVolume5m: 20000,
                                totalMakers5m: 100,
                                buyMakers5m: 60,
                                sellMakers5m: 40,
                                percentChange1h: 5.8,
                                totalTxnCount1h: 600,
                                buyTxnCount1h: 350,
                                sellTxnCount1h: 250,
                                totalVolume1h: 200000,
                                buyVolume1h: 120000,
                                sellVolume1h: 80000,
                                totalMakers1h: 400,
                                buyMakers1h: 250,
                                sellMakers1h: 150,
                                percentChange6h: -3.2,
                                totalTxnCount6h: 2500,
                                buyTxnCount6h: 1200,
                                sellTxnCount6h: 1300,
                                totalVolume6h: 1000000,
                                buyVolume6h: 450000,
                                sellVolume6h: 550000,
                                totalMakers6h: 1500,
                                buyMakers6h: 700,
                                sellMakers6h: 800,
                                percentChange24h: 12.5,
                                totalTxnCount24h: 8000,
                                buyTxnCount24h: 4500,
                                sellTxnCount24h: 3500,
                                totalVolume24h: 3000000,
                                buyVolume24h: 1800000,
                                sellVolume24h: 1200000,
                                totalMakers24h: 5000,
                                buyMakers24h: 3000,
                                sellMakers24h: 2000,
                            },
                        ],
                        hasNext: true,
                    } as TokenPairs,
                },
            };
            (axios.request as jest.Mock).mockResolvedValue(mockResponse);

            const result = await client.getTokenPairs(params);

            expect(result).toEqual({
                pairs: [
                    {
                        marketId: 'test-market',
                        name: 'Test Token',
                        symbol: 'TEST',
                        tokenMint: 'test-mint',
                        tokenType: 'test-type',
                        description: 'A test token for development',
                        image: 'https://test.com/image.png',
                        metadataUri: 'https://test.com/metadata.json',
                        chainId: 1,
                        contractCreator: 'test-creator',
                        createdTimestamp: Date.now(),
                        lpCreator: 'test-lp-creator',
                        lpBurned: false,
                        mintAuthority: true,
                        freezeAuthority: false,
                        tokenPriceUsd: 1.5,
                        tokenPriceAsset: 2,
                        tokenMarketCapAsset: 1000000,
                        tokenMarketCapUsd: 1500000,
                        tokenLiquidityAsset: 500000,
                        tokenLiquidityUsd: 750000,
                        pooledAsset: 400000,
                        pooledToken: 300000,
                        totalSupply: 1000000,
                        initialAssetLiquidity: 5000,
                        initialUsdLiquidity: 7500,
                        holderCount: 1000,
                        botHolderCount: 50,
                        top10HoldingPercent: 60,
                        isMigrated: false,
                        abused: false,
                        bondingCurvePercentage: 0.5,
                        website: 'https://test.com',
                        twitter: '@testtoken',
                        telegram: 't.me/testtoken',
                        percentChange5m: 2.5,
                        totalTxnCount5m: 150,
                        buyTxnCount5m: 90,
                        sellTxnCount5m: 60,
                        totalVolume5m: 50000,
                        buyVolume5m: 30000,
                        sellVolume5m: 20000,
                        totalMakers5m: 100,
                        buyMakers5m: 60,
                        sellMakers5m: 40,
                        percentChange1h: 5.8,
                        totalTxnCount1h: 600,
                        buyTxnCount1h: 350,
                        sellTxnCount1h: 250,
                        totalVolume1h: 200000,
                        buyVolume1h: 120000,
                        sellVolume1h: 80000,
                        totalMakers1h: 400,
                        buyMakers1h: 250,
                        sellMakers1h: 150,
                        percentChange6h: -3.2,
                        totalTxnCount6h: 2500,
                        buyTxnCount6h: 1200,
                        sellTxnCount6h: 1300,
                        totalVolume6h: 1000000,
                        buyVolume6h: 450000,
                        sellVolume6h: 550000,
                        totalMakers6h: 1500,
                        buyMakers6h: 700,
                        sellMakers6h: 800,
                        percentChange24h: 12.5,
                        totalTxnCount24h: 8000,
                        buyTxnCount24h: 4500,
                        sellTxnCount24h: 3500,
                        totalVolume24h: 3000000,
                        buyVolume24h: 1800000,
                        sellVolume24h: 1200000,
                        totalMakers24h: 5000,
                        buyMakers24h: 3000,
                        sellMakers24h: 2000,
                    },
                    {
                        marketId: 'test-market2',
                        name: 'Test Token',
                        symbol: 'TEST',
                        tokenMint: 'test-mint',
                        tokenType: 'test-type',
                        description: 'A test token for development',
                        image: 'https://test.com/image.png',
                        metadataUri: 'https://test.com/metadata.json',
                        chainId: 1,
                        contractCreator: 'test-creator',
                        createdTimestamp: Date.now(),
                        lpCreator: 'test-lp-creator',
                        lpBurned: false,
                        mintAuthority: true,
                        freezeAuthority: false,
                        tokenPriceUsd: 1.5,
                        tokenPriceAsset: 2,
                        tokenMarketCapAsset: 1000000,
                        tokenMarketCapUsd: 1500000,
                        tokenLiquidityAsset: 500000,
                        tokenLiquidityUsd: 750000,
                        pooledAsset: 400000,
                        pooledToken: 300000,
                        totalSupply: 1000000,
                        initialAssetLiquidity: 5000,
                        initialUsdLiquidity: 7500,
                        holderCount: 1000,
                        botHolderCount: 50,
                        top10HoldingPercent: 60,
                        isMigrated: false,
                        abused: false,
                        bondingCurvePercentage: 0.5,
                        website: 'https://test.com',
                        twitter: '@testtoken',
                        telegram: 't.me/testtoken',
                        percentChange5m: 2.5,
                        totalTxnCount5m: 150,
                        buyTxnCount5m: 90,
                        sellTxnCount5m: 60,
                        totalVolume5m: 50000,
                        buyVolume5m: 30000,
                        sellVolume5m: 20000,
                        totalMakers5m: 100,
                        buyMakers5m: 60,
                        sellMakers5m: 40,
                        percentChange1h: 5.8,
                        totalTxnCount1h: 600,
                        buyTxnCount1h: 350,
                        sellTxnCount1h: 250,
                        totalVolume1h: 200000,
                        buyVolume1h: 120000,
                        sellVolume1h: 80000,
                        totalMakers1h: 400,
                        buyMakers1h: 250,
                        sellMakers1h: 150,
                        percentChange6h: -3.2,
                        totalTxnCount6h: 2500,
                        buyTxnCount6h: 1200,
                        sellTxnCount6h: 1300,
                        totalVolume6h: 1000000,
                        buyVolume6h: 450000,
                        sellVolume6h: 550000,
                        totalMakers6h: 1500,
                        buyMakers6h: 700,
                        sellMakers6h: 800,
                        percentChange24h: 12.5,
                        totalTxnCount24h: 8000,
                        buyTxnCount24h: 4500,
                        sellTxnCount24h: 3500,
                        totalVolume24h: 3000000,
                        buyVolume24h: 1800000,
                        sellVolume24h: 1200000,
                        totalMakers24h: 5000,
                        buyMakers24h: 3000,
                        sellMakers24h: 2000,
                    },
                ],
                hasNext: true,
            });
            expect(axios.request).toHaveBeenCalledWith({
                method: 'GET',
                url: '/api/v1/token/pairs',
                params: params,
            });
        });
    });
});
