# Vyper API TypeScript SDK

![Vyper](https://images.vyper.trade/0000/vyper-header)

A TypeScript SDK for interacting with the [Vyper API](https://build.vyper.trade/). This library allows developers to integrate Vyper's http and websocket api into their TypeScript applications with ease.

## Table of Contents

- [Vyper API TypeScript SDK](#vyper-api-typescript-sdk)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
    - [Using npm:](#using-npm)
    - [Using pnpm:](#using-pnpm)
    - [Using yarn:](#using-yarn)
  - [Quick Start](#quick-start)
  - [Usage](#usage)
    - [Client Initialization](#client-initialization)
    - [REST API Example](#rest-api-example)
    - [WebSocket API Example](#websocket-api-example)
  - [API Documentation](#api-documentation)

## Installation

To install the Vyper API TypeScript SDK, use npm, pnpm, or yarn:

### Using npm:

```bash
npm install vyper-client-ts
```

### Using pnpm:

```bash
pnpm add vyper-client-ts
```

### Using yarn:

```bash
yarn add vyper-client-ts
```

## Quick Start

Here's a simple example to get you started:

```ts
import { VyperClient } from 'vyper-client-ts';

// Initialize the client with your API key
const client = new VyperClient('your_api_key_here');

// Get the list of chain IDs supported by Vyper
client
    .getChainIds()
    .then((chainIds) => {
        console.log('Supported chain IDs:', chainIds);
    })
    .catch(console.error);
```

## Usage

### Client Initialization

The `VyperClient` class provides access to the RESTful API endpoints:

```ts
import { VyperClient } from 'vyper-client-ts';

// Create a client instance
const client = new VyperClient('your_api_key_here');
```

### REST API Example

Retrieve the market data for a specific token:

```ts
// Fetch the All-Time High (ATH) data for a token
client
    .getTokenAth(1, 'AVs9TA4nWDzfPJE9gGVNJMVhcQy3V9PGazuz33BfG2RA')
    .then((tokenAth) => {
        console.log(`Market Cap USD: ${tokenAth.market_cap_usd}`);
        console.log(`Timestamp: ${tokenAth.timestamp}`);
    })
    .catch(console.error);
```

### WebSocket API Example

```ts
import {
    VyperWebsocketClient,
    FeedType,
    SubscriptionType,
} from 'vyper-client-ts';

const wsClient = new VyperWebsocketClient('your_api_key_here');

// Define a message handler
const messageHandler = (message: any) => {
    console.log('Received message:', message);
};

wsClient.setMessageHandler(messageHandler);

// Connect to the WebSocket and subscribe to token events
wsClient
    .connect(FeedType.TOKEN_EVENTS)
    .then(() => {
        return wsClient.subscribe(FeedType.TOKEN_EVENTS, {
            action: 'subscribe',
            types: [SubscriptionType.PUMPFUN_TOKENS],
        });
    })
    .then(() => {
        console.log('Subscribed to token events');
        return wsClient.listen();
    })
    .catch(console.error);
```

## API Documentation

For detailed information on the Vyper API, refer to the official documentation:

-   API Dashboard: [Vyper Dashboard](https://build.vyper.trade/)
-   API Documentation: [Vyper API Docs](ttps://docs.vyper.trade/)
