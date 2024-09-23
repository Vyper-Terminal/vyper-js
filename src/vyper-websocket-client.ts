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
            abused: data.abused,
            bondingCurvePercentage: data.bondingCurvePercentage,
            buyTxnCount: data.buyTxnCount,
            chainId: data.chainId,
            contractCreator: data.contractCreator,
            createdTimestamp: data.createdTimestamp,
            description: data.description,
            freezeAuthority: data.freezeAuthority,
            image: data.image,
            initialAssetLiquidity: data.initialAssetLiquidity,
            initialUsdLiquidity: data.initialUsdLiquidity,
            isMigrated: data.isMigrated,
            lpBurned: data.lpBurned,
            lpCreator: data.lpCreator,
            marketId: data.marketId,
            metadataUri: data.metadataUri,
            migratedMarketId: data.migratedMarketId,
            migrationState: data.migrationState,
            mintAuthority: data.mintAuthority,
            name: data.name,
            pooledAsset: data.pooledAsset,
            pooledToken: data.pooledToken,
            priceChangePercent: data.priceChangePercent,
            sellTxnCount: data.sellTxnCount,
            symbol: data.symbol,
            telegram: data.telegram,
            tokenLiquidityAsset: data.tokenLiquidityAsset,
            tokenLiquidityUsd: data.tokenLiquidityUsd,
            tokenMarketCapAsset: data.tokenMarketCapAsset,
            tokenMarketCapUsd: data.tokenMarketCapUsd,
            tokenMint: data.tokenMint,
            tokenPriceAsset: data.tokenPriceAsset,
            tokenPriceUsd: data.tokenPriceUsd,
            tokenType: data.tokenType,
            top10HoldingPercent: data.top10HoldingPercent,
            totalSupply: data.totalSupply,
            transactionCount: data.transactionCount,
            twitter: data.twitter,
            volumeAsset: data.volumeAsset,
            volumeUsd: data.volumeUsd,
            website: data.website,
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
