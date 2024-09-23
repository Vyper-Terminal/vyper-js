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
                    tokenPriceUsd: 1.5,
                    tokenPriceAsset: 2,
                    tokenMarketCapAsset: 1000,
                    tokenMarketCapUsd: 1500,
                    tokenLiquidityAsset: 500,
                    tokenLiquidityUsd: 750,
                    pooledAsset: 400,
                    pooledToken: 300,
                    buyTxnCount: 50,
                    sellTxnCount: 30,
                    chainId: 1,
                    contractCreator: 'test-creator',
                    createdTimestamp: 1234567890,
                    lpBurned: false,
                    lpCreator: 'test-lp-creator',
                    priceChangePercent: 5,
                    top10HoldingPercent: 60,
                    totalSupply: 1000000,
                    transactionCount: 80,
                    volumeAsset: 10000,
                    volumeUsd: 15000,
                    initialAssetLiquidity: 5000,
                    initialUsdLiquidity: 7500,
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
