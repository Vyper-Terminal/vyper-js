import WebSocket from 'ws';
import { VyperWebsocketError } from './errors';
import { TokenPair, ChainAction } from './types';
import { Buffer } from 'buffer';

export enum FeedType {
    TOKEN_EVENTS = 'token-events',
    MIGRATION_EVENTS = 'migration-events',
    WALLET_EVENTS = 'wallet-events',
}

export enum SubscriptionMessageType {
    SUBSCRIBE = 'subscribe',
    UNSUBSCRIBE = 'unsubscribe',
}

export enum SubscriptionType {
    PUMPFUN_TOKENS = 'PumpfunTokens',
    RAYDIUM_AMM_TOKENS = 'RaydiumAmmTokens',
    RAYDIUM_CPMM_TOKENS = 'RaydiumCpmmTokens',
    RAYDIUM_CLMM_TOKENS = 'RaydiumClmmTokens',
}

export interface TokenSubscriptionMessage {
    action:
        | SubscriptionMessageType.SUBSCRIBE
        | SubscriptionMessageType.UNSUBSCRIBE;
    types: SubscriptionType[];
}

export interface WalletSubscriptionMessage {
    action:
        | SubscriptionMessageType.SUBSCRIBE
        | SubscriptionMessageType.UNSUBSCRIBE;
    wallets: string[];
}

export type MessageHandler = (data: any) => void;

export class VyperWebsocketClient {
    private baseUrl: string;
    private apiKey: string;
    private connection?: WebSocket;
    private messageHandler?: MessageHandler;
    private currentFeedType?: FeedType;

    constructor(apiKey: string) {
        this.baseUrl = 'wss://api.vyper.trade/api/v1/ws';
        this.apiKey = apiKey;
    }

    async connect(feedType: FeedType): Promise<void> {
        const url = `${this.baseUrl}/${feedType}?apiKey=${this.apiKey}`;
        this.currentFeedType = feedType;
        return new Promise((resolve, reject) => {
            this.connection = new WebSocket(url);
            this.connection.on('open', () => resolve());
            this.connection.on('error', (error) =>
                reject(
                    new VyperWebsocketError(
                        `Failed to connect: ${error}`,
                        undefined,
                        url
                    )
                )
            );
        });
    }

    async subscribe(
        feedType: FeedType,
        subscriptionMessage:
            | TokenSubscriptionMessage
            | WalletSubscriptionMessage
    ): Promise<void> {
        if (!this.connection) {
            throw new VyperWebsocketError('Not connected to WebSocket');
        }
        if (
            feedType === FeedType.TOKEN_EVENTS ||
            feedType === FeedType.WALLET_EVENTS
        ) {
            try {
                this.connection.send(JSON.stringify(subscriptionMessage));
            } catch (error) {
                throw new VyperWebsocketError(`Failed to subscribe: ${error}`);
            }
        }
    }

    async unsubscribe(
        feedType: FeedType,
        subscriptionMessage:
            | TokenSubscriptionMessage
            | WalletSubscriptionMessage
    ): Promise<void> {
        if (!this.connection) {
            throw new VyperWebsocketError('Not connected to WebSocket');
        }
        if (
            feedType === FeedType.TOKEN_EVENTS ||
            feedType === FeedType.WALLET_EVENTS
        ) {
            try {
                this.connection.send(JSON.stringify(subscriptionMessage));
            } catch (error) {
                throw new VyperWebsocketError(
                    `Failed to unsubscribe: ${error}`
                );
            }
        }
    }

    async listen(): Promise<void> {
        if (!this.connection) {
            throw new VyperWebsocketError('Not connected to WebSocket');
        }
        return new Promise<void>((resolve, reject) => {
            this.connection!.on('open', () => {
                console.log(
                    'Vyper Websocket | WebSocket connection is open and ready to receive messages'
                );
                resolve();
            });

            this.connection!.on(
                'message',
                (data: Buffer | ArrayBuffer | Buffer[]) => {
                    if (this.messageHandler) {
                        let parsedData;
                        try {
                            if (Buffer.isBuffer(data)) {
                                parsedData = JSON.parse(data.toString());
                            } else if (data instanceof ArrayBuffer) {
                                parsedData = JSON.parse(
                                    new TextDecoder().decode(data)
                                );
                            } else if (Array.isArray(data)) {
                                parsedData = JSON.parse(
                                    Buffer.concat(data).toString()
                                );
                            } else {
                                throw new Error('Unsupported data type');
                            }

                            const convertedData =
                                this.convertMessage(parsedData);
                            this.messageHandler(convertedData);
                        } catch (error) {
                            console.error(
                                'Vyper Websocket | Error parsing message:',
                                error
                            );
                        }
                    }
                }
            );

            this.connection!.on('close', () => {
                reject(
                    new VyperWebsocketError('Connection closed unexpectedly')
                );
            });

            this.connection!.on('error', (error) => {
                reject(
                    new VyperWebsocketError(
                        `Error while listening to messages: ${error}`
                    )
                );
            });
        });
    }

    private convertMessage(data: any): ChainAction | TokenPair {
        switch (this.currentFeedType) {
            case FeedType.WALLET_EVENTS:
                return this.convertToChainAction(data);
            case FeedType.MIGRATION_EVENTS:
            case FeedType.TOKEN_EVENTS:
                return this.convertToTokenPair(data);
            default:
                throw new Error(`Unknown feed type: ${this.currentFeedType}`);
        }
    }

    private convertToChainAction(data: any): ChainAction {
        return {
            signer: data.signer,
            tokenAccount: data.tokenAccount,
            transactionId: data.transactionId,
            tokenMint: data.tokenMint,
            marketId: data.marketId,
            actionType: data.actionType,
            tokenAmount: data.tokenAmount,
            assetAmount: data.assetAmount,
            tokenPriceUsd: data.tokenPriceUsd,
            tokenPriceAsset: data.tokenPriceAsset,
            swapTotalUsd: data.swapTotalUsd,
            swapTotalAsset: data.swapTotalAsset,
            tokenMarketCapAsset: data.tokenMarketCapAsset,
            tokenMarketCapUsd: data.tokenMarketCapUsd,
            tokenLiquidityAsset: data.tokenLiquidityAsset,
            tokenLiquidityUsd: data.tokenLiquidityUsd,
            pooledToken: data.pooledToken,
            pooledAsset: data.pooledAsset,
            actionTimestamp: data.actionTimestamp,
            bondingCurvePercentage: data.bondingCurvePercentage,
            botUsed: data.botUsed,
        };
    }

    private convertToTokenPair(data: any): TokenPair {
        return {
            tokenType: data.tokenType,
            chainId: data.chainId,
            name: data.name,
            description: data.description,
            symbol: data.symbol,
            image: data.image,
            metadataUri: data.metadataUri,
            contractCreator: data.contractCreator,
            lpCreator: data.lpCreator,
            createdTimestamp: data.createdTimestamp,
            mintAuthority: data.mintAuthority,
            freezeAuthority: data.freezeAuthority,
            totalSupply: data.totalSupply,
            tokenMint: data.tokenMint,
            marketId: data.marketId,
            migratedMarketId: data.migratedMarketId,
            initialAssetLiquidity: data.initialAssetLiquidity,
            initialUsdLiquidity: data.initialUsdLiquidity,
            tokenLiquidityAsset: data.tokenLiquidityAsset,
            tokenLiquidityUsd: data.tokenLiquidityUsd,
            pooledToken: data.pooledToken,
            pooledAsset: data.pooledAsset,
            tokenPriceAsset: data.tokenPriceAsset,
            tokenPriceUsd: data.tokenPriceUsd,
            tokenMarketCapAsset: data.tokenMarketCapAsset,
            tokenMarketCapUsd: data.tokenMarketCapUsd,
            abused: data.abused,
            isMigrated: data.isMigrated,
            lpBurned: data.lpBurned,
            website: data.website,
            twitter: data.twitter,
            telegram: data.telegram,
            bondingCurvePercentage: data.bondingCurvePercentage,
            migrationState: data.migrationState,
            top10HoldingPercent: data.top10HoldingPercent,
            holderCount: data.holderCount,
            botHolderCount: data.botHolderCount,
            percentChange5m: data.percentChange5m,
            totalTxnCount5m: data.totalTxnCount5m,
            buyTxnCount5m: data.buyTxnCount5m,
            sellTxnCount5m: data.sellTxnCount5m,
            totalVolume5m: data.totalVolume5m,
            buyVolume5m: data.buyVolume5m,
            sellVolume5m: data.sellVolume5m,
            totalMakers5m: data.totalMakers5m,
            buyMakers5m: data.buyMakers5m,
            sellMakers5m: data.sellMakers5m,
            percentChange1h: data.percentChange1h,
            totalTxnCount1h: data.totalTxnCount1h,
            buyTxnCount1h: data.buyTxnCount1h,
            sellTxnCount1h: data.sellTxnCount1h,
            totalVolume1h: data.totalVolume1h,
            buyVolume1h: data.buyVolume1h,
            sellVolume1h: data.sellVolume1h,
            totalMakers1h: data.totalMakers1h,
            buyMakers1h: data.buyMakers1h,
            sellMakers1h: data.sellMakers1h,
            percentChange6h: data.percentChange6h,
            totalTxnCount6h: data.totalTxnCount6h,
            buyTxnCount6h: data.buyTxnCount6h,
            sellTxnCount6h: data.sellTxnCount6h,
            totalVolume6h: data.totalVolume6h,
            buyVolume6h: data.buyVolume6h,
            sellVolume6h: data.sellVolume6h,
            totalMakers6h: data.totalMakers6h,
            buyMakers6h: data.buyMakers6h,
            sellMakers6h: data.sellMakers6h,
            percentChange24h: data.percentChange24h,
            totalTxnCount24h: data.totalTxnCount24h,
            buyTxnCount24h: data.buyTxnCount24h,
            sellTxnCount24h: data.sellTxnCount24h,
            totalVolume24h: data.totalVolume24h,
            buyVolume24h: data.buyVolume24h,
            sellVolume24h: data.sellVolume24h,
            totalMakers24h: data.totalMakers24h,
            buyMakers24h: data.buyMakers24h,
            sellMakers24h: data.sellMakers24h,
        };
    }

    async disconnect(): Promise<void> {
        if (this.connection) {
            return new Promise((resolve, reject) => {
                this.connection!.close();
                this.connection!.on('close', () => {
                    this.connection = undefined;
                    resolve();
                });
                this.connection!.on('error', (error) => {
                    reject(
                        new VyperWebsocketError(
                            `Failed to disconnect: ${error}`
                        )
                    );
                });
            });
        }
    }

    async cleanup(): Promise<void> {
        if (this.connection) {
            await this.disconnect();
        }
    }

    async ping(): Promise<void> {
        if (!this.connection) {
            throw new VyperWebsocketError('Not connected to WebSocket');
        }
        try {
            this.connection.ping();
        } catch (error) {
            throw new VyperWebsocketError(`Failed to send ping: ${error}`);
        }
    }

    async pong(): Promise<void> {
        if (!this.connection) {
            throw new VyperWebsocketError('Not connected to WebSocket');
        }
        try {
            this.connection.pong();
        } catch (error) {
            throw new VyperWebsocketError(`Failed to send pong: ${error}`);
        }
    }

    setMessageHandler(handler: MessageHandler): void {
        this.messageHandler = handler;
    }
}
