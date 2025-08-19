# Sui Wallet Operations Tutorial

A comprehensive tutorial demonstrating how to connect to Sui wallets, disconnect from them, and access wallet accounts using TypeScript and the Mysten Wallet Standard.
Full documentation on which this example based can be found [here](https://docs.sui.io/standards/wallet-standard#managing-wallets).

## What You'll Learn

This tutorial covers the essential wallet operations for Sui dApps:

1. **Wallet Discovery** - How to find available Sui wallet extensions
2. **Wallet Connection** - How to connect to a user's wallet
3. **Wallet Disconnection** - How to properly disconnect from wallets
4. **Account Access** - How to access and display wallet accounts
5. **Connection State Management** - How to track and respond to connection changes
6. **Event Handling** - How to listen for wallet state changes and respond automatically

## Key Concepts

### Wallet Standard
- Uses `@mysten/wallet-standard` for standardized wallet interactions
- All Sui wallets implement the same interface for consistency
- Provides `standard:connect`, `standard:disconnect`, and `standard:events` features

### Connection States
- **Disconnected**: `wallet.accounts` is empty or undefined
- **Connected**: `wallet.accounts` contains one or more account objects

### Event System
The wallet standard defines 'change' events for:
- **accounts**: User added/removed accounts for your app
- **features**: User changed permissions for wallet features
- **chains**: User switched networks (Devnet/Testnet/Mainnet)

### Account Structure
Each account contains:
- `address`: The Sui address (public identifier on the blockchain)
- `publicKey`: The public key for cryptographic operations

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```

2. Start the development server:
   ```sh
   npx vite
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## How to Use

1. **Install a Sui Wallet**: Install Sui Wallet, Ethos Wallet, or another Sui-compatible wallet extension
2. **Click "Show Sui Wallets"**: This discovers all available wallet extensions and registers event listeners
3. **Connect to a Wallet**: Click the "Connect" button next to any wallet
4. **View Accounts**: After connecting, see all accounts associated with that wallet
5. **Select an Account**: Use the dropdown to choose which account to use
6. **Disconnect**: Click "Disconnect" to end the wallet connection
7. **Automatic Updates**: The UI automatically refreshes when wallet states change

## Code Structure

### Main Functions

- `displaySuiWallets()`: Discovers and displays all available wallets, registers event listeners
- `displayAccounts()`: Shows account information for connected wallets

### Event Handling

The tutorial demonstrates how to:
- Register event listeners using `wallet.features['standard:events'].on('change', callback)`
- Handle wallet state changes automatically
- Refresh the UI when accounts, features, or chains change

### Key Dependencies

- `@mysten/wallet-standard`: Official Mysten wallet standard library
- `vite`: Development server and build tool
- `typescript`: Type safety and modern JavaScript features

## Tutorial Flow

The code demonstrates the complete wallet interaction flow:

```typescript
// 1. Discover wallets
const availableWallets = getWallets().get();

// 2. Register event listeners
const unsubscribe = wallet.features['standard:events'].on('change', callback);

// 3. Check connection state
const isConnected = wallet.accounts && wallet.accounts.length > 0;

// 4. Connect to wallet
await wallet.features['standard:connect'].connect();

// 5. Access accounts
wallet.accounts.forEach(account => {
  console.log(account.address, account.publicKey);
});

// 6. Disconnect from wallet
await wallet.features['standard:disconnect'].disconnect();

// 7. Clean up event listeners
unsubscribe();
```

## Next Steps

After completing this tutorial, you can:
- Build transaction signing workflows
- Implement wallet-specific features
- Create multi-wallet dApps
- Add wallet persistence and auto-reconnection

## Project Structure

- `src/main.ts`: Main tutorial code with extensive documentation
- `index.html`: Simple HTML interface
- `vite.config.ts`: Vite development configuration
- `tsconfig.json`: TypeScript configuration
