# Sui Wallet Operations Tutorial

A comprehensive tutorial demonstrating automatic wallet discovery, persistent connections, and seamless account management using TypeScript and the Mysten Wallet Standard. Features automatic reconnection and localStorage persistence for an optimal user experience.

Full documentation on which this example is based can be found [here](https://docs.sui.io/standards/wallet-standard#managing-wallets).

## What You'll Learn

This tutorial covers advanced wallet operations for modern Sui dApps:

1. **Automatic Wallet Discovery** - How to automatically find and display wallet extensions on page load
2. **Persistent Wallet Connections** - How to save and restore wallet connections across browser sessions
3. **Silent Auto-Reconnection** - How to reconnect to previously used wallets without user prompts
4. **Account Management** - How to access, display, and persist account selections
5. **Real-time State Management** - How to track and respond to connection changes automatically
6. **Event-Driven Updates** - How to listen for wallet events and update UI seamlessly
7. **localStorage Integration** - How to implement robust connection persistence
8. **Error Handling** - How to gracefully handle connection failures and invalid states

## Key Features

### 🚀 Automatic Experience
- **Zero-click startup**: Wallets load automatically on page load
- **Silent reconnection**: Previously connected wallets reconnect without prompts
- **Persistent selections**: Account choices are remembered across sessions
- **Real-time updates**: UI updates automatically when wallet states change

### 🔧 Technical Implementation
- **Wallet Standard**: Uses `@mysten/wallet-standard` for consistent interactions
- **Event System**: Responds to wallet `change` events for accounts, features, and chains
- **localStorage**: Robust persistence with error handling and cleanup
- **TypeScript**: Full type safety with comprehensive interfaces

### 📱 User Experience
- **Visual indicators**: Clear connection status (● Connected / ○ Disconnected)
- **Smart buttons**: Context-aware Connect/Disconnect buttons
- **Account selection**: Dropdown with persistent choices
- **Loading states**: Smooth transitions with loading feedback

## Connection States & Persistence

### Connection Detection
- **Disconnected**: `wallet.accounts` is empty or undefined
- **Connected**: `wallet.accounts` contains one or more account objects

### Stored Data
The app persists:
```typescript
interface StoredWalletConnection {
  walletName: string;      // e.g., "Sui Wallet"
  accountAddress: string;  // Full Sui address
  accountIndex: number;    // Index in wallet.accounts array
}
```

### Auto-Reconnection Process
1. Load stored connection from localStorage
2. Find matching wallet by name
3. Attempt `connect({ silent: true })`
4. Verify stored account still exists
5. Clean up invalid connections automatically

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

### First Time Setup
1. **Install a Sui Wallet**: Install Sui Wallet, Ethos Wallet, or another Sui-compatible wallet extension
2. **Open the App**: Wallets are discovered and displayed automatically (no button clicks needed)
3. **Connect to a Wallet**: Click "Connect" next to your preferred wallet
4. **Select an Account**: Choose which account to use from the dropdown (first account selected by default)
5. **Connection Saved**: Your choice is automatically saved to localStorage

### Returning User Experience
1. **Automatic Loading**: Open the app and wallets load immediately
2. **Silent Reconnection**: Previously connected wallet reconnects automatically in the background
3. **Restored Selection**: Your previously selected account is automatically chosen
4. **Seamless Experience**: No manual steps required - everything "just works"

### Manual Operations
- **Switch Accounts**: Use the dropdown to select different accounts (choice is saved immediately)
- **Disconnect**: Click "Disconnect" to end the connection and clear saved data
- **Connect Different Wallet**: Disconnect current wallet, then connect to a different one

## Code Structure

### Core Functions

- `displaySuiWallets()`: Main function that discovers wallets, handles auto-connection, and manages UI
- `displayAccounts()`: Shows account information and handles account selection
- `saveWalletConnection()`: Persists wallet and account choice to localStorage
- `loadWalletConnection()`: Retrieves stored connection data
- `autoConnectWallet()`: Attempts silent reconnection to stored wallet

### localStorage Integration

The tutorial demonstrates persistent state management:
- **Connection Storage**: Saves wallet name, account address, and account index
- **Auto-Restoration**: Loads and validates stored connections on startup
- **Cleanup Handling**: Removes invalid or failed connections automatically
- **Real-time Updates**: Saves changes immediately when user switches accounts

### Event System

Comprehensive event handling:
- **Wallet Events**: Listen to `change` events for accounts, features, and chains
- **Automatic Refresh**: UI updates automatically when wallet state changes
- **Event Cleanup**: Proper unsubscribe mechanisms to prevent memory leaks

### Key Dependencies

- `@mysten/wallet-standard`: Official Mysten wallet standard library
- `vite`: Development server and build tool
- `typescript`: Type safety with comprehensive interfaces

## Tutorial Flow

The code demonstrates the complete wallet integration lifecycle:

```typescript
// 1. Automatic wallet discovery on page load
const availableWallets = getWallets().get();

// 2. Attempt auto-connection with stored data
await autoConnectWallet(availableWallets);

// 3. Register event listeners for state changes
const unsubscribe = wallet.features['standard:events'].on('change', callback);

// 4. Check connection state
const isConnected = wallet.accounts && wallet.accounts.length > 0;

// 5. Handle user interactions (connect/disconnect)
await wallet.features['standard:connect'].connect();
await wallet.features['standard:disconnect'].disconnect();

// 6. Persist user choices
saveWalletConnection(walletName, accountAddress, accountIndex);

// 7. Access wallet accounts
wallet.accounts.forEach(account => {
  console.log(account.address, account.publicKey);
});
```

## Advanced Features

### Silent Connection
Uses `connect({ silent: true })` for seamless auto-reconnection without user prompts.

### Connection Validation
Verifies that stored accounts still exist and match before auto-connecting.

### Error Recovery
Automatically cleans up invalid stored connections and gracefully handles failures.

### Memory Management
Proper event listener cleanup with unsubscribe functions to prevent memory leaks.

## Next Steps

After completing this tutorial, you'll understand how to:
- Build seamless wallet experiences with persistent connections
- Implement robust error handling and state management
- Create user-friendly dApps that "remember" user preferences
- Handle complex wallet interactions with proper TypeScript typing
- Design event-driven architectures for responsive wallet integration

## Project Structure

- `src/main.ts`: Complete tutorial implementation with comprehensive documentation
- `index.html`: Minimal HTML structure for the demo
- `vite.config.ts`: Vite configuration for development
- `tsconfig.json`: TypeScript configuration with proper types
- `package.json`: Dependencies and scripts
