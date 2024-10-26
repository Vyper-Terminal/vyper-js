import {
    VyperWebsocketClient,
    FeedType,
    SubscriptionMessageType,
    SubscriptionType,
} from '../src/vyper-websocket-client';
import { TokenPair, ChainAction } from '../src/types';
import { VyperWebsocketError } from '../src/errors';

jest.mock('ws', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            on: jest.fn(),
            send: jest.fn(),
            close: jest.fn(),
            ping: jest.fn(),
            pong: jest.fn(),
        })),
    };
});

describe('VyperWebsocketClient', () => {
    let client: VyperWebsocketClient;
    const mockApiKey = 'test-api-key';
    let MockWebSocket: jest.Mock;

    beforeEach(() => {
        client = new VyperWebsocketClient(mockApiKey);
        MockWebSocket = jest.requireMock('ws').default;
        MockWebSocket.mockClear();
    });

    describe('connect', () => {
        it('should connect to the websocket successfully', async () => {
            const mockWs = new MockWebSocket();
            let openCallback: (() => void) | null = null;

            mockWs.on.mockImplementation(
                (event: string, callback: () => void) => {
                    if (event === 'open') {
                        openCallback = callback;
                    }
                }
            );

            MockWebSocket.mockImplementation(() => mockWs);

            const connectPromise = client.connect(FeedType.TOKEN_EVENTS);

            setTimeout(() => {
                if (openCallback) openCallback();
            }, 100);

            await expect(connectPromise).resolves.toBeUndefined();
            expect(MockWebSocket).toHaveBeenCalledWith(
                `wss://api.vyper.trade/api/v1/ws/token-events?apiKey=${mockApiKey}`
            );
        }, 10000);

        it('should throw an error if connection fails', async () => {
            const mockWs = new MockWebSocket();
            let errorCallback: ((error: Error) => void) | null = null;

            mockWs.on.mockImplementation(
                (event: string, callback: (error: Error) => void) => {
                    if (event === 'error') {
                        errorCallback = callback;
                    }
                }
            );

            MockWebSocket.mockImplementation(() => mockWs);

            const connectPromise = client.connect(FeedType.TOKEN_EVENTS);

            setTimeout(() => {
                if (errorCallback)
                    errorCallback(new Error('Connection failed'));
            }, 100);

            await expect(connectPromise).rejects.toThrow(VyperWebsocketError);
        }, 10000);
    });

    describe('subscribe', () => {
        it('should send a subscription message', async () => {
            const mockWs = new MockWebSocket();
            (client as any).connection = mockWs;

            const subscriptionMessage = {
                action: SubscriptionMessageType.SUBSCRIBE,
                types: [SubscriptionType.PUMPFUN_TOKENS],
            };

            await client.subscribe(FeedType.TOKEN_EVENTS, subscriptionMessage);
            expect(mockWs.send).toHaveBeenCalledWith(
                JSON.stringify(subscriptionMessage)
            );
        });

        it('should throw an error if not connected', async () => {
            const subscriptionMessage = {
                action: SubscriptionMessageType.SUBSCRIBE,
                types: [SubscriptionType.PUMPFUN_TOKENS],
            };

            await expect(
                client.subscribe(FeedType.TOKEN_EVENTS, subscriptionMessage)
            ).rejects.toThrow(VyperWebsocketError);
        });
    });

    describe('unsubscribe', () => {
        it('should send an unsubscription message', async () => {
            const mockWs = new MockWebSocket();
            (client as any).connection = mockWs;

            const unsubscriptionMessage = {
                action: SubscriptionMessageType.UNSUBSCRIBE,
                types: [SubscriptionType.PUMPFUN_TOKENS],
            };

            await client.unsubscribe(
                FeedType.TOKEN_EVENTS,
                unsubscriptionMessage
            );
            expect(mockWs.send).toHaveBeenCalledWith(
                JSON.stringify(unsubscriptionMessage)
            );
        });

        it('should throw an error if not connected', async () => {
            const unsubscriptionMessage = {
                action: SubscriptionMessageType.UNSUBSCRIBE,
                types: [SubscriptionType.PUMPFUN_TOKENS],
            };

            await expect(
                client.unsubscribe(FeedType.TOKEN_EVENTS, unsubscriptionMessage)
            ).rejects.toThrow(VyperWebsocketError);
        });
    });

    describe('listen', () => {
        it('should set up event listeners and resolve when connection opens', async () => {
            const mockWs = new MockWebSocket();
            (client as any).connection = mockWs;

            mockWs.on.mockImplementation(
                (event: string, callback: () => void) => {
                    if (event === 'open') {
                        callback();
                    }
                }
            );

            await expect(client.listen()).resolves.toBeUndefined();
            expect(mockWs.on).toHaveBeenCalledWith(
                'open',
                expect.any(Function)
            );
            expect(mockWs.on).toHaveBeenCalledWith(
                'message',
                expect.any(Function)
            );
            expect(mockWs.on).toHaveBeenCalledWith(
                'close',
                expect.any(Function)
            );
            expect(mockWs.on).toHaveBeenCalledWith(
                'error',
                expect.any(Function)
            );
        });

        it('should handle incoming messages for WALLET_EVENTS', async () => {
            const mockWs = new MockWebSocket();
            (client as any).connection = mockWs;
            (client as any).currentFeedType = FeedType.WALLET_EVENTS;

            const mockHandler = jest.fn();
            client.setMessageHandler(mockHandler);

            let messageCallback: ((data: Buffer) => void) | undefined;
            mockWs.on.mockImplementation(
                (event: string, callback: (data: Buffer) => void) => {
                    if (event === 'message') {
                        messageCallback = callback;
                    } else if (event === 'open') {
                        (callback as () => void)();
                    }
                }
            );

            await client.listen();

            expect(messageCallback).toBeDefined();

            if (messageCallback) {
                const testMessage: ChainAction = {
                    signer: 'test-signer',
                    transactionId: 'test-transaction',
                    marketId: 'test-market',
                    actionType: 'test-action',
                    tokenAmount: 100,
                    assetAmount: 200,
                    tokenPriceUsd: 1.5,
                    tokenPriceAsset: 2,
                    tokenMarketCapAsset: 1000,
                    tokenMarketCapUsd: 1500,
                    tokenLiquidityAsset: 500,
                    tokenLiquidityUsd: 750,
                    pooledToken: 300,
                    pooledAsset: 400,
                    actionTimestamp: 1234567890,
                };
                messageCallback(Buffer.from(JSON.stringify(testMessage)));

                expect(mockHandler).toHaveBeenCalledWith(testMessage);
            } else {
                fail('Message callback was not set');
            }
        });

        it('should handle incoming messages for TOKEN_EVENTS', async () => {
            const mockWs = new MockWebSocket();
            (client as any).connection = mockWs;
            (client as any).currentFeedType = FeedType.TOKEN_EVENTS;

            const mockHandler = jest.fn();
            client.setMessageHandler(mockHandler);

            let messageCallback: ((data: Buffer) => void) | undefined;
            mockWs.on.mockImplementation(
                (event: string, callback: (data: Buffer) => void) => {
                    if (event === 'message') {
                        messageCallback = callback;
                    } else if (event === 'open') {
                        (callback as () => void)();
                    }
                }
            );

            await client.listen();

            expect(messageCallback).toBeDefined();

            if (messageCallback) {
                const testMessage: TokenPair = {
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
                };
                messageCallback(Buffer.from(JSON.stringify(testMessage)));

                expect(mockHandler).toHaveBeenCalledWith(testMessage);
            } else {
                fail('Message callback was not set');
            }
        });
    });

    describe('disconnect', () => {
        it('should close the connection', async () => {
            const mockWs = new MockWebSocket();
            (client as any).connection = mockWs;

            mockWs.on.mockImplementation(
                (event: string, callback: () => void) => {
                    if (event === 'close') {
                        callback();
                    }
                }
            );

            await client.disconnect();
            expect(mockWs.close).toHaveBeenCalled();
            expect((client as any).connection).toBeUndefined();
        });

        it('should handle errors during disconnection', async () => {
            const mockWs = new MockWebSocket();
            (client as any).connection = mockWs;

            mockWs.on.mockImplementation(
                (event: string, callback: (error: Error) => void) => {
                    if (event === 'error') {
                        callback(new Error('Disconnection failed'));
                    }
                }
            );

            await expect(client.disconnect()).rejects.toThrow(
                VyperWebsocketError
            );
        });
    });

    describe('ping and pong', () => {
        it('should send a ping', async () => {
            const mockWs = new MockWebSocket();
            (client as any).connection = mockWs;

            await client.ping();
            expect(mockWs.ping).toHaveBeenCalled();
        });

        it('should send a pong', async () => {
            const mockWs = new MockWebSocket();
            (client as any).connection = mockWs;

            await client.pong();
            expect(mockWs.pong).toHaveBeenCalled();
        });

        it('should throw an error if not connected when trying to ping', async () => {
            await expect(client.ping()).rejects.toThrow(VyperWebsocketError);
        });

        it('should throw an error if not connected when trying to pong', async () => {
            await expect(client.pong()).rejects.toThrow(VyperWebsocketError);
        });
    });
});
