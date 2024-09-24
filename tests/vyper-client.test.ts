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
                        tokenMint: '0x123',
                        name: 'Test Token',
                        symbol: 'TEST',
                        tokenType: 'ERC20',
                        tokenPriceUsd: 10,
                        tokenPriceAsset: 0.1,
                        priceChangePercent: 5,
                        volumeUsd: 1000000,
                        volumeAsset: 100000,
                        tokenLiquidityUsd: 5000000,
                        tokenLiquidityAsset: 500000,
                        tokenMarketCapUsd: 100000000,
                        tokenMarketCapAsset: 10000000,
                        totalSupply: 1000000000,
                        transactionCount: 5000,
                        buyTxnCount: 3000,
                        sellTxnCount: 2000,
                        pooledToken: 500000,
                        pooledAsset: 50000,
                        top10HoldingPercent: 30,
                        createdTimestamp: 1609459200,
                        contractCreator: '0xabcd',
                        lpCreator: '0xef01',
                        lpBurned: false,
                        initialUsdLiquidity: 1000000,
                        initialAssetLiquidity: 100000,
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
                        chainId: 900,
                        tokenMint: '0x123',
                        name: 'Test Token',
                        symbol: 'TEST',
                        tokenType: 'ERC20',
                        tokenPriceUsd: 10,
                        tokenPriceAsset: 0.1,
                        priceChangePercent: 5,
                        volumeUsd: 1000000,
                        volumeAsset: 100000,
                        tokenLiquidityUsd: 5000000,
                        tokenLiquidityAsset: 500000,
                        tokenMarketCapUsd: 100000000,
                        tokenMarketCapAsset: 10000000,
                        totalSupply: 1000000000,
                        transactionCount: 5000,
                        buyTxnCount: 3000,
                        sellTxnCount: 2000,
                        pooledToken: 500000,
                        pooledAsset: 50000,
                        top10HoldingPercent: 30,
                        createdTimestamp: 1609459200,
                        contractCreator: '0xabcd',
                        lpCreator: '0xef01',
                        lpBurned: false,
                        initialUsdLiquidity: 1000000,
                        initialAssetLiquidity: 100000,
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
                                marketId: 'market1',
                                name: 'Pair 1',
                                symbol: 'P1',
                                tokenMint: '0xmint1',
                                chainId: 1,
                                buyTxnCount: 100,
                                sellTxnCount: 50,
                                transactionCount: 150,
                                tokenLiquidityUsd: 500000,
                                tokenLiquidityAsset: 1000,
                                tokenMarketCapUsd: 1000000,
                                tokenMarketCapAsset: 2000,
                                tokenPriceUsd: 5,
                                tokenPriceAsset: 10,
                                totalSupply: 100000,
                                pooledToken: 10000,
                                pooledAsset: 2000,
                                top10HoldingPercent: 30,
                                initialUsdLiquidity: 500000,
                                initialAssetLiquidity: 1000,
                                createdTimestamp: 1609459200,
                                contractCreator: '0xabcd',
                                lpCreator: '0xef01',
                                lpBurned: false,
                                volumeUsd: 1000000,
                                volumeAsset: 5000,
                                priceChangePercent: 10,
                            },
                            {
                                marketId: 'market2',
                                name: 'Pair 2',
                                symbol: 'P2',
                                tokenMint: '0xmint2',
                                chainId: 56,
                                buyTxnCount: 200,
                                sellTxnCount: 100,
                                transactionCount: 300,
                                tokenLiquidityUsd: 600000,
                                tokenLiquidityAsset: 1200,
                                tokenMarketCapUsd: 1200000,
                                tokenMarketCapAsset: 2400,
                                tokenPriceUsd: 6,
                                tokenPriceAsset: 12,
                                totalSupply: 120000,
                                pooledToken: 12000,
                                pooledAsset: 2400,
                                top10HoldingPercent: 40,
                                initialUsdLiquidity: 600000,
                                initialAssetLiquidity: 1200,
                                createdTimestamp: 1609459200,
                                contractCreator: '0xefgh',
                                lpCreator: '0ijkl',
                                lpBurned: false,
                                volumeUsd: 1200000,
                                volumeAsset: 6000,
                                priceChangePercent: 12,
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
                        marketId: 'market1',
                        name: 'Pair 1',
                        symbol: 'P1',
                        tokenMint: '0xmint1',
                        chainId: 1,
                        buyTxnCount: 100,
                        sellTxnCount: 50,
                        transactionCount: 150,
                        tokenLiquidityUsd: 500000,
                        tokenLiquidityAsset: 1000,
                        tokenMarketCapUsd: 1000000,
                        tokenMarketCapAsset: 2000,
                        tokenPriceUsd: 5,
                        tokenPriceAsset: 10,
                        totalSupply: 100000,
                        pooledToken: 10000,
                        pooledAsset: 2000,
                        top10HoldingPercent: 30,
                        initialUsdLiquidity: 500000,
                        initialAssetLiquidity: 1000,
                        createdTimestamp: 1609459200,
                        contractCreator: '0xabcd',
                        lpCreator: '0xef01',
                        lpBurned: false,
                        volumeUsd: 1000000,
                        volumeAsset: 5000,
                        priceChangePercent: 10,
                    },
                    {
                        marketId: 'market2',
                        name: 'Pair 2',
                        symbol: 'P2',
                        tokenMint: '0xmint2',
                        chainId: 56,
                        buyTxnCount: 200,
                        sellTxnCount: 100,
                        transactionCount: 300,
                        tokenLiquidityUsd: 600000,
                        tokenLiquidityAsset: 1200,
                        tokenMarketCapUsd: 1200000,
                        tokenMarketCapAsset: 2400,
                        tokenPriceUsd: 6,
                        tokenPriceAsset: 12,
                        totalSupply: 120000,
                        pooledToken: 12000,
                        pooledAsset: 2400,
                        top10HoldingPercent: 40,
                        initialUsdLiquidity: 600000,
                        initialAssetLiquidity: 1200,
                        createdTimestamp: 1609459200,
                        contractCreator: '0xefgh',
                        lpCreator: '0ijkl',
                        lpBurned: false,
                        volumeUsd: 1200000,
                        volumeAsset: 6000,
                        priceChangePercent: 12,
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
