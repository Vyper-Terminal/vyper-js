import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
    APIResponse,
    TokenATH,
    TokenPair,
    TokenMarket,
    TokenMetadata,
    TokenSymbol,
    TopTrader,
    TokenSearchResult,
    WalletHolding,
    WalletAggregatedPnL,
    WalletPnL,
    TokenPairs,
    TokenHolder,
} from './types';
import {
    VyperApiError,
    AuthenticationError,
    RateLimitError,
    ServerError,
} from './errors';

export class VyperClient {
    private baseUrl: string;
    private apiKey?: string;
    private axiosInstance: AxiosInstance;

    constructor(apiKey?: string) {
        this.baseUrl = 'https://api.vyper.trade';
        this.apiKey = apiKey;
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: apiKey ? { 'X-API-Key': apiKey } : {},
        });
    }

    private async request<T>(
        method: string,
        endpoint: string,
        params?: any
    ): Promise<APIResponse<T>> {
        try {
            const response: AxiosResponse<APIResponse<T>> =
                await this.axiosInstance.request({
                    method,
                    url: endpoint,
                    params,
                });
            return response.data;
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const { status, data } = error.response;
                    if (status === 401) {
                        throw new AuthenticationError(
                            'Invalid or expired API key',
                            status,
                            data
                        );
                    } else if (status === 429) {
                        const retryAfter = parseFloat(
                            error.response.headers['retry-after'] || '3.00'
                        );
                        throw new RateLimitError(
                            `Rate limit exceeded. Please wait ${retryAfter} seconds before making another request.`,
                            retryAfter
                        );
                    } else if (status >= 500 && status < 600) {
                        throw new ServerError(
                            `Server error: ${status}`,
                            status,
                            data
                        );
                    } else {
                        throw new VyperApiError(
                            `HTTP error occurred: ${error.message}`,
                            status,
                            data
                        );
                    }
                }
            }
            if (error.message === 'Network Error') {
                throw new ServerError('Server error: Network Error');
            }
            throw new ServerError(`An error occurred: ${error.message}`);
        }
    }

    async getChainIds(): Promise<Record<string, number>> {
        const originalApiKey = this.axiosInstance.defaults.headers['X-API-Key'];
        delete this.axiosInstance.defaults.headers['X-API-Key'];
        try {
            const response = await this.request<Record<string, number>>(
                'GET',
                '/api/v1/chain/ids'
            );
            return response.data;
        } finally {
            if (originalApiKey) {
                this.axiosInstance.defaults.headers['X-API-Key'] =
                    originalApiKey;
            }
        }
    }

    async getTokenAth(chainId: number, marketId: string): Promise<TokenATH> {
        if (!this.apiKey) {
            throw new AuthenticationError(
                'API key is required for this endpoint'
            );
        }
        const response = await this.request<TokenATH>(
            'GET',
            '/api/v1/token/ath',
            { chainID: chainId, marketID: marketId }
        );
        return response.data;
    }

    async getTokenMarket(
        marketId: string,
        chainId: number = 900,
        interval: string = '24h'
    ): Promise<TokenPair> {
        if (!this.apiKey) {
            throw new AuthenticationError(
                'API key is required for this endpoint'
            );
        }
        const response = await this.request<TokenPair>(
            'GET',
            `/api/v1/token/market/${marketId}`,
            { chainID: chainId, interval }
        );
        return response.data;
    }

    async getTokenHolders(
        marketId: string,
        chainId: number
    ): Promise<{ holders: TokenHolder[]; totalHolders: number }> {
        if (!this.apiKey) {
            throw new AuthenticationError(
                'API key is required for this endpoint'
            );
        }
        const response = await this.request<{
            holders: TokenHolder[];
            total_holders: number;
        }>('GET', '/api/v1/token/holders', {
            marketID: marketId,
            chainID: chainId,
        });
        return {
            holders: response.data.holders,
            totalHolders: response.data.total_holders,
        };
    }

    async getTokenMarkets(
        tokenMint: string,
        chainId: number
    ): Promise<TokenMarket[]> {
        if (!this.apiKey) {
            throw new AuthenticationError(
                'API key is required for this endpoint'
            );
        }
        const response = await this.request<TokenMarket[]>(
            'GET',
            '/api/v1/token/markets',
            { tokenMint, chainID: chainId }
        );
        return response.data;
    }

    async getTokenMetadata(
        chainId: number,
        tokenMint: string
    ): Promise<TokenMetadata> {
        if (!this.apiKey) {
            throw new AuthenticationError(
                'API key is required for this endpoint'
            );
        }
        const response = await this.request<TokenMetadata>(
            'GET',
            '/api/v1/token/metadata',
            { chainID: chainId, tokenMint }
        );
        return response.data;
    }

    async getTokenSymbol(
        chainId: number,
        tokenMint: string
    ): Promise<TokenSymbol> {
        if (!this.apiKey) {
            throw new AuthenticationError(
                'API key is required for this endpoint'
            );
        }
        const response = await this.request<TokenSymbol>(
            'GET',
            '/api/v1/token/symbol',
            { chainID: chainId, tokenMint }
        );
        return response.data;
    }

    async getTopTraders(
        marketId: string,
        chainId: number
    ): Promise<TopTrader[]> {
        if (!this.apiKey) {
            throw new AuthenticationError(
                'API key is required for this endpoint'
            );
        }
        const response = await this.request<TopTrader[]>(
            'GET',
            '/api/v1/token/top-traders',
            { marketID: marketId, chainID: chainId }
        );
        return response.data;
    }

    async searchTokens(
        criteria: string,
        chainId?: number
    ): Promise<TokenSearchResult[]> {
        if (!this.apiKey) {
            throw new AuthenticationError(
                'API key is required for this endpoint'
            );
        }
        const params: any = { criteria };
        if (chainId !== undefined) {
            params.chainID = chainId;
        }
        const response = await this.request<TokenSearchResult[]>(
            'GET',
            '/api/v1/token/search',
            params
        );
        return response.data;
    }

    async getWalletHoldings(
        walletAddress: string,
        chainId: number
    ): Promise<WalletHolding[]> {
        const response = await this.request<WalletHolding[]>(
            'GET',
            '/wallet/holdings',
            { walletAddress, chainID: chainId }
        );
        return response.data;
    }

    async getWalletAggregatedPnl(
        walletAddress: string,
        chainId: number
    ): Promise<WalletAggregatedPnL> {
        const response = await this.request<WalletAggregatedPnL>(
            'GET',
            '/wallet/aggregated-pnl',
            { walletAddress, chainID: chainId }
        );
        return response.data;
    }

    async getWalletPnl(
        walletAddress: string,
        marketId: string,
        chainId: number
    ): Promise<WalletPnL> {
        const response = await this.request<WalletPnL>('GET', '/wallet/pnl', {
            walletAddress,
            marketID: marketId,
            chainID: chainId,
        });
        return response.data;
    }

    async getTokenPairs(params: {
        atLeastOneSocial?: boolean;
        buysMax?: number;
        buysMin?: number;
        chainIds?: string;
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
        tokenTypes?: string;
        top10Holders?: boolean;
        volumeMax?: number;
        volumeMin?: number;
    }): Promise<TokenPairs> {
        const response = await this.request<TokenPairs>(
            'GET',
            '/token/pairs',
            params
        );
        return response.data;
    }
}
